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
		# TODO: Remove 'fcm_token' from the serializer (using for testing)
		fields = ('userId', 'username', 'karma', 'fcm_token')

class CategorySerializer(serializers.ModelSerializer):
	categoryId = serializers.IntegerField(source='id', read_only=True)

	class Meta:
		model = Category
		fields = ('name', 'categoryId')

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


class TaskSerializer(serializers.ModelSerializer):
	taskId = serializers.IntegerField(source='id', read_only=True)
	evidence = EvidenceSerializer()
	deadline = TimestampField()

	class Meta:
		model = Task
		fields = ('owner', 'viewers', 'category', 'taskId', 'description', 
			'last_notify_ts', 'deadline', 'name', 'ended', 'evidence')

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
