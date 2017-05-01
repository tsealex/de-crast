from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import IntegrityError
from django import forms
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, FileUploadParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

import datetime
import time
import http.client
import json
import os
import re
import calendar

from .auth.serializers import JWTSerializer, RefreshSerializer
from .auth.auth import JWTAuthentication
from .errors import APIErrors
from .models import *
from .serializers import *
from .factories import *
from .facebook import facebook_mgr
from .utils import *
from .settings import rest_settings
from .notifications import *


'''
Authentication-related viewset
'''
class AuthViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)
	authentication_classes = ()
	permission_classes = ()

	'''
	[DEBUG] list all users: /list/ GET
	'''
	def list(self, request):
		queryset = User.objects.all()
		serializer = UserSerializer(queryset, many=True)
		return Response(serializer.data)

	'''
	Create a user: /auth/ POST
	'''
	def create(self, request):
		# parse input
		data = extract_data(request.data, ['facebookId', 'facebookToken'])
		data = {
			'fb_id': data['facebookId'],
			'fb_tk': data['facebookToken'],
		}
		# process input
		factory = JWTSerializer(data=data)
		validate(factory)
		return Response({
			'userId': factory.object.get('user').id,
			'username': factory.object.get('user').username,
			'accessToken': factory.object.get('ac_tk'),
			'refreshToken': factory.object.get('rf_tk'),
			'tokenExpiration': calendar.timegm(factory.object
				.get('ac_exp').timetuple()),
		})

	'''
	Refresh a token: /auth/refresh/ POST
	TODO: untested
	'''
	def update(self, request):
		data = extract_data(request.data, ['userId', 'refreshToken'])
		data = {
			'uid': data['userId'],
			'rf_tk': data['refreshToken'],
		}
		# process input
		factory = RefreshSerializer(data=data)
		validate(factory)
		return Response({
			'userId': factory.object.get('user').id,
			'username': factory.object.get('user').username,
			'accessToken': factory.object.get('ac_tk'),
			'refreshToken': factory.object.get('rf_tk'),
			'tokenExpiration': calendar.timegm(factory.object
				.get('ac_exp').timetuple()),
		})

'''
User-related viewset
'''
class UserViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)
	permission_classes = (IsAuthenticated,)

	'''
	[DEBUG] list all users: /user/list/ GET
	'''
	def list(self, request):
		queryset = User.objects.all()
		serializer = UserSerializer(queryset, many=True)
		return Response(serializer.data)

	'''
	Initializer username: /user/ GET
	'''
	def retrieve(self, request):
		serializer = UserSerializer(request.user)
		return Response(serializer.data)

	'''
	Initializer username: /user/ POST
	'''
	def update(self, request):
		# parse input
		data = extract_data(request.data, [], ['username', 'fcm_token'])
		# process input
		factory = UserFactory(request.user, data=data, partial=True)
		validate(factory)
		user = factory.save()
		serializer = UserSerializer(user)
		return Response(serializer.data)

'''
Category-related viewset
'''
class CategoryViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)

	'''
	Create a category: /user/categories/ POST
	'''
	def create(self, request):
		# parse input
		data = extract_data(request.data, ['name'])
		data['name'] = data['name'].rstrip()
		data['user'] = request.user.id
		# process input
		factory = CategoryFactory(data=data)
		validate(factory)
		cat = factory.save()
		serializer = CategorySerializer(cat)
		return Response(serializer.data)

	'''
	Update a category: /user/categories/<id>/ POST
	'''
	def update(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		data = extract_data(request.data, ['name'])
		data['name'] = data['name'].rstrip()
		# retrieve resource
		cat = request.user.category_set.filter(id=ids[0])
		if not cat.exists(): raise APIErrors.DoesNotExist('category id')
		else: cat = cat.get()
		# process input
		factory = CategoryFactory(cat, data=data, partial=True)
		validate(factory)
		cat = factory.save()
		serializer = CategorySerializer(cat)
		return Response(serializer.data)
				
	'''
	List all user's categories: /user/categories/ GET
	'''
	def list(self, request, pk=None):
		queryset = request.user.category_set.all()
		serializer = CategorySerializer(queryset, many=True)
		return Response(serializer.data)

	'''
	Delete a category: /user/categories/<id>/ DELETE
	'''
	def destroy(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		# retrieve resource
		cat = request.user.category_set.filter(id=ids[0])
		if not cat.exists(): raise APIErrors.DoesNotExist('category id')
		else: cat = cat.get()
		# process input
		cat.delete()
		return Response({'success':True})

'''

'''
class OwnedTaskViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)

	'''
	List all user's tasks: /user/tasks/ GET
	'''
	def list(self, request):
		quesyset = request.user.owned_tasks.filter(ended=False)
		serializer = TaskIdSerializer(quesyset, many=True)
		return Response(serializer.data)

	''''
	Create a task: /user/tasks/ POST
	'''
	def create(self, request):
		# parse input
		data = extract_data(request.data, ['name', 'deadline', 'type'], 
			['category', 'description', 'viewers'])
		data['owner'] = request.user.id
		# process input
		tfactory = TaskFactory(data=data)
		validate(tfactory)
		validate_evidence_type(data['type'])
		task = tfactory.save()

		Evidence(task=task, type=data['type']).save()
		Consequence(task=task).save()
		serializer = TaskIdSerializer(task)
		return Response(serializer.data)

'''

'''
class TaskViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)

	'''
	Get tasks by ids: /user/tasks/<id>&<id>.../ GET
	'''
	def retrieve(self, request, query):
		ids = extract_ids(query) # parse input & process input
		user = request.user
		queryset = Task.objects.filter(viewers=user) | Task.objects.filter(owner=user)
		queryset = queryset.filter(pk__in=ids)
		serializer = TaskSerializer(queryset, many=True)
		if rest_settings.SINGLE_VIEWER:
			for task in serializer.data:
				viewer = task.pop('viewers')
				task['viewer'] = viewer[0] if len(viewer) > 0 else None
		return Response(serializer.data)

	'''
	Update a task: /user/tasks/<id>/ POST
	'''
	def update(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		data = extract_data(request.data, None, ['name', 'description', 'category', 'expired', 
			'fb_token', 'completed'])
		data['owner'] = request.user.id
		# retrieve resource
		task = request.user.owned_tasks.filter(id=ids[0], ended=False)
		if not task.exists(): raise APIErrors.DoesNotExist('task id')
		else: task = task.get()

		# TODO: we may not want to allow the user to edit 'completed' directly in the final version
		if 'completed' in data:
			print("User completed task: " + task.name)
			task_completed_notification(task.owner, task)
			task.ended = True

		# If the update included an expired key, that means that this task is overdue,
		# and we need run the logic associated with it.
		if 'expired' in data:
			task_expired_notification(task.owner, task)
			task.ended = True

		# process input
		factory = TaskFactory(task, data=data, partial=True)
		validate(factory)
		task = factory.save()
		serializer = TaskIdSerializer(task)
		return Response(serializer.data)

	'''
	Spend karma point to delete a task: /user/tasks/<id>/ DELETE
	TODO: unimplemented
	'''
	def destroy(self, request, query):
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		data['owner'] = request.user.id
		# retrieve resource
		task = request.user.owned_tasks.filter(id=ids[0], ended=False)
		if not task.exists(): raise APIErrors.DoesNotExist('task id')
		task = task.get() 
		# process input
		# TODO: unimplemented
		# 1. check whether user has enough karma points
		# 2. delete the task and deduct the karma point
		# 3. return {'success':True}

'''

'''
class ViewedTaskViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)

	''''
	List all viewing tasks: /user/tasks/viewing/ GET
	'''
	def list(self, request):
		queryset = request.user.viewing_tasks.filter(ended=False).all()
		serializer = TaskIdSerializer(queryset, many=True)
		return Response(serializer.data)

'''

'''
class NotificationViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)

	'''
	Send viewer invite: /user/notifications/ POST
	TODO: partially tested
	'''
	def create(self, request):
		# switch on type
		msg_type = extract_data(request.data, ['type'])['type']
		if msg_type == Notification.INVITE:
			# parse input
			data = extract_data(request.data, ['recipient', 'task'])
			# retrieve resource
			receiver = User.objects.filter(id=data['recipient'])
			task = request.user.owned_tasks.filter(id=data['task'], ended=False)
			if not task.exists(): raise APIErrors.DoesNotExist('task')
			if not receiver.exists(): raise APIErrors.DoesNotExist('recipient')
			task = task.get()
			receiver = receiver.get()
			# process input
			send_viewer_invite(request.user, receiver, task)
			return Response({'success':True})

		elif msg_type == Notification.REMINDER:
			# parse input
			data = extract_data(request.data, ['task', 'text'])
			# retrieve resource
			task = request.user.viewing_tasks.filter(id=data['task'], ended=False)
			if not task.exists(): raise APIErrors.DoesNotExist('task')
			# process input
			send_reminder(request.user, task.get(), data['text'])
			return Response({'success':True})

		elif msg_type == Notification.DEADLINE:
			# parse input
			data = extract_data(request.data, ['task', 'deadline'])
			# retrieve resource
			task = request.user.owned_tasks.filter(id=data['task'], ended=False)
			if not task.exists(): raise APIErrors.DoesNotExist('task')
			# process input
			send_deadline_ext(request.user, task.get(), data['deadline'])
			return Response({'success':True})

		else: raise APIErrors.ValidationError('type')

	'''
	List all user's unviewed notification ids: /user/notifications/ GET
	TODO: untested
	'''
	def list(self, request):
		queryset = request.user.recv_no.filter(viewed=False).all()
		serializer = NotificationIdSerializer(queryset, many=True)
		return Response(serializer.data)

	'''
	Mark notifications as read: /user/notifications/respond/ POST
	TODO: untested
	'''
	def update(self, request):
		data = extract_data(request.data, ['notification'])
		data = [extract_data(n, ['id'], ['decision']) for n in data['notification']]
		for ndata in data:
			notification = request.user.recv_no.filter(id=ndata['id'])
			if notification.exists():
				read_notification(request.user, notification.get(), ndata.get('decision'))

		queryset = request.user.recv_no.filter(viewed=False).all()
		serializer = NotificationIdSerializer(queryset, many=True)
		return Response(serializer.data)

	'''
	Mark notifications as read: /user/notifications/<id>&<id>.../ GET
	TODO: untested
	'''
	def retrieve(self, request, query):
		# parse input
		ids = extract_ids(query)
		queryset = request.user.recv_no.filter(viewed=False, id__in=ids).all()
		serializer = NotificationSerializer(queryset, many=True)
		return Response(serializer.data)

	'''
	Get the associated file: /user/notifications/<id>/file/ GET
	TODO: untested
	'''
	def file(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		# retrieve resource
		recv_no = request.user.recv_no.filter(id=ids[0], viewed=False)
		if not recv_no.exists(): raise APIErrors.DoesNotExist('task id')
		recv_no = recv_no.get()
		# load file
		act_file = get_actual_file(recv_no.file)
		if act_file is None: raise APIErrors.DoesNotExist('notification file')
		response = HttpResponse(act_file[0], content_type=act_file[1])
		response['Content-Disposition'] = 'attachment; filename={}'.format(act_file[2])
		return response

	'''
	Get the associated task: /user/notifications/<id>/task/ GET
	TODO: untested
	'''
	def task(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		# retrieve resource
		recv_no = request.user.recv_no.filter(id=ids[0], viewed=False)
		if not recv_no.exists(): raise APIErrors.DoesNotExist('task id')
		recv_no = recv_no.get()
		# load task
		task = recv_no.task
		serializer = TaskSerializer(task)
		return Response(serializer.data)

'''

'''
class EvidenceViewSet(viewsets.ViewSet):
	parser_classes = (MultiPartParser, FileUploadParser, JSONParser)

	'''
	Initialize the evidence: /user/tasks/<id>/evidence/ POST
	TODO: untested
	'''
	def update(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		# retrieve resource
		task = request.user.owned_tasks.filter(id=ids[0], ended=False)
		if not task.exists(): raise APIErrors.DoesNotExist('task id')
		task = task.get()
		# process input
		if task.evidence.type == Evidence.GPS:
			data = extract_data(JSONParser().parse(request), 
				['coordinates'])['coordinates']
			file = create_GPS_doc(data)
		else:
			file = request.data.get('file')
			if file is None: raise APIErrors.MalformedRequestBody('file')
		factory = EvidenceFactory(task.evidence, data={'file':file}, partial=True)

		validate(factory)
		factory.save()
		task.complete()
		send_evidence(request.user, task)
		return Response({'success':True})

	'''
	Get the evidence: /user/tasks/<id>/evidence/ GET
	TODO: untested
	'''
	def retrieve(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		# retrieve resource
		task = request.user.owned_tasks.filter(id=ids[0]) | \
			request.user.viewing_tasks.filter(id=ids[0])
		if not task.exists(): raise APIErrors.DoesNotExist('task id')

		evidence = task.get().evidence
#		evidence = Evidence.objects.get(pk=task.id)

		# process input
		if evidence is not None:
			serializer = EvidenceSerializer(evidence)
			return Response(serializer.data)

	'''
	Get the associated file: /user/tasks/<id>/evidence/file/ GET
	TODO: untested
	'''
	def file(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		# retrieve resource
		# TODO: viewer may only view the evidence throught notification ?
		task = request.user.owned_tasks.filter(id=ids[0]) | \
			request.user.viewing_tasks.filter(id=ids[0])
		if not task.exists(): raise APIErrors.DoesNotExist('task id')
		task = task.get()
		# load file
		act_file = get_actual_file(task.evidence.file)
		if act_file is None: raise APIErrors.DoesNotExist('evidence file')
		response = HttpResponse(act_file[0], content_type=act_file[1])
		response['Content-Disposition'] = 'attachment; filename={}'.format(act_file[2])
		return response


'''

'''
class ConsequenceViewSet(viewsets.ViewSet):
	parser_classes = (MultiPartParser, FileUploadParser, JSONParser)

	'''
	Initialize the consequence: /user/tasks/<id>/consequence/ POST
	'''
	def update(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		# retrieve resource
		task = request.user.owned_tasks.filter(id=ids[0], ended=False)
		if not task.exists(): raise APIErrors.DoesNotExist('task id')
		consequence = task.get().consequence
		# process input
		file = request.data.get('file')
		message = request.data.get('message')
		dup_file = False
		if not file and not message and not consequence.message and  \
			not bool(consequence.file):
			file, message = get_random_msg()
			if not file or not message: raise APIErrors.ValidationError(
				'no file / message supplied') 
			dup_file = True
		factory = ConsequenceFactory(consequence, data={
			'file':file, 'message':message, 'dup_file':dup_file}, partial=True)

		validate(factory)
		factory.save()
		return Response({'success':True})

	'''
	Get the consequence: /user/tasks/<id>/consequence/ GET
	TODO: untested
	'''
	def retrieve(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		# retrieve resource
		task = request.user.owned_tasks.filter(id=ids[0])
		if not task.exists(): raise APIErrors.DoesNotExist('task id')
		consequence = task.get().consequence
		# process input
		serializer = ConsequenceSerializer(consequence)
		return Response(serializer.data)

	'''
	Get the associated file: /user/tasks/<id>/consequence/file/ GET
	TODO: untested
	'''
	def file(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		# retrieve resource
		task = request.user.owned_tasks.filter(id=ids[0])
		if not task.exists(): raise APIErrors.DoesNotExist('task id')
		task = task.get()
		# load file
		act_file = get_actual_file(task.consequence.file)
		if act_file is None: raise APIErrors.DoesNotExist('consequence file')
		response = HttpResponse(act_file[0], content_type=act_file[1])
		response['Content-Disposition'] = 'attachment; filename={}'.format(act_file[2])
		return response


'''
Temporary Classes
'''
class MemePopulator(viewsets.ViewSet):
	authentication_classes = ()
	permission_classes = ()
	parser_classes = (MultiPartParser, FileUploadParser, JSONParser)

	'''
	Add a new template image: /meme/image/ POST
	TODO: untested
	'''
	def image(self, request):
		# process input
		file = request.data.get('file')
		if not file:
			raise APIErrors.MalformedRequestBody('file')
		factory = ImageTemplateFactory(data={'file':file})
		validate(factory)
		factory.save()
		return Response(factory.data)

	'''
	Add a new template message: /meme/text/ POST
	TODO: untested
	'''
	def message(self, request):
		# parse input
		msg = JSONParser().parse(request).get('message')
		if not msg:
			raise APIErrors.MalformedRequestBody('message')
		factory = TextTemplateFactory(data={'text':msg})
		validate(factory)
		factory.save()
		return Response(factory.data)

	'''
	Delete a template image: /meme/image/<id>/ DELETE
	TODO: untested
	'''
	def del_image(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		temp = ImageTemplate.objects.filter(pk=ids[0])
		if temp.exists():
			temp = temp.get()
			temp.delete()
			return Response({'success':True})
		else:
			raise APIErrors.DoesNotExist('id')

	'''
	Delete a template message: /meme/text/<id>/ DELETE
	TODO: untested
	'''
	def del_message(self, request, query):
		# parse input
		ids = extract_ids(query)
		if len(ids) != 1: raise APIErrors.BadURLQuery('multiple ids')
		temp = TextTemplate.objects.filter(pk=ids[0])
		if temp.exists():
			temp = temp.get()
			temp.delete()
			return Response({'success':True})
		else:
			raise APIErrors.DoesNotExist('id')


'''
Helper methods
'''
def validate_evidence_type(type):
	if type not in [e[0] for e in Evidence.EVIDENCE_TYPES]:
		raise APIErrors.ValidationError('type')
