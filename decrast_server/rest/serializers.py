from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.core.validators import RegexValidator
from .models import User
from .models import Category
from .models import Task

import time
import datetime

'''
Helper classes / methods
'''
class TimestampField(serializers.Field):
	def to_representation(self, value):
		return time.mktime(value.timetuple())

'''
Resource Serializer
'''
class UserSerializer(serializers.ModelSerializer):
	userId = serializers.IntegerField(source='id', read_only=True)

	class Meta:
		model = User
		fields = ('userId', 'username')
		read_only_fields = ('userId', 'username')

class TaskSerializer(serializers.ModelSerializer):
	taskId = serializers.IntegerField(source='id', read_only=True)
	deadline = TimestampField(read_only=True)

	class Meta:
		model = Task
		fields = ('taskId', 'name', 'owner', 'viewer', 'deadline', 'description', 'category')
		read_only_fields = ('taskId', 'owner', 'viewer', 'deadline')

class CategorySerializer(serializers.ModelSerializer):
	categoryId = serializers.IntegerField(source='id', read_only=True)

	class Meta:
		model = Category
		fields = ('categoryId', 'name')

'''
ID Serializers
'''
class TaskIdSerializer(serializers.Serializer):
	taskId = serializers.IntegerField(source='id')

class NotificationIdSerializer(serializers.Serializer):
	notificationId = serializers.IntegerField(source='id')