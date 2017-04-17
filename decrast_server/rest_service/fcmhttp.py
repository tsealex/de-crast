'''
	This file implements sending a push notification to the Google FCM messaging
	servers via an HTTPS connection.
'''

from pyfcm import FCMNotification
#from .models import Notification
#from .models import User

import sys
import os
import _thread
import json

FCM_SENDER_ID = '1086425216709'
SECRET_KEY_ENV_VAR = 'FCM_SECRET_KEY'

FCM_SERVER_JID = FCM_SENDER_ID + '@gcm.googleapis.com'
FCM_SERVER_PASSWORD = os.environ[SECRET_KEY_ENV_VAR]

FCM_SERVER_ADDRESS = 'fcm-xmpp.googleapis.com'
FCM_PROD_PORT = 5235
FCM_TEST_PORT = 5236

FCM_USE_PORT = FCM_PROD_PORT


# TODO: Import from models library
# notification type
REMINDER = 0 # from viewer to task owner
REGULAR  = 1 # from system to task owner
EVIDENCE = 2 # from system to viewer
DEADLINE = 3 # from user to viewer
INVITE   = 5 # from user to user

# Array which maps notification types to notification titles.
# NOTE: Type four is skipped, so I put in a dummy value.
NOTIFICATION_TITLES = ['Task Reminder', 'Regular Notification', 'Evidence Received',
'Deadline Reminder', 'Space FIller', 'Task Invite']

# Class consists of static functions so an instance of one doesn't need
# to hang around somewhere just to send off a message every now and then.
class FcmPusher():
	def __init__(self):
		pass

	@staticmethod
	def sendNotification(receiver_id, django_sender_name, body, type):
		'''
		This static function spins up a worker thread to send off a notification.
		'''

		# Set the correct title
		title = NOTIFICATION_TITLES[type];

		# Send the notification from a worker thread, so we don't fully block our
		# server application.
		_thread.start_new_thread(FcmPusher.callNotify, (receiver_id, title, body))

	@staticmethod
	def callNotify(user_id, m_title, m_body):
		'''
			This function is responsible for sending out a notification to the specified user.
		'''

		# Newline characters cause the notification message to format weirdly.
		m_body = m_body.strip('\n')

		# Create an instance of the FCM notificaiton class, and send out a single notification.
		push = FCMNotification(api_key=FCM_SERVER_PASSWORD)
		resp = push.notify_single_device(registration_id=user_id, message_body=m_body,
		message_title=m_title)

		# If our response contains a 'registration_id' key, this means that we need to update
		# the user's token.
		# TODO: UNTESTED
		if 'message_id' in resp:
			print("Message id: " + str(resp['message_id']))
			if 'registration_id' in resp:
				print('Need to update reg id: ' + str(resp['message_id']))
				set_fcm_token(user_id, resp['registration_id'])

