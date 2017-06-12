#!/usr/bin/env python
from subprocess import Popen, PIPE
import logging
import pika
import socket
import requests
import sys
import json
import instapush

QUEUE = 'weathermonitor'
MONITOR_HOST = 'kylegoetz.ddns.net'
USR = 'www'
PWD = 'NebzrzG-2YSVHNA70tHs'

host = socket.gethostname()
if host == 'www':  # receiver
	# logging.basicConfig(filename='/var/log/weathermonitor/rabbitmq.err', level=logging.DEBUG)
	# logger = logging.getLogger(__name__)
	credentials = pika.PlainCredentials(USR, PWD)
	connection = pika.BlockingConnection(pika.ConnectionParameters(host=MONITOR_HOST, credentials=credentials))
	channel = connection.channel()
	channel.queue_declare(queue=QUEUE)

	def callback(ch, method, properties, body):
		print 'http://127.0.0.1/weather_monitor/api/v1.0/weather_entry/{0}'.format(body)
		try:
			requests.post('http://127.0.0.1/weather_monitor/api/v1.0/weather_entry/{0}'.format(body))
		except:
			instapush.send_message('Weather_Failed', {'error': sys.exc_info()})

	channel.basic_consume(callback, queue=QUEUE, no_ack=True)
	channel.start_consuming()
else:  # sender
	connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
	channel = connection.channel()
	channel.queue_declare(queue=QUEUE)

	proc = Popen(['/home/debian/weatherstation'], stdout=PIPE)
	logging.basicConfig(filename='/home/debian/weathermonitor.log', level=logging.DEBUG)
	logging.debug('Starting to poll the weather station daemon')

	while proc.poll() is None:
		output = proc.stdout.readline()
		if len(output) > 0 and output[0] == '{':
			logging.debug('http://kylegoetz.com/weather_monitor/api/v1.0/weather_entry/{0}'.format(output))
			channel.basic_publish(exchange='', routing_key='weathermonitor', body=output)
	logging.debug('Weathermonitor EXE is has terminated - shutting down the python listener')
	connection.close()