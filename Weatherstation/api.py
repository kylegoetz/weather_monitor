import cherrypy, json, datetime
from itertools import groupby, imap

from models.weatherstation_entry import Weatherstation_Entry, WindSpeed, WindDirection, Temperature, Humidity, Rain, \
	Daily_Temp_Min_Max
from decimal import Decimal
from time import mktime, localtime
from peewee import IntegrityError, fn
import logging

logging.basicConfig(filename='/var/log/weathermonitor.log', level=logging.DEBUG)

HARD_LIMIT = 1000


class Wind_Entry:
	exposed = True

	def GET(self, start=None, end=None):
		if start is None:
			start = 0
		else:
			start = int(start)
		if end is None:
			end = int(mktime(localtime()))
		else:
			end = int(end)
		rv = [{'direction': _.windDirection.direction, 'speed': round(Decimal(str(_.windSpeed.speed)) / 10, 1),
		       'time': _.windSpeed.time} for _ in
		      Weatherstation_Entry.select().join(WindSpeed).where(WindSpeed.speed > 0).where(
			      WindSpeed.time > start).where(WindSpeed.time < end).order_by(WindSpeed.time.asc())]
		slice = len(rv) / HARD_LIMIT if len(rv) > 0 else 1
		return json.dumps(rv if 0 < len(rv) < HARD_LIMIT else rv[::slice])


class Temperature_Min_Max:
	exposed = True

	def GET(self, start=None, end=None):
		if start is None:
			start = 0
		else:
			start = int(start)
		if end is None:
			end = int(mktime(localtime()))
		else:
			end = int(end)
		entries = [_ for _ in Daily_Temp_Min_Max.select().where((Daily_Temp_Min_Max.time > start) & (Daily_Temp_Min_Max.time < end))]

		def adjustdecimals(item):
			time = item.time
			minimum = item.minTemp
			maximum = item.maxTemp
			tempDate = item.tempDate
			return {'time': time, 'minimum': round(Decimal(str(minimum)) / 10, 1),
			        'maximum': round(Decimal(str(maximum)) / 10, 1), 'date': tempDate}

		entries = map(adjustdecimals, entries)

		binned = {}

		for entry in entries:
			year, month, day = entry['date'].split('-')
			if year + '-' + month in binned:
				binned[year + '-' + month].append(entry)
			else:
				binned[year + '-' + month] = [entry]


		minmax = map(lambda x: [min([_['minimum'] for _ in binned[x]]),
		                        max([_['maximum'] for _ in binned[x] if _['maximum'] < 130])], binned)
		# entries = map(getminmax, entries)
		return json.dumps(minmax)


class Temperature_Entry:
	exposed = True

	def GET(self, start=None, end=None):
		HARD_LIMIT = 50
		if start is None:
			start = 0
		else:
			start = int(start)
		if end is None:
			end = int(mktime(localtime()))
		else:
			end = int(end)
		entries = [{'time': _.time * 1000, 'temperature': round(Decimal(str(_.temperature)) / 10, 1)} for _ in
		           Temperature.select().order_by(Temperature.time.desc()).where(Temperature.time > start & Temperature.time < end)]
		return json.dumps(entries if 0 < len(entries) < HARD_LIMIT else entries[::len(entries) / HARD_LIMIT])

lastseen = 0
class Rain_Entry:
	exposed = True

	def GET(self, start=None, end=None):
		if start is None:
			start = 1420091487
		else:
			start = int(start)
		if end is None:
			end = int(mktime(localtime()))
		else:
			end = int(end)
		entries = [{'rc': _.rc, 'time': _.time * 1000} for _ in
		           Rain.select().order_by(Rain.time).where(Rain.time.between(start, end))]
		seen = []

		def isnotrepeat(item):
			global lastseen
			rv = (lastseen != item['rc'])
			lastseen = item['rc']
			return rv

		def discardDupes(item):
			if item['rc'] not in seen:
				seen.append(item['rc'])
				return True
			return False

		return json.dumps(
			filter(isnotrepeat, entries))  # probably best to mod it by 128 for change SS rather than client side


class Entry:
	exposed = True

	def GET(self, start=None, end=None):
		MAX_WANT = 20
		if start is None:
			start = 1420091487
		else:
			start = int(start)
		if end is None:
			end = int(mktime(localtime()))
		else:
			end = int(end)
		entries = [_ for _ in  # Weatherstation_Entry.select().limit(10)]
		           Weatherstation_Entry.select().join(Rain).order_by(Weatherstation_Entry.id.desc()).where(
			           Rain.time.between(start, end) & (
				           Weatherstation_Entry.id - Weatherstation_Entry.id / 1000 * 1000 == 0))]

		# return json.dumps(entries[::len(entries)/MAX_WANT])
		def mapper(entry):
			return {'time': entry.rain.time, 'rc': entry.rain.rc, 'speed': entry.windSpeed.speed / 10.0,
			        'direction': entry.windDirection.direction, 'temp': entry.temperature.temperature / 10.0,
			        'humidity': entry.humidity.humidity}

		return json.dumps(map(mapper, entries))

	# @cherrypy.tools.json_in()
	# @cherrypy.tools.json_out()
	def POST(self, str_data=None):
		data = json.loads(str_data)
		duplicates = 0
		logging.debug('Data to insert:' + str_data)

		try:
			ws = WindSpeed.create(speed=int(Decimal(data['windSpeed']['WS']) * 10), time=data['windSpeed']['t'])
		except IntegrityError:
			ws = WindSpeed.get(WindSpeed.time == data['windSpeed']['t'])
			duplicates += 1
			logging.warning('Duplicate windspeed')
		try:
			wd = WindDirection.create(direction=data['windDirection']['WD'], time=data['windDirection']['t'])
		except IntegrityError:
			wd = WindDirection.get(time=data['windDirection']['t'])
			duplicates += 1
			logging.warning('Duplicate wind direction')
		try:
			t = Temperature.create(temperature=int(Decimal(data['temperature']['T']) * 10),
			                       time=data['temperature']['t'])
		except IntegrityError:
			t = Temperature.get(Temperature.time == data['temperature']['t'])
			duplicates += 1
			logging.warning('Duplicate temperature')
		try:
			h = Humidity.create(humidity=int(Decimal(data['humidity']['H'])), time=data['humidity']['t'])
		except IntegrityError:
			h = Humidity.get(Humidity.time == data['humidity']['t'])
			duplicates += 1
			logging.warning('Duplicate humidity')
		try:
			r = Rain.create(rc=int(Decimal(data['rainCounter']['RC'])), time=data['rainCounter']['t'])
		except IntegrityError:
			r = Rain.get(Rain.time == data['rainCounter']['t'])
			duplicates += 1
			logging.warning('Duplicate rain')
		if duplicates != 5:
			try:
				Weatherstation_Entry.create(windSpeed=ws, windDirection=wd, temperature=t, humidity=h, rain=r)
			except IntegrityError as e:
				logging.error('Duplicate entry.')
				return json.dumps({'status': 'error', 'message': e.message})
			logging.debug('Successfully inserted weather entry.')
		else:
			logging.debug('Did not insert weather entry. It is a duplicates')
		return json.dumps({'status': 'OK'})


if __name__ == '__main__':
	cherrypy.tree.mount(
		Entry(), '/api/v1.0/weather_entry',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.tree.mount(
		Rain_Entry(), '/api/v1.0/rain',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.tree.mount(
		Temperature_Entry(), '/api/v1.0/temperature',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.tree.mount(
		Temperature_Min_Max(), '/api/v1.0/temperature_range',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.tree.mount(
		Wind_Entry(), '/api/v1.0/wind',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.engine.start()
	cherrypy.engine.block()


