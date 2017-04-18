from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework.exceptions import ValidationError
from django.core.validators import RegexValidator

import re
import time
import magic
import mimetypes

from datetime import datetime, timezone, timedelta
import calendar


from .models import *
from .user import User
from .settings import rest_settings
from .errors import APIErrors

'''
For storing a unix timestamp
'''
class TimestampField(serializers.Field):

	def to_representation(self, value):
		return calendar.timegm(value.timetuple())

	def to_internal_value(self, timestemp):
		try: return datetime.fromtimestamp(timestemp, timezone.utc)
		except: raise ValidationError('convertion error')

'''

'''
class UserFactory(serializers.ModelSerializer):

	def validate_username(self, username):
		if self.instance is not None and self.instance.username is not None:
			raise APIErrors.UnpermittedAction('changing username')
		if re.match(r'([0-9a-zA-Z_-]+)', username).group(0) != username:
			raise APIErrors.ValidationError('username')
		return username

	def validate_karma(self, karma):
		if not 0 <= karma <= 100:
			raise APIErrors.ValidationError('karma')
		return karma

	class Meta:
		model = User
		fields = '__all__'
		read_only_fields = ('id',)

'''

'''
class CategoryFactory(serializers.ModelSerializer):

	class Meta:
		model = Category
		fields = '__all__'
		read_only_fields = ('id',)
		
'''

'''
class TaskFactory(serializers.ModelSerializer):
	deadline = TimestampField()

	def validate_deadline(self, deadline):
		time = datetime.now(timezone.utc) + timedelta(minutes=
			rest_settings.DEADLINE_MINUTE_FROM_NOW)

		if deadline <= time:
			raise APIErrors.ValidationError('deadline')
		return deadline

	class Meta:
		model = Task
		fields = '__all__'
		read_only_fields = ('id', 'viewers',)

'''

'''
class NotificationFactory(serializers.ModelSerializer):

	def validate(self, data):
		task = data.get('task')
		type = data.get('type')
		sender = data.get('sender')
		recipient = data.get('recipient')

		if sender == recipient:
			raise APIErrors.ValidationError('recipient')

		if type == Notification.INVITE:
			# if only allow single viewer per task
			if rest_settings.SINGLE_VIEWER:
				# if the task already has a viewer
				if task.viewers.count() >= 1:
					raise APIErrors.AlreadyExists('viewer')
				# if the user already sent an invite to a viewer
				if Notification.objects.filter(task=task,
					type=Notification.INVITE, viewed=False).exists():
					raise APIErrors.AlreadyExists('notification')
			# in the case of viewer collaboration
			else:
				# if the recipient is already a viewer for that task
				if recipient.viewing_tasks.filter(id=task.id).exists():
					raise APIErrors.AlreadyExists('viewer')
				# if the user already sent an invite to that viewer
				if Notification.objects.filter(task__id=task.id, recipient=recipient,
					type=Notification.INVITE, viewed=False).exists():
					raise APIErrors.AlreadyExists('notification')

		elif type == Notification.DEADLINE:
			if not recipient.viewing_tasks.filter(id=task.id).exists():
				raise APIErrors.UnpermittedAction('not a viewer')

			deadline = data.get('metadata')
			# if metadata doesn't contain deadline / is not a valid datetime
			try: deadline = datetime.fromtimestamp(int(deadline), timezone.utc)
			except: raise ValidationError('deadline')
			if deadline <= datetime.now(timezone.utc) + timedelta(minutes=
				rest_settings.DEADLINE_MINUTE_FROM_NOW):
				raise ValidationError('deadline')

			# if only allow single viewer per task
			if rest_settings.SINGLE_VIEWER:
				# if the user already sent an invite to a viewer
				if Notification.objects.filter(task=task, 
					type=Notification.DEADLINE, viewed=False).exists():
					raise APIErrors.AlreadyExists('notification')

			else:
				# TODO: need to discuss how the deadline ext works in the
				# multiple-viewer setting
				pass

		elif type == Notification.REMINDER:
			if recipient != task.owner:
				raise APIErrors.UnpermittedAction('not a task owner')

			time = task.last_notify_ts + timedelta(minutes=
				rest_settings.NOTIFICATION_PEROID)
			# check last notifcation 
			if time > datetime.now(timezone.utc):
				raise APIErrors.UnpermittedAction('too soon')

		elif type == Notification.REGULAR:
			# don't see the need to verify this right now
			pass

		elif type == Notification.EVIDENCE:
			# don't see the need to verify this right now
			pass

		return data

	class Meta:
		model = Notification
		fields = '__all__'

'''

'''
class ConsequenceFactory(serializers.ModelSerializer):

	def validate_message(self, message):
		if self.instance and self.instance.message:
			raise APIErrors.AlreadyExists('message')
		return message

	def validate_file(self, file):
		if self.instance and bool(self.instance.file):
			raise APIErrors.AlreadyExists('file')
		if file.size > rest_settings.MAX_CONSEQUENCE_FILE_SIZE:
			raise APIErrors.ValidationError('file')
		if rest_settings.MAGIC_FILE:
			mg = magic.Magic(magic_file=rest_settings.MAGIC_FILE, mime=True)
		else: mg = magic.Magic(mime=True)
		ftype = mg.from_buffer(file.read(1024)) 
		if ftype not in rest_settings.IMAGE_TYPES or \
			ftype != mimetypes.guess_type(file.name)[0]:
			raise APIErrors.ValidationError('file')
		return file

	def validate(self, data):
		if self.instance and rest_settings.EDITABLE_CONSEQUENCE:
			if bool(self.instance.file) or self.instance.message:
				APIErrors.UnpermittedAction('editing consequence')
		return data

	class Meta:
		model = Consequence
		fields = '__all__'

'''

'''
class EvidenceFactory(serializers.ModelSerializer):

	def validate(self, data):
		type = data.get('type')
		file = data.get('file')

		if self.instance:
			if not type: type = self.instance.type 
			else: raise APIErrors.AlreadyExists('type')

		if file and type is not None and type != Evidence.GPS:
			if self.instance and self.instance.file:
				raise APIErrors.AlreadyExists('file')
			if file.size > rest_settings.MAX_EVIDENCE_FILE_SIZE:
				raise APIErrors.ValidationError('file') 
			# TODO: remove this
			# for my windows pc only, linux pc doesn't require magic_file param
			if rest_settings.MAGIC_FILE:
				mg = magic.Magic(magic_file=rest_settings.MAGIC_FILE, mime=True)
			else: mg = magic.Magic(mime=True)
			ftype = mg.from_buffer(file.read(1024)) 
			if ftype != mimetypes.guess_type(file.name)[0]:
				raise APIErrors.ValidationError('file')
			if type == Evidence.PHOTO and ftype not in rest_settings.IMAGE_TYPES:
				raise APIErrors.ValidationError('file')
			# TODO: change this to support more file types
			elif type != Evidence.PHOTO:
				raise APIErrors.ValidationError('file')
			
		return data

	class Meta:
		model = Evidence
		fields = '__all__'

'''

'''
class TextTemplateFactory(serializers.ModelSerializer):

	class Meta:
		model = TextTemplate
		fields = '__all__'

'''

'''
class ImageTemplateFactory(serializers.ModelSerializer):

	def validate_file(self, file):
		if self.instance and bool(self.instance.file):
			raise APIErrors.AlreadyExists('file')
		if file.size > rest_settings.MAX_CONSEQUENCE_FILE_SIZE:
			raise APIErrors.ValidationError('file')
		# for my windows pc only, linux pc doesn't require magic_file param
		if rest_settings.MAGIC_FILE:
			mg = magic.Magic(magic_file=rest_settings.MAGIC_FILE, mime=True)
		else: mg = magic.Magic(mime=True)
		ftype = mg.from_buffer(file.read(1024)) 
		if ftype not in rest_settings.IMAGE_TYPES or \
			ftype != mimetypes.guess_type(file.name)[0]:
			raise APIErrors.ValidationError('file')
		return file

	class Meta:
		model = ImageTemplate
		fields = '__all__'
