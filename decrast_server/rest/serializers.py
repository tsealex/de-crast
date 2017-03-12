from rest_framework import serializers
from .models import User
from .models import Category

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('id', 'username')

class ModelSerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = ('id', 'name', 'user')
