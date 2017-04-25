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
DEFAULT_DEADLINE_EXT_MSG = """"
{} sent you a request for changing the deadline of the task "{}".
"""

# param: sender.username, task.name
# TODO: refine/change the message (i.e. add more details)
DEFAULT_EVIDENCE_MSG = """
{} has submitted evidence for the task "{}".
"""

DEFAULT_INVITE_ACCEPT_MSG = """
{} is now viewing task "{}".
"""

DEFAULT_EXPIRATION_MSG = """
{} failed to complete task "{}".
"""

'''
	This function creates and sends a view-task invite notification.
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

	notif_obj = Notification.objects.latest('pk')
	# Send out the notification.
	FcmPusher.sendNotification(receiver.fcm_token, sender.username, msg, notif_obj)


'''
	This function creates and sends a deadline-extension request.
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

		notif_obj = Notification.objects.latest('pk')
		# Send out the notification.
		FcmPusher.sendNotification(receiver.fcm_token, sender.username, msg, notif_obj.id, Notification.DEADLINE)

'''
	This function sends and creates a reminder-to-complete notification
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

	notif_obj = Notification.objects.latest('pk')
	# Send out the notification.
	FcmPusher.sendNotification(receiver.fcm_token, sender.username, msg, notif_obj)


	# refresh task last_notify_time
	task.last_notify_ts = datetime.now(timezone.utc)
	task.save()

'''
	This function creates and sends an evidence notification.
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

		notif_obj = Notification.objects.latest('pk')
		# Send out the notification.
		FcmPusher.sendNotification(receiver.fcm_token, sender.username, msg, notif_obj)


'''
	This function updates the viewing status of a task, and sends a notification
	to the task owner if the requested viewer accepts.
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

		msg = DEFAULT_INVITE_ACCEPT_MSG.format(viewer.username, task.name);
		# Send out the notification.
		FcmPusher.sendNotification(task.owner.fcm_token, viewer.username, msg,
		notification)
	else:
		# TODO: send a system message to the task owner
		pass


'''
	This function updates the task deadline if the viewer agreed to allow such to happen.
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
	This function marks a notification as read.
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


'''
	This function sends out a notification to the viewer of a task once it has expired.
	TODO: This function will be responsible for carrying out the appropriate consequence.
'''
def task_expired_notification(user, task):
	msg = DEFAULT_EXPIRATION_MSG.format(user.username, task.name)

	# Send every viewer of this task a notification regarding the expiration.
	for viewer in task.viewers.all():
			data = {
				'type': Notification.EXPIRED,
				'sender': user.id,
				'recipient': viewer.id,
				'task': task.id,
				'text': msg,
			}
			nf = NotificationFactory(data=data)
			validate(nf)
			nf.save()

			# The last-added notification is the one we just added.
			notif_obj = Notification.objects.latest('pk')
			# Send out the notification.
			FcmPusher.sendNotification(viewer.fcm_token, user.username, msg, notif_obj)
