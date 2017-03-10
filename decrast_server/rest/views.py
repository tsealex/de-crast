from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
import datetime

from .models import User
from .serializers import UserSerializer

# ref: https://docs.djangoproject.com/en/1.10/topics/db/queries/

# Create your views here.
class UserViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)
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
		try:
			user = None
			fb_id = request.data['facebookId']
			fb_token = request.data['facebookToken']

			# TODO: input check

			# TODO: authenticate the user with FB server		

			# try to get the user, else create a new user here
			try:
				user = User.objects.get(fb_id=fb_id)
			except:
				pass

			if user is None:
				user = User.objects.create_user(fb_id=fb_id)

			# TODO: access token, refresh token

			response = self.pack(user, 'no_access_token_available', 
				'no_refresh_token_available', datetime.datetime.now()
				+ datetime.timedelta(weeks = 2))
			return Response(response)
		except:
			pass

		# for old user who wants to refresh the access token
		try:
			uid = request.data['userId']
			dc_token = request.data['refreshToken']

			# TODO: input check

			if not User.objects.filter(id=uid).exists():
				return Response({'error': 'user does not exist'})

			# TODO: verify and refresh the token (also handle errors)

			user = User.objects.get(id=uid)
			response = self.pack(user, 'no_access_token_available', 
				'no_refresh_token_available', datetime.datetime.now()
				+ datetime.timedelta(weeks = 2))
			return Response(response)
		except:
			pass

		return Response({'error': 'malformatted request'})	

	'''
	For initializing the username
	'''
	def update(self, request, pk=None):
		# TODO: we're supposed to authenticate the user first
		# but for now, we let the client to pass the uid through the request body

		# TODO: this will be edited after authentication is implemented
		# as we probably don't need a try block, it's not possible that a user
		# doesn't exist but the access token is valid
		try:
			uid = request.data['userId']
			username = request.data['username']

			# TODO: input check

			# TODO: this will be removed
			if not User.objects.filter(id=uid).exists():
				return Response({'error': 'user does not exist'})

			user = User.objects.get(id=uid)

			if user.username is not None:
				return Response({'error': 'username has been specified'})

			# TODO: check if it's a valid username

			user.username = username
			user.save()

			response = {
				'userId': user.id,
				'username': user.username
			}
			return Response(response)
		except:
			return Response({'error': 'malformatted request'})

	def pack(self, user, ac_tk, rf_tk, exp):
		return {
			'userId': user.id,
			'username': user.username,
			'accessToken': ac_tk,
			'refreshToken': rf_tk,
			'tokenExpiration': exp,
		}
		