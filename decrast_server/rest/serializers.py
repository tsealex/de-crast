from rest_framework import serializers
from .models import User
from .models import Category
from .models import Task

import time

class TimestampField(serializers.Field):
	def to_representation(self, value):
		return time.mktime(value.timetuple())



class UserSerializer(serializers.ModelSerializer):
	userId = serializers.IntegerField(source='id')

	class Meta:
		model = User
		fields = ('userId', 'username')

class TaskSerializer(serializers.ModelSerializer):
	taskId = serializers.IntegerField(source='id')
	deadline = TimestampField()
	class Meta:
		model = Task
		fields = ('taskId', 'name', 'owner', 'viewer', 'deadline', 'description', 'category')

class CategorySerializer(serializers.ModelSerializer):
	categoryId = serializers.IntegerField(source='id')

	class Meta:
		model = Category
		fields = ('categoryId', 'name')

'''
ID Serializers
'''
class TaskIdSerializer(serializers.ModelSerializer):
	taskId = serializers.IntegerField(source='id')
	class Meta:
		model = Task
		fields = ('taskId',)

