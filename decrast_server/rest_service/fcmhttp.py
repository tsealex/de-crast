'''
	This file implements sending a push notification to the Google FCM messaging
	servers via an HTTPS connection.
'''

from pyfcm import FCMNotification
from .serializers import *
from .models import *
from .settings import rest_settings

import sys
import os
import _thread
import json

FCM_SENDER_ID = '1086425216709'
FCM_SERVER_PASSWORD = rest_settings.FCM_SECRET_KEY or os.environ['FCM_SECRET_KEY']

# Array which maps notification types to notification titles.
# NOTE: Type four is skipped, so I put in a dummy value.
NOTIFICATION_TITLES = ['Task Reminder', 'Regular Notification', 'Evidence Received',
'Deadline Reminder', 'Space FIller', 'Task Invite', 'Task Invite Accepted', 'Task Expired',
'Task Completed']

# Class consists of static functions so an instance of one doesn't need
# to hang around somewhere just to send off a message every now and then.
class FcmPusher():
	# Everything in this class is static ...
	def __init__(self):
		pass

	@staticmethod
	def sendNotification(receiver_id, django_sender_name, body, notif):
		'''
		This static function spins up a worker thread to send off a notification.
		'''

		# Set the correct title
		title = NOTIFICATION_TITLES[notif.type];

		if rest_settings.TESTING or not receiver_id: return

		# Send the notification from a worker thread, so we don't fully block our
		# server application.
		_thread.start_new_thread(FcmPusher.callNotify, (receiver_id, title, body, notif))



	@staticmethod
	def callNotify(user_id, m_title, m_body, notif):
		'''
			This function is responsible for sending out a notification to the specified user.
		'''
		# Newline characters cause the notification message to format weirdly.
		m_body = m_body.strip('\n')
		print('send')

		# Pack up the needed data depending on what type of invite it is.
		task_id = notif.task.id
		if notif.type == Notification.INVITE:
			serialized_task = TaskSerializer(notif.task)
			m_data = {'type':notif.type, 'id':notif.id, 'task_id':task_id, \
				 'notif_task':serialized_task.data}
		elif notif.type == Notification.DEADLINE:
			m_data = {'type':notif.type, 'id':notif.id, 'task_id':task_id, 'metadata':notif.metadata}
		elif notif.type == Notification.INVITE_ACCEPT:
			# overload accepting deadline extension and viewer invite
			if notif.metadata is not None:
				m_title = 'Deadline extended'
			m_data = {'type':notif.type, 'id':notif.id, 'viewer_name': notif.sender.username, \
				'viewer_id': notif.sender.id, 'task_id': notif.task.id, 'metadata':notif.metadata}
		elif notif.type == Notification.EXPIRED:
			m_data = {'type':notif.type, 'id':notif.id, 'task_id':task_id}
		else:
			m_data = {'type':notif.type, 'id':notif.id, 'task_id':task_id}

		# Create an instance of the FCM notificaiton class, and send out a single notification.
		push = FCMNotification(api_key=FCM_SERVER_PASSWORD)
		resp = push.notify_single_device(registration_id=user_id, message_body=m_body,
		message_title=m_title, data_message=m_data, sound='Default', click_action='FCM_PLUGIN_ACTIVITY')

#		print(json.dumps(resp))
		# If our response contains a 'registration_id' key, this means that we need to update
		# the user's token.
		# TODO: UNTESTED
		if 'message_id' in resp:
			print("Message id: " + str(resp['message_id']))
			if 'registration_id' in resp:
				print('Need to update reg id: ' + str(resp['message_id']))
				set_fcm_token(user_id, resp['registration_id'])

