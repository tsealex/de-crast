import sys
sys.path.append('/home/jerryand100/CS_Coursework/cs506/de-crast/decrast_server')
from rest import fcm
from rest import authfcm

if __name__ == '__main__':
	print("RUNNING TEST: FCM XMPP SERVER");

	xmpp = fcm.DecrastXMPPServer()
	xmpp.register_plugin('xep_0030') # Service Discovery
	xmpp.register_plugin('xep_0199') # XMPP Ping

	if(xmpp.connect(('fcm-xmpp.googleapis.com', 5236))):
		print("TEST: Successful connection!")
#		xmpp.process(block=True)
		if(xmpp.authenticate()):
			print("TEST: Auth looking good:)")

#	xmpp_socket.process(block=True)

	print("TEST COMPLETE")
