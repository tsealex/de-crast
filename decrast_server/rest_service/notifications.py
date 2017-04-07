from .settings import rest_settings
from .errors import APIErrors
from .models import *
from .factories import *
from .serializers import *
from .utils import *
from .user import User
from .fcmhttp import FcmPusher

from datetime import datetime, timezone 

# param: sender.username, task.name
# TODO: refine the message (i.e. add more details such as task.description)
DEFAULT_TASK_INVITE_MSG = """
{} sent you an invite for viewing the task "{}".
"""

# param: sender.username, task.name, deadline
# TODO: refine/change the message (i.e. add more details)
DEFAULT_DEADLINE_EXT_MSG = """
{} sent you a request for changing the deadline of the task "{}".
"""

# param: sender.username, task.name
# TODO: refine/change the message (i.e. add more details)
DEFAULT_EVIDENCE_MSG = """
{} has submitted evidence for the task "{}".
"""

'''

'''
def send_viewer_invite(sender, receiver, task):
	msg = DEFAULT_TASK_INVITE_MSG.format(sender.username, task.name)
	data = {
		'type': Notification.INVITE,
		'sender': sender.id,
		'recipient': receiver.id,
		'task': task.id,
		'text': msg,
	}
	# create a notification object
	nf = NotificationFactory(data=data)
	validate(nf)
	nf.save()
	# TODO: invoke FCM to notify user. This function call is harshly
	# untested to the point of still being commented out ...
#	FcmPusher.sendNotification(receiver.fcm_token, sender.username, msg)

'''

'''
def send_deadline_ext(sender, task, deadline):
	msg = DEFAULT_DEADLINE_EXT_MSG.format(sender.username, task.name)
	for viewer in task.viewers.all():
		data = {
			'type': Notification.DEADLINE,
			'sender': sender.id,
			'recipient': viewer.id,
			'task': task.id,
			'text': msg,
			'metadata': str(deadline),
		}
		# create a notification object
		nf = NotificationFactory(data=data)
		validate(nf)
		nf.save()
		# TODO: invoke FCM to notify user

'''

'''
def send_reminder(sender, task, content):
	# TODO: input check if sender is a viewer
	data = {
		'type': Notification.REMINDER,
		'sender': sender.id,
		'recipient': task.owner_id,
		'task': task.id,
		'text': content, # TODO: may come up some input checks for content
	}
	# create a notification object
	nf = NotificationFactory(data=data)
	validate(nf)
	nf.save()
	# TODO: invoke FCM to notify user

	# refresh task last_notify_time
	task.last_notify_ts = datetime.now(timezone.utc)
	task.save()

'''

'''
def send_evidence(sender, task):
	evidence = Evidence.objects.filter(task=task)
	if not evidence.exists() or not bool(evidence.get().file):
		raise APIErrors.DoesNotExist('evidence')
	msg = DEFAULT_EVIDENCE_MSG.format(sender.username, task.name)
	for viewer in task.viewers.all():
		data = {
			'type': Notification.EVIDENCE,
			'sender': sender.id,
			'recipient': viewer.id,
			'task': task.id,
			'text': msg,
			'file': task.evidence.file,
		}
		nf = NotificationFactory(data=data)
		validate(nf)
		nf.save()
		# TODO: invoke FCM to notify user

'''

'''
def respond_viewer_invite(user, notification, decision):
	if notification.recipient != user:
		raise APIErrors.UnpermittedAction()
	if notification.type != Notification.INVITE:
		raise APIErrors.UnpermittedAction('not an invite')
	notification.viewed = True
	notification.save()
	# add recipient to be the viewer
	if decision:
		viewer = notification.recipient
		task = notification.task
		task.viewers.add(viewer)
		task.save()
	else:
		# TODO: send a system message to the task owner
		pass

'''

'''
def respond_deadline_ext(user, notification, decision):
	if notification.recipient != user:
		raise APIErrors.UnpermittedAction()
	if notification.type != Notification.DEADLINE:
		raise APIErrors.UnpermittedAction('not an invite')
	task = notification.task
	notification.viewed = True
	notification.save()
	if decision:
		deadline = int(notification.metadata)
		print(datetime.fromtimestamp(deadline, timezone.utc))
		tf = TaskFactory(task, data={'deadline':deadline}, partial=True)
		try:
			tf.is_valid()
			tf.save()
		except:
			raise APIErrors.UnpermittedAction('purposed deadline expired')
	else:
		# TODO: send a system message to the task owner
		pass
	
'''

'''
def read_notification(user, notification, decision=None):
	if notification.recipient != user:
		raise APIErrors.UnpermittedAction()
	if notification.type == Notification.DEADLINE:
		if decision is not None and type(decision) is bool:
			respond_deadline_ext(user, notification, decision)
	elif notification.type == Notification.INVITE:
		if decision is not None and type(decision) is bool:
			respond_viewer_invite(user, notification, decision)
	else:
		notification.viewed = True
		notification.save()
