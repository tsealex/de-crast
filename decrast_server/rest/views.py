from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated

import datetime
import time

from .auth.serializers import JWTSerializer, RefreshSerializer
from .auth.auth import JWTAuthentication
from .errors import APIError
from .models import User
from .models import Category
from .serializers import UserSerializer
from .serializers import ModelSerializer

# ref: https://docs.djangoproject.com/en/1.10/topics/db/queries/

# Create your views here.

'''

'''
class AuthViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)
	authentication_classes = ()
	permission_classes = ()

	'''
	For testing purpose only
	'''
	def list(self, request):
		queryset = User.objects.all()
		serializer = UserSerializer(queryset, many=True)
		return Response(serializer.data)

	'''
	For creating a user object
	'''
	def create(self, request):
		# for new user who wants to register
		if request.data.get('facebookToken') is not None:
			validator = JWTSerializer(data={
					'fb_id': request.data.get('facebookId'),
					'fb_tk': request.data.get('facebookToken'),
				})
			# TODO: input check
			if validator.is_valid():
				return Response({
					'userId': validator.object.get('user').id,
					'accessToken': validator.object.get('ac_tk'),
					'refreshToken': validator.object.get('rf_tk'),
					'tokenExpiration': time.mktime(validator.object.get('ac_exp').timetuple()),
				})
		else:
			# for old user who wants to refresh the access token
			uid = request.data.get('userId')
			rf_token = request.data.get('refreshToken')
			# TODO: input check
			validator = RefreshSerializer(data={
					'uid': uid,
					'rf_tk': rf_token,
				})
			if validator.is_valid():
				return Response({
					'userId': validator.object.get('user').id,
					'accessToken': validator.object.get('ac_tk'),
					'refreshToken': validator.object.get('rf_tk'),
					'tokenExpiration': time.mktime(validator.object.get('ac_exp').timetuple()),
				})

'''

'''
class UserViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)
	permission_classes = (IsAuthenticated,)

	'''
	For testing purpose only
	'''
	def list(self, request):
		queryset = User.objects.all()
		serializer = UserSerializer(queryset, many=True)
		return Response(serializer.data)

	'''
	For initializing the username
	'''
	def update(self, request, pk=None):
		try:
			uid = request.data['userId']
			username = request.data['username']
			# TODO: input check
			user = request.user

			if uid != user.id:
				raise APIError(160)

			if user.username is not None:
				raise APIError(125, details='username has been specified')

			# TODO: check if it's a valid username

			user.username = username
			user.save()

			return Response({
				'userId': user.id,
				'username': user.username
			})
		except KeyError:
			raise APIError(100)
		

class CategoryViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)
	serializer = ModelSerializer()

	def add(self, request, pk=None):
		try:
			user = request.user
			cat_name = request.data['categoryName']

			category = Category.objects.create(categoryName=cat_name, userId=user)
			category.save()

			return Response({"categoryId": str(category.categoryId)})

		except KeyError:
			raise APIError(100)
		except Exception as e:
			print("Category Add ERROR: " + str(e))
			raise APIError(170)

	def list(self, request, pk=None):

		try:
			queryset = Category.objects.get_user_categories(request.user.id)
			serializer = ModelSerializer(queryset, many=True)
			return Response(serializer.data)

		except KeyError:
			raise APIError(100)
		except Exception as e:
			print("Category List ERROR: " + str(e))
			raise APIError(170)
