__author__ = 'kylegoetz'

from peewee import SqliteDatabase, Model, FloatField, ForeignKeyField, IntegerField, DateTimeField, CharField, Expression
from playhouse.sqlite_ext import SqliteExtDatabase

#def mod(lhs, rhs):
#	return Expression(lhs, 'mod', rhs)

#SqliteDatabase.register_ops({'mod': '%'})

import socket
if socket.gethostname() == 'www':
	database = SqliteExtDatabase('/var/lib/weather_monitor/weatherstation.sqlite', check_same_thread=False)
else:
	database = SqliteExtDatabase('/Users/kylegoetz/Desktop/weatherstation.sqlite', check_same_thread=False)

@database.func(name='daystring', num_params=1)
def daystring(timestamp):
	pass

@database.aggregate(num_params=1, name='stddev')
class Standard_Deviation(object):
  def __init__(self):
    self.nums = []
  def average(self, s):
    return sum(s)*1.0/len(s)
  def step(self, value):
    self.nums.append(value)
    #avg = self.average(self.nums)
    #variance = map(lambda x: (x-avg)**2, self.nums)
    #self.s = self.average(variance)**.5
  def finalize(self):
    avg = self.average(self.nums)
    variance = map(lambda x: (x-avg)**2, self.nums)
    return self.average(variance)**.5

def before_request_handler():
	database.connect()


def after_request_handler():
	database.close()


class Base(Model):
	class Meta:
		database = database


class WindSpeed(Base):
	speed = IntegerField()
	time = DateTimeField(unique=True)


class WindDirection(Base):
	direction = CharField()
	time = DateTimeField(unique=True)


class Temperature(Base):
	temperature = IntegerField()
	time = DateTimeField(unique=True)


class Humidity(Base):
	humidity = IntegerField()
	time = DateTimeField(unique=True)


class Rain(Base):
	rc = IntegerField()
	time = DateTimeField(unique=True)

class Daily_Temp_Min_Max(Base):
	maxTemp = FloatField()
	minTemp = FloatField()
	time = DateTimeField(primary_key=True)
	tempDate = CharField()

	class Meta:
		db_table = 'daily_temp_min_max'
		database = database

class Weatherstation_Entry(Base):
	windSpeed = ForeignKeyField(WindSpeed)
	windDirection = ForeignKeyField(WindDirection)
	temperature = ForeignKeyField(Temperature)
	humidity = ForeignKeyField(Humidity)
	rain = ForeignKeyField(Rain)

	class Meta:
		indexes = ((('windSpeed', 'windDirection', 'temperature', 'humidity', 'rain'), True),)


if __name__ == '__main__':
	before_request_handler()
	tables = [WindSpeed, WindDirection, Temperature, Humidity, Rain, Weatherstation_Entry]
	for table in tables:
		table.create_table()
	after_request_handler()
