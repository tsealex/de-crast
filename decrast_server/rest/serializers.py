from rest_framework import serializers
from .models import User
from .models import Category
from .models import Task

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('id', 'username')

class ModelSerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = ('id', 'name', 'user')

class TaskSerializer(serializers.ModelSerializer):
	class Meta:
		model = Task
		fields = ('id', 'name', 'owner', 'viewer', 'deadline', 'last_notify_ts', 'category')
