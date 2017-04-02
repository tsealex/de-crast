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

'''
Represents a user of the appication.
This class will extend the AbstractBaseUser (rather than AbstractUser) class 
when we start implementing the authentication mechanism.
'''
class User(AbstractBaseUser):
	# auto-fill
	id = models.AutoField(primary_key=True)
	is_active = models.BooleanField(default=True)
	access_ts = models.DateTimeField(auto_now=True)

	# required
	username = models.CharField(max_length=18, unique=True, null=True)
	fb_id = models.BigIntegerField(unique=True)
	
	# optional
	karma = models.IntegerField(default=0)
	fcm_token = models.CharField(max_length=128, null=True)
	
	# ignored, django user model default field
	password = models.CharField(max_length=8, default=None, null=True)

	USERNAME_FIELD = 'id'
	REQUIRED_FIELDS = ['fb_id'] # only needed for createsuperuser command

	objects = UserManager()
	
	@property
	def is_superuser(self):
		return False

	def __str__(self):
		return '{}'.format(self.id)