from django.db import models
from django.utils import timezone
from django.dispatch import receiver

import os
from datetime import datetime, timezone, timedelta

from .user import User
from .settings import rest_settings
from .utils import *

'''

'''
class Category(models.Model):
	# required
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	name = models.CharField(max_length=64)

	class Meta:
		unique_together = ('user', 'name')

'''

'''
class Task(models.Model):
	# required
	owner = models.ForeignKey(User, related_name='owned_tasks',
		on_delete=models.CASCADE)
	name = models.CharField(max_length=64)
	deadline = models.DateTimeField()

	# optional
	viewers = models.ManyToManyField(User, related_name='viewing_tasks')
	category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
	description = models.CharField(max_length=128, default='', blank=True)

	# auto-fill
	last_notify_ts = models.DateTimeField(auto_now_add=True)
	ended = models.BooleanField(default=False)
	# the date this task being marked by deletion (completed or expired)
	del_date = models.DateTimeField(null=True, default=None) 

	def complete(self):
		# check if deadline expired or evidence has been submitted
		try:
			if datetime.now(timezone.utc) >= self.deadline or \
				bool(self.evidence.file):
				# the task will be deleted after del_date
				self.ended = True
				self.del_date = datetime.now(timezone.utc) + timedelta(
					days=rest_settings.TASK_DELETION_WAITTIME)
				self.save()
				notifications = Notification.objects.filter(task=self, viewed=False) \
					.exclude(type=Notification.EVIDENCE)
				for notification in notifications:
					notification.viewed = True
					notification.save()
				return True
		except: pass
		return False

'''

'''
class Evidence(models.Model):
	# type constants
	PHOTO = 0
	GPS = 1
	AUDIO = 2
	DOCUMENT = 3
	VIDEO = 4
	EVIDENCE_TYPES = (
		(PHOTO, 'PHOTO'),
		(GPS, 'GPS'),
		(AUDIO, 'AUDIO'),
		(DOCUMENT, 'DOCUMENT'),
		(VIDEO, 'VIDEO'),
	)

	# required
	task = models.OneToOneField(Task, related_name='evidence', 
		on_delete=models.CASCADE, primary_key=True)
	type = models.IntegerField(choices=EVIDENCE_TYPES)

	# optional
	file = models.FileField(upload_to=evidence_dir, default=None, null=True)

	# auto-fill
	upload_date = models.DateTimeField(auto_now=True)

'''

'''
@receiver(models.signals.post_delete, sender=Evidence)
def delete_evidence_file(sender, instance, **kwarg):
	if instance.file and os.path.isfile(instance.file.path):
		instance.file.close()
		try: os.remove(instance.file.path)
		except: pass

'''

'''
class Consequence(models.Model):
	# required
	task = models.OneToOneField(Task, related_name='consequence', 
		on_delete=models.CASCADE, primary_key=True)

	# optional
	message = models.TextField(default=None, null=True)
	file = models.FileField(upload_to=consequence_dir, null=True)
	dup_file = models.BooleanField(default=False)

'''

'''
@receiver(models.signals.post_delete, sender=Consequence)
def delete_consequence_file(sender, instance, **kwarg):
	if instance.file and os.path.isfile(instance.file.path):
		if not instance.dup_file:
			instance.file.close()
			try: os.remove(instance.file.path)
			except: pass


	
'''

'''
class Deletion(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	date = models.DateTimeField(auto_now_add=True)

'''

'''
class Notification(models.Model):
	# notification type
	REMINDER = 0 # from viewer to task owner
	REGULAR = 1 # from system to task owner
	EVIDENCE = 2 # from system to viewer
	DEADLINE = 3 # from user to viewer
	INVITE = 5 # from user to user
	NOTIFICATION_TYPE = (
		(REMINDER, 'REMINDER'),
		(REGULAR, 'REGULAR'),
		(EVIDENCE, 'EVIDENCE POSTED'),
		(DEADLINE, 'DEADLINE ExTENSION'),
		(INVITE, 'VIEWER INVITE'),
	)
	# required
	task = models.ForeignKey(Task, on_delete=models.CASCADE)
	sender = models.ForeignKey(User, related_name='sent_no', 
		on_delete=models.CASCADE)
	recipient = models.ForeignKey(User, related_name='recv_no', 
		on_delete=models.CASCADE)
	type = models.IntegerField(choices=NOTIFICATION_TYPE)
	text = models.TextField(default='')

	# optional
	file = models.FileField(default=None, null=True)
	metadata = models.CharField(max_length=128, default=None, null=True)

	# auto-fill
	viewed = models.BooleanField(default=False)
	sent_date = models.DateTimeField(auto_now_add=True)

'''

'''
@receiver(models.signals.post_delete, sender=Notification)
def close_notification_file(sender, instance, **kwarg):
	if instance.file and os.path.isfile(instance.file.path):
		instance.file.close()

'''

'''
class TextTemplate(models.Model):
	text = models.TextField()

'''

'''
class ImageTemplate(models.Model):
	file = models.FileField(upload_to=rest_settings.IMAGE_STORAGE_DIR)

'''

'''
@receiver(models.signals.post_delete, sender=ImageTemplate)
def delete_temp_img(sender, instance, **kwarg):
	if instance.file and os.path.isfile(instance.file.path):
		instance.file.close()
		try: os.remove(instance.file.path)
		except: pass