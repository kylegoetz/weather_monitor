__author__ = 'kylegoetz'
import cherrypy
import sys

sys.path.append('/usr/local/bin/')
from Weatherstation.api import Entry, Rain_Entry, Temperature_Entry, Wind_Entry, Temperature_Min_Max

if __name__ == '__main__':
	cherrypy.config.update({'server.socket_host': '127.0.0.1', 'server.socket_port': 8081})
	cherrypy.tree.mount(
		Entry(), '/weather_monitor/api/v1.0/weather_entry',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.tree.mount(
		Rain_Entry(), '/weather_monitor/api/v1.0/rain',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.tree.mount(
		Temperature_Entry(), '/weather_monitor/api/v1.0/temperature',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.tree.mount(
		Temperature_Min_Max(), 'weather_monitor/api/v1.0/temperature_range',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.tree.mount(
		Wind_Entry(), '/weather_monitor/api/v1.0/wind',
		{
			'/': {
				'request.dispatch': cherrypy.dispatch.MethodDispatcher()
			}
		}
	)
	cherrypy.engine.start()
	cherrypy.engine.block()
