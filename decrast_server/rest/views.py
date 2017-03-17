from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated

import datetime
import time
import http.client
import json
import os
import re

from .auth.serializers import JWTSerializer, RefreshSerializer
from .auth.auth import JWTAuthentication
from .errors import APIError
from .models import *
from .serializers import *

APP_ID = "859339004207573"

# ref: https://docs.djangoproject.com/en/1.10/topics/db/queries/

# Create your views here.

'''

'''
class AuthViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)
	authentication_classes = ()
	permission_classes = ()

	app_access_token = ''

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
				# TODO: Uncomment this line to perform FB token validation
				# self.validate_fb_token(request.data['facebookToken'])

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
	Validate the provided Facebook token.
	'''
	def validate_fb_token(self, fb_token):
		self.app_access_token = self.get_app_access_token()
		legal_token = self.verify_fb_token(fb_token)
		if(legal_token == False):
			raise APIError(110)

	'''
	This function gets our application's access token.
 	The application access token is used to verify a user's
 	Facebook access token for authorization.

	Per: https://developers.facebook.com/docs/facebook-login/access-tokens#apptokens
	'''
	def get_app_access_token(self):

		try:
			# App's secret key is stored in a local env var.
			secret_key = os.environ['FB_SECRET_KEY']

			conn = http.client.HTTPSConnection("graph.facebook.com")
			conn.request("GET", "/oauth/access_token?client_id={}&client_secret={}&" \
				"grant_type=client_credentials".format(APP_ID, secret_key))
			resp = conn.getresponse()
			resp_str = resp.read().decode("utf-8")
			equals_index = resp_str.index('=')

			return resp_str[(equals_index+1):]

		except ValueError as ve:
			print("Illegal access token response: " + str(ve))
			raise APIError(170)
		except Exception as e:
			print("Access token response error: " + str(e))
			raise APIError(170)

	'''
	This function checks to see if the provided FB user access
	token is valid.

	Per: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow#checktoken
	'''
	def verify_fb_token(self, fb_token):
		conn = http.client.HTTPSConnection("graph.facebook.com")
		conn.request("GET", "/debug_token?input_token={}&access_token={}"
			.format(fb_token, self.app_access_token))
		resp = conn.getresponse()
		bytes = resp.read()

		as_json = json.loads(bytes.decode("utf-8"))
		return as_json['data']['is_valid']

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
				raise APIError(125, 'username has been specified')

			# TODO: check if it's a valid username
			# TODO: check if username has been taken by others

			user.username = username
			user.save()

			return Response({
				'userId': user.id,
				'username': user.username
			})
		except KeyError:
			raise APIError(100)

'''

'''
class CategoryViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)

	'''
	Create a category: /user/categories/ PUT
	'''
	def create(self, request):
		try:
			cat_name = request.data['name']
			# TODO: input check
			# TODO: check if cat_name is a valid category name
			# TODO: investigate if we can use user.category_set here
			cat, created = Category.objects.get_or_create(
				name=cat_name,
				user=request.user
			)
			if not created: raise APIError(190, 'category name')
			cat.save()
			return Response(CategorySerializer(cat).data)
		except KeyError: # malformed body
			raise APIError(100)

	'''
	Update a category: /user/categories/id/ PUT
	'''
	def update(self, request, query):
		ids = extract_ids(query)
		if len(ids) != 1: raise APIError(195, 'more than one id')
		try:
			cat_name = request.data['name']
			# TODO: input check
			# TODO: check if cat_name is a valid category name
			cat = request.user.category_set.get(id=ids[0])
			cat.name = cat_name
			cat.save()
			return Response(CategorySerializer(cat).data)
		except KeyError: # malformed body
			raise APIError(100)
		except ObjectDoesNotExist:
			raise APIError(180, 'category id')
				
	'''
	List all user's categories: /user/categories/ GET
	'''
	def list(self, request, pk=None):
		try:
			queryset = request.user.category_set.all()
			serializer = CategorySerializer(queryset, many=True)
			return Response(serializer.data)
		except KeyError:
			raise APIError(100)

'''

'''
class OwnedTaskViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)

	'''
	List all user's tasks: /user/tasks/ GET
	'''
	def list(self, request):
		quesyset = request.user.owned_tasks.all()
		return Response(TaskIdSerializer(quesyset, many=True).data)

	''''
	Create a task: /user/tasks/ POST
	'''
	def create(self, request):
		user = request.user
		t_deadline = datetime.datetime.fromtimestamp(request.data['deadline'])
		t_category = request.data.get('category', None)

		try:
			t_name = request.data['name']
			t_desc = request.data['description']
			# TODO: input check
			if t_category is not None:
				t_category = user.category_set.get(id=t_category)

			task = Task(name=t_name, description=t_desc, deadline=t_deadline, 
				owner=user, last_notify_ts=datetime.datetime.now())

			if t_category is not None:
				task.category = t_category

			task.save()
			return Response({'taskId': task.id})
		except KeyError: # malformed body
			raise APIError(100)
		except ObjectDoesNotExist:
			raise APIError(180, 'category id')

'''
The Task view set class implementation.
'''
class TaskViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)

	'''
	Get tasks by id(s): /user/tasks/?id&.../ GET
	'''
	def retrieve(self, request, query):
		ids = extract_ids(query)
		user = request.user
		
		queryset = Task.objects.filter(pk__in=ids)
		queryset = queryset.filter(viewer=user) | queryset.filter(owner=user)
		serializer = TaskSerializer(queryset, many=True)
		return Response(serializer.data)

	'''
	Update the task info: /user/tasks/?id/ POST
	'''
	def update(self, request, query):
		ids = extract_ids(query)
		if len(ids) != 1: raise APIError(195, 'more than one id')
		
		try:
			t_name = request.data['name']
			t_desc = request.data['description']
			t_category = request.data.get('category', None)

			if t_category is not None:
				t_category = user.category_set.get(id=t_category) 

			# TODO: input check

			if not request.user.owned_tasks.filter(id=ids[0]).exists():
				raise APIError(180, 'task id')

			curr_task = request.user.owned_tasks.get(id=ids[0])
			curr_task.name = t_name
			curr_task.description = t_desc

			if t_category is not None:
				curr_task.category = t_category

			curr_task.save()
			return Response({'taskId': curr_task.id})
		except KeyError:
			raise APIError(100)
		except ObjectDoesNotExist:
			raise APIError(180, 'category id')

'''

'''
class ViewedTaskViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)

	''''
	List all viewing tasks: /user/tasks/viewing/ GET
	'''
	def list(self, request):
		quesyset = request.user.viewing_tasks.all()
		return Response(TaskIdSerializer(quesyset, many=True).data)

'''

'''
class SpecialViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)
	'''

	'''
	def perform_action(self, request, action, query):
		if action == 0: # add user to be the viewer of a task
			ids = extract_ids(query)
			if len(ids) != 1: raise APIError(195, 'more than one id')
			# TODO: check if user has been invited for viewing a task
			queryset = Task.objects.filter(id=ids[0])
			if queryset.exists():
				task = queryset.get()
				task.viewer = request.user
				task.save()
				return Response({'success': True})
		elif action == 4: # change deadline
			ids = extract_ids(query)
			if len(ids) != 1: raise APIError(195, 'more than one id')
			queryset = request.user.viewing_tasks.filter(id=ids[0])
			if not queryset.exists():
				return Response({'success': False})
			# TODO: change the deadline to the one specified in the notification
			return Response({'success': True})

		return Response({'success': False})

	'''

	'''
	def get_user_friends(self, request, query):
		# TODO: may need to change in the future
		fb_ids = extract_ids(query)
		queryset = User.objects.filter(fb_id__in=fb_ids)
		serializer = UserSerializer(queryset, many=True)
		return Response(serializer.data)

	'''

	'''
	def search_user(self, request, username):
		# TODO: input check
		queryset = User.objects.filter(username__contains=username)
		serializer = UserSerializer(queryset, many=True)
		return Response(serializer.data)

'''
Returns a list of ids extracted from the url query string
'''
def extract_ids(query):
	m = re.split('&', query)
	if any(not i.isdigit() for i in m):
		raise APIError(195, 'invalid id value')
	return [int(i) for i in m]
