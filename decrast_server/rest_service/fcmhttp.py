'''
	This file implements sending a push notification to the Google FCM messaging
	servers via an HTTPS connection.
'''

from pyfcm import FCMNotification
from .models import Notification
from .models import User

import sys
import os
import _thread

FCM_SENDER_ID = '1086425216709'
SECRET_KEY_ENV_VAR = 'FCM_SECRET_KEY'

FCM_SERVER_JID = FCM_SENDER_ID + '@gcm.googleapis.com'
FCM_SERVER_PASSWORD = os.environ[SECRET_KEY_ENV_VAR]

FCM_SERVER_ADDRESS = 'fcm-xmpp.googleapis.com'
FCM_PROD_PORT = 5235
FCM_TEST_PORT = 5236

FCM_USE_PORT = FCM_PROD_PORT


# Class consists of static functions so an instance of one doesn't need
# to hang around somewhere just to send off a message every now and then.
#
#TODO: Test this class. It talks with the FCM server, but without a front-
# end implementation, that's all the more I can test at this point.
class FcmPusher():
	def __init__(self):
		pass

	@staticmethod
	def sendNotification(receiver_id, django_sender_name, body):
		title = "New Notification"
		_thread.start_new_thread(FcmPusher.callNotify, (receiver_id, title, body))

	@staticmethod
	def callNotify(user_id, m_title, m_body):
		push = FCMNotification(api_key=FCM_SERVER_PASSWORD)
		resp = push.notify_single_device(registration_id=user_id, message_title=m_title, message_body=m_body)

		if(resp['message_id'] is not None):
			if(resp['registration_id'] is not None):
				print('Need to update reg id: ' + str(resp['message_id']))
				set_fcm_token(user_id, resp['registration_id'])

