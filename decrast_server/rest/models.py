from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

'''
Required by Django for creating users
'''
class UserManager(BaseUserManager):
	def create_user(self, fb_id, username=None):
		if not fb_id:
			raise ValueError()

		user = self.model(fb_id=fb_id, username=None)
		user.save(using=self._db)
		return user

def evidence_dir_path(object, filename):
	return 'uploads/task_{}/evidence-{}'.format(instance.id, filename)

def consequence_dir_path(object, filename):
	return 'uploads/task_{}/consequence-{}'.format(instance.id, filename)
'''
Represents a user of the appication.
This class will extend the AbstractBaseUser (rather than AbstractUser) class 
when we start implementing the authentication mechanism.
'''
class User(AbstractBaseUser):
	id = models.AutoField(primary_key=True)
	username = models.CharField(max_length=18, unique=True, null=True)
	fb_id = models.BigIntegerField(unique=True, null=False)
	access_ts = models.DateField(auto_now_add=True) # TODO: null=False

	USERNAME_FIELD = 'id'
	REQUIRED_FIELDS = ['fb_id'] # only needed for createsuperuser command

	objects = UserManager()
	
	@property
	def is_superuser(self):
		return False

	def __str__(self):
		return '{}'.format(self.id)

class Category(models.Model):
	name = models.CharField(max_length=64, null=False)
	user = models.ForeignKey(User, on_delete=models.CASCADE)

class Task(models.Model):
	owner = models.ForeignKey(User, related_name='owned_tasks', on_delete=models.CASCADE)
	viewer = models.ForeignKey(User, related_name='viewing_tasks', on_delete=models.SET_NULL, null=True)
	category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)

	deadline = models.DateTimeField(null=False)
	last_notify_ts = models.DateTimeField(null=False)

	name = models.CharField(max_length=64, null=False)
	description = models.CharField(max_length=128)

class Evidence(models.Model):
	EVIDENCE_TYPES = (
		('G', 'GPS'),
		('P', 'PHOTO'),
	)
	id = models.OneToOneField(Task, on_delete=models.CASCADE, null=False, primary_key=True)
	type = models.CharField(choices=EVIDENCE_TYPES, null=False, max_length=1)
	data = models.CharField(max_length=100) # stores the GPS coordinate
	image = models.FileField(upload_to=evidence_dir_path) # max size = 2MB

class Notification(models.Model):
	NOTIFICATION_TYPES = (
		# TODO: define the type
	)
	type = models.CharField(choices=NOTIFICATION_TYPES, null=False, max_length=1) # or 2
	text = models.TextField(null=False)
	data = models.FilePathField() # server file path of an image attached to this notification
	viewed = models.BooleanField(default=False, null=False)
	sender = models.ForeignKey(User, related_name='sent_no', 
		on_delete=models.CASCADE, null=False)
	recipient = models.ForeignKey(User, related_name='received_no', 
		on_delete=models.CASCADE, null=False)
	task = models.ForeignKey(Task, null=False, on_delete=models.CASCADE) # null = True ?

class Consequence(models.Model):
	id = models.OneToOneField(Task, on_delete=models.CASCADE, null=False, primary_key=True)
	message = models.TextField()
	image = models.FileField(upload_to=consequence_dir_path)


