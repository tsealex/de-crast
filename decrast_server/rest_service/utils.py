from .settings import rest_settings
from .errors import APIErrors
from .user import User

import re
import mimetypes
import random
import base64

from django.db import models
from django import forms
from django.core.files.base import ContentFile

from datetime import datetime, timezone

'''

'''
def evidence_dir(object, filename):
	return '{}task_{}/{}'.format(rest_settings.UPLOAD_DIR, 
		object.task_id, filename)

'''

'''
def consequence_dir(object, filename):
	return '{}task_{}/{}'.format(rest_settings.UPLOAD_DIR, 
		object.task_id, filename)

'''

'''
def validate(serializer):
	if not serializer.is_valid():
		errs = list(dict(serializer.errors).items())
		err = errs[0][1][0]
		if 'already exists' in err:
			raise APIErrors.AlreadyExists(errs[0][0])
		elif 'does not exist' in err:
			raise APIErrors.DoesNotExist(errs[0][0])
		elif 'make a unique set' in err:
			raise APIErrors.AlreadyExists('resource')
		raise APIErrors.ValidationError(errs[0][0])

'''

'''
def extract_data(data, required=None, optional=None):
	rtn_data = {}

	if optional:
		for key in optional:
			val = data.get(key)
			if data.get(key) is not None:
				rtn_data[key] = val

	if required:
		try:
			for key in required:
				rtn_data[key] = data[key]
		except KeyError as e:
			raise APIErrors.MalformedRequestBody(e.args[0])

	return rtn_data

'''

'''
def extract_ids(query):
	m = re.split('&', query)
	if any(not i.isdigit() for i in m):
		raise APIErrors.BadURLQuery('invalid id value')
	return [int(i) for i in m]

'''

'''
def past_deadline(task):
	return task.deadline <= datetime.now(timezone.utc)

'''

'''
def create_GPS_doc(gps):
	# TODO: input check (validate GPS)
	f = ContentFile(gps)
	f.name = 'evidence.gps'
	return f

'''

'''
def get_actual_file(file, encode64=True):
	if not bool(file):
		return None
	else:
		content_type = mimetypes.guess_type(file.name)
		file = open(file.name, 'rb')
		filename = file.name.split('/')[-1]
		if encode64 == True:
			file = base64.b64encode(file.read())
		else:
			file = file.read()
		return (file, content_type, filename)

'''

'''
def get_random_msg():
	from .models import TextTemplate
	from .models import ImageTemplate

	msg_count = TextTemplate.objects.count()
	img_count = ImageTemplate.objects.count()

	if msg_count == 0 or img_count == 0:
		return None, None
	msg_idx = int(random.uniform(1, msg_count - 1))
	img_idx = int(random.uniform(1, img_count - 1))

	msg = TextTemplate.objects.all()[msg_idx]
	img = ImageTemplate.objects.all()[img_idx]

	print('Selected image : ' + img.file.url)
	print('Selected mesage: ' + msg.text)

	return img, msg

'''
	This function is called by the FCM module when it receives
	news that a user's FCM token is updated.
'''
def set_fcm_token(old_token, new_token):
	user = User.objects.filter(fcm_token=old_token)
	user.update(fcm_token=new_token)
	user.save()

def get_fcm_by_user_id(p_id):
	return User.objects.filter(id=p_id).get(fcm_token)

def get_username_by_id(p_id):
	return User.objects.filter(id=p_id).get(username)
