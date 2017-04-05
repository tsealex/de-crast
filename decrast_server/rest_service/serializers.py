from rest_framework import serializers

from .models import *
from .user import User
from .settings import rest_settings
from .factories import TimestampField

'''
Resource Serializers
'''
class UserSerializer(serializers.ModelSerializer):
	userId = serializers.IntegerField(source='id', read_only=True)

	class Meta:
		model = User
		fields = ('userId', 'username', 'karma')

class CategorySerializer(serializers.ModelSerializer):
	categoryId = serializers.IntegerField(source='id', read_only=True)

	class Meta:
		model = Category
		fields = ('name', 'categoryId')

class TaskSerializer(serializers.ModelSerializer):
	taskId = serializers.IntegerField(source='id', read_only=True)
	deadline = TimestampField()

	class Meta:
		model = Task
		fields = ('owner', 'viewers', 'category', 'taskId', 'description', 
			'last_notify_ts', 'deadline', 'name', 'ended')

class NotificationSerializer(serializers.ModelSerializer):
	notificationId = serializers.IntegerField(source='id', read_only=True)
	# TODO: do something with the file (path)

	class Meta:
		model = Notification
		fields = ('sender', 'recipient', 'type', 'sent_date',
			'notificationId', 'task', 'metadata', 'file', 'text')

class ConsequenceSerializer(serializers.ModelSerializer):
	taskId = serializers.IntegerField(source='task_id', read_only=True)

	class Meta:
		model = Consequence
		fields = ('message', 'taskId', 'file')

class EvidenceSerializer(serializers.ModelSerializer):
	taskId = serializers.IntegerField(source='task_id', read_only=True)
	upload_date = TimestampField()

	class Meta:
		model = Evidence
		fields = ('type', 'taskId', 'upload_date', 'file')

'''
Id Serializers
'''
class TaskIdSerializer(serializers.ModelSerializer):
	taskId = serializers.IntegerField(source='id', read_only=True)

	class Meta:
		model = Task
		fields = ('taskId',)

class NotificationIdSerializer(serializers.ModelSerializer):
	notificationId = serializers.IntegerField(source='id', read_only=True)

	class Meta:
		model = Notification
		fields = ('notificationId',)

class UserIdSerializer(serializers.ModelSerializer):
	userId = serializers.IntegerField(source='id', read_only=True)

	class Meta:
		model = User
		fields = ('userId',)