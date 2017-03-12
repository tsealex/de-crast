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

class Task(models.Model):
	pass

class Evidence(models.Model):
	pass

class Notification(models.Model):
	pass

class Consequence(models.Model):
	pass

class CategoryManager(models.Manager):
	def create_category(self, **kwargs):
		category = super(CategoryManager, self).create(**kwargs)
		return category

	def get_user_categories(self, uid):
		return Category.objects.filter(userId=uid)

class Category(models.Model):
	categoryId = models.AutoField(primary_key=True)
	categoryName = models.CharField(max_length=32, null=False)
	userId = models.ForeignKey(User)

	objects = CategoryManager()

