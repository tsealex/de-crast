import sys
sys.path.append('/home/jerryand100/CS_Coursework/cs506/de-crast/decrast_server')
from rest_service import fcm
from rest_service import authfcm

import logging

if __name__ == '__main__':
	print("RUNNING TEST: FCM XMPP SERVER");

	logging.basicConfig(level=logging.DEBUG, format='%(levelname)-8s %(message)s')

	xmpp = fcm.DecrastXMPPServer()
	xmpp.register_plugin('xep_0030') # Service Discovery
	xmpp.register_plugin('xep_0199') # XMPP Ping

	if(xmpp.connectToFcm()):
		print("TEST: Successful connection!")
		xmpp.process(block=True)

#	xmpp_socket.process(block=True)

	print("TEST COMPLETE")
