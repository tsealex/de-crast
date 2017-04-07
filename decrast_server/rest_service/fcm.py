'''
	PLEASE NOTE: THIS FILE IS NOT CURRENTLY TO BE USED.
	I REPEAT: THIS FILE IS NOT TO BE CURRENTLY USED.

	Initially we wanted to implement FCM communication via XMPP, but
	this kept dishing out one vague socket error after another.
	Due to this, we decided to get communication working via HTTPS
	with pyfcm, and then potentially try to implement XMPP communication
	if we have time and/or the HTTPS communication isn't giving us what
	we need. In the mean time, please refer to fcmhttp.py for FCM comms.
'''

''' FILE: fcminterface.py

	This file will be used to implement an XMPP protocol
	interface between our app server and Google's FCM
	XMPP servers for sending push notifications.

'''


import sleekxmpp
import sys
import os
import time

import json

FCM_SENDER_ID = '1086425216709'
SECRET_KEY_ENV_VAR = 'FCM_SECRET_KEY'

FCM_SERVER_JID = FCM_SENDER_ID + '@gcm.googleapis.com'
FCM_SERVER_PASSWORD = os.environ[SECRET_KEY_ENV_VAR]

FCM_SERVER_ADDRESS = 'fcm-xmpp.googleapis.com'
FCM_PROD_PORT = 5235
FCM_TEST_PORT = 5236

FCM_USE_PORT = FCM_TEST_PORT

FCM_CONNECT_ATTEMPT_LIMIT = 5


'''
	Implementation of an XMPP client which will run on our app server in order
	to relay push notification to Google's FCM XMPP server.
'''
class DecrastXMPPServer(sleekxmpp.ClientXMPP):

	def __init__(self):
		sleekxmpp.ClientXMPP.__init__(self, FCM_SERVER_JID, FCM_SERVER_PASSWORD,
		sasl_mech="PLAIN")

		self.add_event_handler("session_start", self.start)
		self.add_event_handler("message", self.message)

	def connectToFcm(self):
		''' def authenticate:
			This function initiates communication with FCM's
			XMPP server.
		'''

		if self.connect((FCM_SERVER_ADDRESS, FCM_USE_PORT),
		reattempt=True, use_tls=True, use_ssl=True):
			return True

		return False

	# TODO: Handle case when FCM server sends back a 'registration_id' field,
	#       meaning we need to update the Decrast User table.
	def message(self, msg):
		''' def message:
			This function receives a particular message sent via XMPP.
		'''
		print("XMPP message received!")


	def sendMessage(self, to_jid, sender_jid, json_body):
		''' def sendMessage
			This function sends a message to the FCM server, which in turns
			relays it to the given user's mobile device.
		'''

		# Message ID needs to be unique, so I entrust uuid4 with doing the trick.
		msg_contents = """ <message id="{0}"><gcm xmlns="google:mobile:data"> """ \
		"""{ {1}, "to" : "{2}" }</gcm></message>""".format(uuid.uuid4(),
		json.dumps(json_body), to_jid)

		self.send_raw(msg_contents)


	def start(self, event):
		print("XMPP connection established!")
		self.process(block=True)
