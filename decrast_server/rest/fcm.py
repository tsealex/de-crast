''' FILE: fcminterface.py

	This file will be used to implement an XMPP protocol
	interface between our app server and Google's FCM
	XMPP servers for sending push notifications.

'''

# Using this path for local testing.
#import sys
#sys.path.append('/home/jerryand100/CS_Coursework/cs506/dinking_dir/SleekXMPP')
#import sleekxmpp #as sleekxmpp

import sleekxmpp
import sys
import os
import time

FCM_SENDER_ID = '1086425216709'
SECRET_KEY_ENV_VAR = 'FCM_SECRET_KEY'

FCM_SERVER_EMAIL = FCM_SENDER_ID + '@gcm.googleapis.com'
FCM_SERVER_PASSWORD = os.environ[SECRET_KEY_ENV_VAR]

FCM_SERVER_ADDRESS = bytes('fcm-xmpp.googleapis.com', 'utf_8')
FCM_PROD_PORT = 5235
FCM_TEST_PORT = 5236

FCM_USE_PORT = FCM_TEST_PORT

FCM_CONNECT_ATTEMPT_LIMIT = 5


class DecrastXMPPServer(sleekxmpp.ClientXMPP):

	def __init__(self):
		print("Constructing a Decrast XMPP (kinda) Server!");
		sleekxmpp.ClientXMPP.__init__(self, FCM_SERVER_EMAIL, FCM_SERVER_PASSWORD)

		self.add_event_handler("session_start", self.start, threaded=True)
		self.add_event_handler("message", self.message)

	def connectToFcm(self):
		''' def authenticate:
			This function initiates communication with FCM's
			XMPP server.
		'''
#		print("JID: " + FCM_SERVER_EMAIL + ", Password: " + FCM_SERVER_PASSWORD)
		print("XMPP authenticating -> " + FCM_SERVER_ADDRESS.decode('utf-8') \
			+ ":" + str(FCM_USE_PORT));

		retryCount = 0
		# Attempt to connect to the FCM server. Return true if
		# connection happens before attempt limit.

		# NOTE: OS-defined socket timeout may make this function
		# appear to never return, but if you stick with it for
    # a really, really long time it'll finish if it's stuck.
		# This is why I'm using a local version of the XMPP
		# library.
		while(retryCount < FCM_CONNECT_ATTEMPT_LIMIT):
			print("Connection attempt " + str(retryCount) + " of " \
			+ str(FCM_CONNECT_ATTEMPT_LIMIT))

			if self.connect((FCM_SERVER_ADDRESS.decode('utf-8'), FCM_USE_PORT), reattempt=False,
			use_tls=True):
				print("Returning true!")
				return True
			else:
				time.sleep(retryCount * 2)
				retryCount += 1

		print("Returning false :(")
		return False


	def message(self, msg):
		''' def message:
			This function receives a particular message sent via XMPP.
		'''
		print("XMPP message received!")

	def authenticate(self):
		print("Decrast XMPP: Authenticating")
		self.send_message(mto='gcm.googleapis.com', mbody='Hey Google!')
		self.disconnect(wait=True)

	def establishConnection(self):
		print("XMPP Establishing connection");
#		self.send_message(mto='gcm.googleapis.com',
		self.process(block=True)

	def start(self, event):
		print("XMPP connection established!")

	def getAuthString(self):
		return """ <stream:stream to="gcm.googleapis.com" """ \
        """version="1.0" xmlns="jabber:client" """ \
        """xmlns:stream="http://etherx.jabber.org/streams">"""
