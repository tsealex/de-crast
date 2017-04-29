from rest_service.models import *
from rest_service.user import User
from rest_service.factories import *
from rest_service.utils import *
from rest_service.errors import APIErrors
from rest_service.serializers import *
from rest_service.notifications import *
from rest_service.settings import rest_settings

from rest_framework.test import APIRequestFactory, APIClient


from django.core.files import File
from django.core.files.uploadedfile import UploadedFile
from django.test import TestCase
from django.urls import reverse

from datetime import datetime, timezone, timedelta
import os.path
import calendar
import json
import shutil

# change this
base_dir = rest_settings.TEST_BASE_DIR or '/home/ec2-user/decrast_server/'
rest_settings.UPLOAD_DIR = 'test_uploads/'
rest_settings.TESTING = True

class UserTestCase(TestCase):

	fb_id = [
		264462346,
		948463610,
	]

	def setUp(self):
		uf = UserFactory(data={'fb_id':self.fb_id[0]})
		if uf.is_valid():
			uf.save()
		uf = UserFactory(data={'fb_id':self.fb_id[1]})
		if uf.is_valid():
			uf.save()

	def test(self):
		self._test_fb_id()
		self._test_username()
		self._test_user_attr()

	def _test_fb_id(self):
		uf = UserFactory(data={'fb_id':self.fb_id[1]})
		self.assertFalse(uf.is_valid(), msg='non-unique fb_id')


	def _test_username(self):
		u = User.objects.get(fb_id=self.fb_id[0])

		invalid_name = 'f&fj24'
		uf = UserFactory(u, data={'username':invalid_name}, partial=True)
		with self.assertRaises(APIErrors.ValidationError, msg='invalid username'):
			uf.is_valid()

		invalid_name = ''
		uf = UserFactory(u, data={'username':invalid_name}, partial=True)
		self.assertFalse(uf.is_valid(), msg='empty username')

		invalid_name = 'faaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaja24'
		uf = UserFactory(u, data={'username':invalid_name}, partial=True)
		self.assertFalse(uf.is_valid(), msg='too long')

		username = 'myuser1'
		
		uf = UserFactory(u, data={'username':username}, partial=True)
		self.assertTrue(uf.is_valid(), 'failed naming')
		uf.save()
		u = User.objects.get(fb_id=self.fb_id[0])
		self.assertEqual(u.username, username, 'username not saved')
		uf = UserFactory(u, data={'username':username}, partial=True)
		with self.assertRaises(APIErrors.UnpermittedAction, msg='changing username'):
			uf.is_valid()

		u = User.objects.get(fb_id=self.fb_id[1])
		uf = UserFactory(u, data={'username':username}, partial=True)
		self.assertFalse(uf.is_valid(), msg='username not unique')

	def _test_user_attr(self):
		fcm_token= '3irt45yu43'
		username = 'myuser1'
		u = User.objects.get(fb_id=self.fb_id[0])
		uf = UserFactory(u, data={'fcm_token':fcm_token}, partial=True)
		self.assertTrue(uf.is_valid(), 'fcm_token init user1')
		uf.save()

		u = User.objects.get(fb_id=self.fb_id[0])
		self.assertEqual(u.fcm_token, fcm_token, 'fcm_token not saved')
		self.assertEqual(u.username, username, 'username changed')

		now = datetime.now(timezone.utc)
		u = User.objects.get(fb_id=self.fb_id[1])
		uf = UserFactory(u, data={'fcm_token':fcm_token}, partial=True)
		self.assertTrue(now >= u.access_ts, 'access_ts exists')
		self.assertTrue(uf.is_valid(), 'fcm_token init user2')
		uf.save()
		self.assertTrue(now < u.access_ts, 'access_ts update')

class CategoryTestCase(TestCase):

	fb_id = [
		264462346,
		948463610,
	]

	def setUp(self):
		uf = UserFactory(data={'fb_id':self.fb_id[0]})
		if uf.is_valid():
			uf.save()
		uf = UserFactory(data={'fb_id':self.fb_id[1]})
		if uf.is_valid():
			uf.save()

	def test(self):
		self._test_category_creation()

	def _test_category_creation(self):
		cf = CategoryFactory(data={'name':'no name'})
		self.assertFalse(cf.is_valid(), msg='no user')

		u1 = User.objects.get(fb_id=self.fb_id[0])

		cf = CategoryFactory(data={'name':'no name', 'user':u1.id})
		self.assertTrue(cf.is_valid(), msg='valid category for user 1')
		cf.save()

		u2 = User.objects.get(fb_id=self.fb_id[1])
		cf = CategoryFactory(data={'name':'no name', 'user':u2.id})
		self.assertTrue(cf.is_valid(), msg='valid category for user 2')
		cf.save()

		cf = CategoryFactory(data={'name':'no name', 'user':u1.id})
		self.assertFalse(cf.is_valid(), msg='category already exists for user 1')


class EvidenceTestCase(TestCase):

	fb_id = [
		264462346,
	]
	tid = []

	def setUp(self):
		uf = UserFactory(data={'fb_id':self.fb_id[0]})
		if uf.is_valid():
			u = uf.save()
		deadline = datetime.now(timezone.utc) + timedelta(minutes=8000)
		task1 = Task(name='task1', deadline=deadline, owner=u)
		task1.save()
		self.tid.append(task1.id)

	
	def test(self):
		self._test_evidence_creation()
		self._test_evidence_upload()

	def _test_evidence_creation(self):
		task1 = Task.objects.get(pk=self.tid[0])
		ef = EvidenceFactory(data={'task':task1.id, 'type':1000})
		self.assertFalse(ef.is_valid(), msg='invalid evidence type')
		ef = EvidenceFactory(data={'task':task1.id, 'type':Evidence.PHOTO})
		self.assertTrue(ef.is_valid(), msg='init evidence {}'.format(ef.errors))
		ef.save(task=task1)

	def _test_evidence_upload(self):
		filename = 'valid.jpg'
		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + filename
		f = File(open(filepath, 'rb'))
		f.name = filename

		task1 = Task.objects.get(pk=self.tid[0])
		e = Evidence.objects.get(pk=self.tid[0])
		self.assertEqual(task1.evidence, e, msg='same evidence')

		
		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + 'too-big.jpg'
		invalid_f = File(open(filepath, 'rb'), name='too-big.jpg')
		ef = EvidenceFactory(e, data={'file':invalid_f}, partial=True)
		with self.assertRaises(APIErrors.ValidationError, msg='file too big'):
			ef.is_valid()

		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + 'wrong-ext.cpp'
		invalid_f = File(open(filepath, 'rb'), name='wrong-ext.cpp')
		ef = EvidenceFactory(e, data={'file':invalid_f}, partial=True)
		with self.assertRaises(APIErrors.ValidationError, msg='valid file with wrong ext'):
			ef.is_valid()

		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + 'fake.jpg'
		invalid_f = File(open(filepath, 'rb'), name='fake.jpg')
		ef = EvidenceFactory(e, data={'file':invalid_f}, partial=True)
		with self.assertRaises(APIErrors.ValidationError, msg='file with fake valid ext'):
			ef.is_valid()

		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + 'manage.py'
		invalid_f = File(open(filepath, 'rb'), name='manage.py')
		ef = EvidenceFactory(e, data={'file':invalid_f}, partial=True)
		with self.assertRaises(APIErrors.ValidationError, msg='obviously invalid file'):
			ef.is_valid()
		
		ef = EvidenceFactory(e, data={'file':f}, partial=True)
		self.assertTrue(ef.is_valid(), msg='valid jpg image {}'.format(ef.errors))
		ef.save()

		e = Evidence.objects.get(pk=self.tid[0])
		self.assertIsNot(e.file, None, msg='file saved')
		# check that the file is in its right place
		self.assertTrue(os.path.isfile(base_dir + 'test_uploads/task_{}/{}'.format(e.pk, filename)), 
			msg='file saved to uploads') 

		ef = EvidenceFactory(e, data={'file':f}, partial=True)
		with self.assertRaises(APIErrors.AlreadyExists, msg='evidence already exists') as cm:
			ef.is_valid()

		ef = EvidenceFactory(e, data={'type':1}, partial=True)
		with self.assertRaises(APIErrors.AlreadyExists, msg='cannot change type') as cm:
			ef.is_valid()

		e = Evidence.objects.get(pk=self.tid[0])
		e.delete()
		self.assertFalse(os.path.isfile(base_dir + 'test_uploads/task_{}/{}'.format(e.pk, filename)), 
			msg='file removed after object deleted')

	def tearDown(self):
		shutil.rmtree(base_dir + rest_settings.UPLOAD_DIR)

class ConsequenceTestCase(TestCase):

	fb_id = [
		264462346,
	]
	tid = []

	def setUp(self):
		uf = UserFactory(data={'fb_id':self.fb_id[0]})
		if uf.is_valid():
			u = uf.save()
		deadline = datetime.now(timezone.utc) + timedelta(minutes=8000)
		task1 = Task(name='task1', deadline=deadline, owner=u)
		task1.save()
		self.tid.append(task1.id)
		c = Consequence(task=task1)
		c.save()

	
	def test(self):
		self._test_consequence_upload()


	def _test_consequence_upload(self):
		filename = 'valid.jpg'
		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + filename
		f = File(open(filepath, 'rb'))
		f.name = filename

		task1 = Task.objects.get(pk=self.tid[0])
		e = Consequence.objects.get(pk=self.tid[0])
		self.assertEqual(task1.consequence, e, msg='same consequence')

		
		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + 'too-big.jpg'
		invalid_f = File(open(filepath, 'rb'), name='too-big.jpg')
		ef = ConsequenceFactory(e, data={'file':invalid_f}, partial=True)
		with self.assertRaises(APIErrors.ValidationError, msg='file too big'):
			ef.is_valid()

		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + 'wrong-ext.cpp'
		invalid_f = File(open(filepath, 'rb'), name='wrong-ext.cpp')
		ef = ConsequenceFactory(e, data={'file':invalid_f}, partial=True)
		with self.assertRaises(APIErrors.ValidationError, msg='valid file with wrong ext'):
			ef.is_valid()

		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + 'fake.jpg'
		invalid_f = File(open(filepath, 'rb'), name='fake.jpg')
		ef = ConsequenceFactory(e, data={'file':invalid_f}, partial=True)
		with self.assertRaises(APIErrors.ValidationError, msg='file with fake valid ext'):
			ef.is_valid()

		filepath = base_dir + rest_settings.TEST_RESOURCE_DIR + 'manage.py'
		invalid_f = File(open(filepath, 'rb'), name='manage.py')
		ef = ConsequenceFactory(e, data={'file':invalid_f}, partial=True)
		with self.assertRaises(APIErrors.ValidationError, msg='obviously invalid file'):
			ef.is_valid()
		
		ef = ConsequenceFactory(e, data={'file':f}, partial=True)
		self.assertTrue(ef.is_valid(), msg='valid jpg image {}'.format(ef.errors))
		ef.save()

		e = Consequence.objects.get(pk=self.tid[0])
		self.assertIsNot(e.file, None, msg='file saved')
		# check that the file is in its right place
		self.assertTrue(os.path.isfile(base_dir + 'test_uploads/task_{}/{}'.format(e.pk, filename)), 
			msg='file saved to uploads') 

		ef = ConsequenceFactory(e, data={'file':f}, partial=True)
		with self.assertRaises(APIErrors.AlreadyExists, msg='evidence already exists') as cm:
			ef.is_valid()

		ef = ConsequenceFactory(e, data={'message':'my msg'}, partial=True)
		self.assertTrue(ef.is_valid(), msg='new message')
		ef.save()

		ef = ConsequenceFactory(e, data={'message':'my msg'}, partial=True)
		with self.assertRaises(APIErrors.AlreadyExists, msg='cannot change message') as cm:
			ef.is_valid()

		e = Consequence.objects.get(pk=self.tid[0])
		e.delete()
		self.assertFalse(os.path.isfile(base_dir + 'test_uploads/task_{}/{}'.format(e.pk, filename)), 
			msg='file removed after object deleted')

	def tearDown(self):
		shutil.rmtree(base_dir + rest_settings.UPLOAD_DIR)

class UtilsTestCase(TestCase):

	fb_id = [
		264462346,
	]
	user = None

	def setUp(self):
		uf = UserFactory(data={'fb_id':self.fb_id[0], 'username':'alright'})
		if uf.is_valid():
			u = uf.save()
		self.user = u

	def test(self):
		self._test_validate()
		self._test_extract_data()
		self._test_create_GPS_doc()
		self._test_past_deadline()
		self._test_extract_ids()

	def _test_validate(self):
		cf = CategoryFactory(data={'name':None, 'user':self.user.id})
		with self.assertRaises(APIErrors.ValidationError, msg='invalid input'):
			validate(cf)

		cf = CategoryFactory(data={'name':'noname', 'user':self.user.id})
		validate(cf)
		cf.save()

		cf = CategoryFactory(data={'name':'noname', 'user':self.user.id})
		with self.assertRaises(APIErrors.AlreadyExists, msg='already exists (unique set)'):
			validate(cf)

		uf = UserFactory(data={'fb_id':self.fb_id[0]})
		with self.assertRaises(APIErrors.AlreadyExists, msg='already exists (single col)'):
			validate(uf)


		cf = CategoryFactory(data={'name':'a', 'user':59999999})
		with self.assertRaises(APIErrors.DoesNotExist, msg='user does not exist'):
			validate(cf)

	def _test_extract_data(self):
		data = {
			'a':2,
			'b':4,
			'c':6,
			'd':8,
			'e':10,
		}
		opt = ['b','c']
		req = ['a','e']
		rtn = extract_data(data, None, opt)
		self.assertEqual(rtn.get('b'), data['b'], msg='optional elements')
		self.assertIs(rtn.get('a'), None, msg='elem shouldn\'t exist')

		rtn = extract_data(data, req, opt)
		self.assertEqual(rtn.get('c'), data['c'], msg='still optional elements')
		self.assertEqual(rtn.get('a'), data['a'], msg='required elements')
		self.assertIs(rtn.get('d'), None, msg='non req/op element')

		req = ['l']
		with self.assertRaises(APIErrors.MalformedRequestBody, msg='elem not exists'):
			rtn = extract_data(data, req, None)

		rtn = extract_data(data, None, req)
		self.assertEqual(len(rtn), 0, msg='no elem selected {}'.format(rtn))

	def _test_extract_ids(self):
		ids = ''
		with self.assertRaises(APIErrors.BadURLQuery, msg='empty query'):
			extract_ids(ids)

		ids = '434&2q3'
		with self.assertRaises(APIErrors.BadURLQuery, msg='bad query'):
			extract_ids(ids)

		ids = '35&8&90'
		idlist = extract_ids(ids)
		self.assertEqual(len(idlist), 3, msg='3 ids')
		self.assertTrue(90 in idlist and 8 in idlist and 35 in idlist, msg='id elem 90,35,8')

		ids = '2'
		idlist = extract_ids(ids)
		self.assertTrue(2 in idlist and len(idlist) == 1, msg='id elem 2')


	def _test_past_deadline(self):
		t = Task(owner=self.user, name='tname532esf', deadline=datetime.now(timezone.utc) 
			+ timedelta(minutes=500))
		t.save()
		self.assertFalse(past_deadline(t), msg='not yet past')

	def _test_create_GPS_doc(self):
		content = 'file test'
		file = create_GPS_doc(content)
		file_content = file.read()
		self.assertEqual(content, file_content , msg='content {}'.format(file_content))


	def _test_get_random_msg(self):
		img, msg = get_random_msg()
		self.assertIsNone(img)
		self.assertIsNone(msg)

		# TODO: more test cases to come


class TaskTestCase(TestCase):

	user = None
	cat = None

	def setUp(self):
		uf = UserFactory(data={'fb_id':566419})
		uf.is_valid()
		self.user = uf.save()
		cf = CategoryFactory(data={'name':'cat1','user':self.user.id})
		cf.is_valid()
		self.cat = cf.save()

	def test(self):
		self._test_new_task()
		self._test_update_task()
		self._test_complete_task()

	def _test_new_task(self):
		deadline = datetime.now(timezone.utc) + timedelta(
			minutes=rest_settings.DEADLINE_MINUTE_FROM_NOW - 5)
		deadline = calendar.timegm(deadline.timetuple())

		tf = TaskFactory(data={'deadline':deadline, 'owner':self.user.id, 'name':'t1'})
		with self.assertRaises(APIErrors.ValidationError, msg='expire too soon'):
			validate(tf)

		deadline = datetime.now(timezone.utc) + timedelta(
			minutes=rest_settings.DEADLINE_MINUTE_FROM_NOW + 5)
		deadline = calendar.timegm(deadline.timetuple())
		tf = TaskFactory(data={'deadline':deadline, 'owner':self.user.id, 'name':'t1'})
		self.assertTrue(tf.is_valid(), msg='valid task data {}'.format(tf.errors))
		t1 = tf.save()

		tf = TaskFactory(data={'deadline':deadline, 'owner':self.user.id, 'name':'t1'})
		self.assertTrue(tf.is_valid(), msg='valid task data 2')
		t2 = tf.save()
		self.assertNotEqual(t1.id, t2.id, msg='same task data but not the same task')

	def _test_update_task(self):
		t = Task.objects.filter(owner=self.user, name='t1')[0]
		tf = TaskFactory(t, data={'category':self.cat.id}, partial=True)
		self.assertTrue(tf.is_valid(), msg='update category')
		tf.save()

	def _test_complete_task(self):
		deadline = datetime.now(timezone.utc) + timedelta(minutes=-55)
		t3 = Task(name='t3', owner=self.user, deadline=deadline)
		t3.save()
		self.assertTrue(t3.complete(), msg='expired task is completed')

		deadline = datetime.now(timezone.utc) + timedelta(minutes=555)
		t3 = Task(name='t3', owner=self.user, deadline=deadline)
		t3.save()
		e = Evidence(task=t3, type=Evidence.GPS)
		self.assertFalse(t3.complete(), msg='not completed task')

		e.file = create_GPS_doc('{0,0}')
		
		e.save()
		self.assertTrue(t3.complete(), msg='completed task (evidence submitted)')

		e.delete()

	def tearDown(self):
		shutil.rmtree(base_dir + rest_settings.UPLOAD_DIR)

class NotificationTestCase(TestCase):

	fb_id = [
		264462346,
		948463610,
	]

	u = []
	t = None

	def setUp(self):
		uf = UserFactory(data={'fb_id':self.fb_id[0], 'username':'A'})
		if uf.is_valid():
			self.u.append(uf.save())
		uf = UserFactory(data={'fb_id':self.fb_id[1], 'username':'B'})
		if uf.is_valid():
			self.u.append(uf.save())
		deadline = datetime.now(timezone.utc) + timedelta(minutes=555)
		t = Task(name='task', owner=self.u[0], deadline=deadline)
		t.save()
		self.t =  t

	def test(self):
		self._test_send_viewer_invite()
		self._tset_send_reminder()
		self._test_send_evidence()
		self._test_send_deadline_ext()


	def _test_send_viewer_invite(self):
		sender = self.u[0]
		receiver = self.u[1]
		task = self.t
		send_viewer_invite(sender, receiver, task)
		n = Notification.objects.filter(sender=self.u[0], recipient=self.u[1], 
			task=self.t, type=Notification.INVITE, viewed=False)
		self.assertEqual(n.exists(), True, msg='invite sent')
		n = n.get()
		self.assertEqual(n.text, 'A sent you an invite for viewing the task "task".', 
			msg='incorrect msg')

		respond_viewer_invite(receiver, n, False)
		task = Task.objects.get(id=task.id)
		self.assertTrue(receiver not in task.viewers.all(), msg='not yet a viewer')

		send_viewer_invite(sender, receiver, task)
		with self.assertRaises(APIErrors.AlreadyExists, msg='already sent an invite'):
			send_viewer_invite(sender, receiver, task)

		n = Notification.objects.filter(sender=self.u[0], recipient=self.u[1], 
			task=self.t, type=Notification.INVITE, viewed=False)
		self.assertEqual(n.exists(), True, msg='invite sent 2nd time')
		n = n.get()

		respond_viewer_invite(receiver, n, True)
		task = Task.objects.get(id=task.id)
		self.assertTrue(receiver in task.viewers.all(), msg='is a viewer now')

		with self.assertRaises(APIErrors.AlreadyExists, msg='already a viewer'):
			send_viewer_invite(sender, receiver, task)

	def _test_send_deadline_ext(self):
		# test deadline ext
		sender = self.u[0]
		receiver = self.u[1]
		task = self.t
		# bad deadline
		old_deadline = task.deadline
		deadline = datetime.now(timezone.utc)

		with self.assertRaises(APIErrors.ValidationError, msg='bad deadline'):
			send_deadline_ext(sender, task, deadline)
		
		deadline = 'datetime.now(timezone.utc)'
		with self.assertRaises(APIErrors.ValidationError, msg='bad deadline 2'):
			send_deadline_ext(sender, task, deadline)

		deadline = datetime.now(timezone.utc) + timedelta(minutes=2960)
		deadline = calendar.timegm(deadline.timetuple())
		send_deadline_ext(sender, task, deadline)
		n = Notification.objects.filter(task=task, type=Notification.DEADLINE, viewed=False,
			sender=sender, recipient=receiver)
		self.assertTrue(n.exists(), msg='deadline ext req sent')
		n = n.get()
		self.assertEqual(n.text, 'A sent you a request for changing the deadline of the task "task".')
		
		with self.assertRaises(APIErrors.AlreadyExists, msg='repeated deadline req'):
			send_deadline_ext(sender, task, deadline)
		
		respond_deadline_ext(receiver, n, False)
		task = Task.objects.get(id=task.id)
		self.assertEqual(old_deadline, task.deadline, msg='deadline unchanged')
		
		send_deadline_ext(sender, task, deadline)
		
		respond_deadline_ext(receiver, n, True)
		task = Task.objects.get(id=task.id)
		deadline = datetime.fromtimestamp(deadline, timezone.utc)
		self.assertEqual(deadline, task.deadline, msg='deadline extended')
		

	def _tset_send_reminder(self):
		receiver = self.u[0]
		sender = self.u[1]
		task = self.t

		task.last_notify_ts = datetime.now(timezone.utc) - timedelta(days=5)
		task.save()
		send_reminder(sender, task, 'whatsup')
		n = Notification.objects.filter(task=task, type=Notification.REMINDER, viewed=False)
		self.assertEqual(n.get().text, 'whatsup', msg='reminder sent')

		with self.assertRaises(APIErrors.UnpermittedAction, msg='too soon'):
			send_reminder(sender, task, 'whatsup')

		task.last_notify_ts = datetime.now(timezone.utc) - timedelta(days=3)
		task.save()

		send_reminder(sender, task, 'yo')
		n = Notification.objects.filter(task=task, type=Notification.REMINDER, viewed=False)
		self.assertEqual(n.count(), 2, msg='2 reminders sent')

		with self.assertRaises(APIErrors.UnpermittedAction, msg='not receiver'):
			read_notification(sender, n[0])

		read_notification(receiver, n[0])
		n = Notification.objects.filter(task=task, type=Notification.REMINDER, viewed=False)
		self.assertEqual(n.count(), 1, msg='1 reminder remained')



	def _test_send_evidence(self):
		sender = self.u[0]
		receiver = self.u[1]
		task = self.t

		with self.assertRaises(APIErrors.DoesNotExist, msg='no evidence submitted'):
			send_evidence(sender, task)

		e = Evidence(task=task, type=Evidence.PHOTO)
		filename = 'valid.jpg'

		f = File(open(base_dir + rest_settings.TEST_RESOURCE_DIR + filename, 'rb'), name=filename)
		ef = EvidenceFactory(e, data={'file':f}, partial=True)
		validate(ef)
		ef.save()

		send_evidence(sender, task)
		n = Notification.objects.filter(task=task, type=Notification.EVIDENCE, viewed=False)
		self.assertTrue(n.exists(), msg='notified viewer (evidence)')
		self.assertEqual(n.get().file, task.evidence.file, msg='same evidence')
		e.delete()

	def tearDown(self):
		shutil.rmtree(base_dir + rest_settings.UPLOAD_DIR)


class ViewTest(TestCase):

	users = []
	tokens = []
	factory = None
	clients = []
	task_id = -1

	def setUp(self):
		self.factory = APIRequestFactory()
		self.clients.append(APIClient())

	def test(self):
		self._test_user_creation()
		self._test_refresh()
		self._test_invalid_token()
		self._test_special_actions()
		self._test_category()
		self._test_task()
		self._test_notification()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()
		#self._test_refresh()

	def _test_user_creation(self):
		fb_id = 523598
		res = self.clients[0].post('/auth/', {'facebookId':fb_id, 'facebookToken':'faw9T39Wo35'}, format='json')
		self.assertEqual(User.objects.all().count(), 1, msg='one user created')
		self.assertEqual(User.objects.filter(fb_id=fb_id).exists(), True, msg='fb_id has registered')
		self.users.append(res.data['userId'])
		self.tokens.append(res.data['accessToken'])

		res = self.clients[0].post('/auth/', {'facebookId':fb_id, 'facebookToken':'faw9T39Wo35'}, format='json')
		self.assertEqual(User.objects.all().count(), 1, msg='no repeated registeration')

		res = self.clients[0].get('/user/list/', format='json')
		self.assertEqual(res.status_code, 400, 'bad request (missing header)')

		self.clients[0].credentials(HTTP_AUTHORIZATION='JWT ' + self.tokens[0])
		res = self.clients[0].get('/user/list/', format='json')
		self.assertEqual(res.data[0]['userId'], self.users[0], 'permitted action')

		res = self.clients[0].post('/auth/', {'facebookId':5642699, 'facebookToken':'24aFeaYsf'}, format='json')
		self.users.append(res.data['userId'])
		self.tokens.append(res.data['accessToken'])
		self.clients.append(APIClient())
		self.clients[1].credentials(HTTP_AUTHORIZATION='JWT ' + self.tokens[1])
		self.assertEqual(User.objects.all().count(), 2, msg='total # user is 2')

	def _test_refresh(self):
		res = self.clients[0].post('/auth/', {'facebookId':523598, 'facebookToken':'24aFeaYsf'}, format='json')
		rf_tk = res.data['refreshToken']

		res = self.clients[0].post('/refresh/', {'refreshToken':self.tokens[0], 'userId':self.users[0]}, format='json')
		self.assertEqual(res.status_code, 400, 'cannot use access token to refresh')

		res = self.clients[0].post('/refresh/', {'refreshToken':rf_tk, 'userId':self.users[0]}, format='json')
		new_access = res.data['accessToken']
		self.clients[0].credentials(HTTP_AUTHORIZATION='JWT ' + new_access)
		res = self.clients[0].get('/user/list/', format='json')
		self.assertEqual(res.status_code, 200, 'token refreshed')
		self.tokens[0] = new_access

	def _test_invalid_token(self):
		self.clients[0].credentials(HTTP_AUTHORIZATION=self.tokens[0])
		res = self.clients[0].get('/user/list/', format='json')
		self.assertEqual(res.status_code, 400, 'missing JWT')

		self.clients[0].credentials(HTTP_AUTHORIZATION='JWT self.tokens[0]')
		res = self.clients[0].get('/user/list/', format='json')
		self.assertEqual(res.status_code, 400, 'invalid token')

		self.clients[0].credentials(HTTP_AUTHORIZATION='JWT ' + self.tokens[0])

	def _test_special_actions(self):
		res = self.clients[0].post('/user/', {'username':'first-user'}, format='json')
		self.assertEqual(res.status_code, 200, '1st username')

		res = self.clients[0].post('/user/', {'username':'first-user'}, format='json')
		self.assertEqual(res.status_code, 400, 'changing username')

		res = self.clients[1].post('/user/', {'username':'second-user'}, format='json')
		self.assertEqual(res.status_code, 200, '2nd username')

		res = self.clients[0].get('/user/search/user/', format='json')
		self.assertEqual(len(res.data), 2, '2 users with name user')

		res = self.clients[0].get('/user/facebook/{}/'.format(5642699), format='json')
		self.assertEqual(res.data[0]['username'], 'second-user', 'second-user is your fb friend')
		

	def _test_category(self):
		res = self.clients[0].get('/user/categories/', format='json')
		self.assertEqual(len(res.data), 0, msg='no created category')

		res = self.clients[0].post('/user/categories/', format='json')
		self.assertEqual(res.status_code, 400, 'bad request (missing json body)')

		res = self.clients[0].post('/user/categories/', {'name2':'cat1'}, format='json')
		self.assertEqual(res.status_code, 400, 'bad request (missing json body)')

		res = self.clients[0].post('/user/categories/', {'name':'cat1'}, format='json')
		self.assertIsNotNone(res.data.get('categoryId'), msg='created a category')
		self.assertEqual(Category.objects.filter(user_id=self.users[0]).count(), 1, 'created a category in database')
		res = self.clients[0].get('/user/categories/', format='json')
		self.assertEqual(len(res.data), 1, msg='new cat len')

		res = self.clients[0].post('/user/categories/', {'name':'cat1'}, format='json')
		self.assertEqual(res.status_code, 400, 'dup cat')

		res = self.clients[0].post('/user/categories/', {'name':'cat1   '}, format='json')
		self.assertEqual(res.status_code, 400, 'also a dup cat')
		res = self.clients[0].get('/user/categories/', format='json')
		self.assertEqual(len(res.data), 1, msg='len not changed')

		res = self.clients[1].post('/user/categories/', {'name':'cat1'}, format='json')
		self.assertNotEqual(res.status_code, 400, 'not a dup cat for user2')

		res = self.clients[0].post('/user/categories/', {'name':'cat2'}, format='json')
		cat_id = res.data['categoryId']
		res = self.clients[0].get('/user/categories/', format='json')
		self.assertEqual(len(res.data), 2, msg='new cat')

		res = self.clients[0].post('/user/categories/{}/'.format(cat_id), {'name':'cat1'}, format='json')
		self.assertEqual(res.status_code, 400, 'dup cat name')

		res = self.clients[0].post('/user/categories/9999998/', {'name':'cat1'}, format='json')
		self.assertEqual(res.status_code, 400, 'cat not exists / not owned')

		res = self.clients[1].post('/user/categories/{}/'.format(cat_id), {'name':'cat1'}, format='json')
		self.assertEqual(res.status_code, 400, 'not owned cat')

		res = self.clients[0].post('/user/categories/{}/'.format(cat_id), {'name':'cat8'}, format='json')
		self.assertEqual(res.data['name'], 'cat8', msg='new cat name')
		self.assertEqual(Category.objects.filter(user_id=self.users[0], name='cat8').exists(), 1, 'cat name changed in database')

		res = self.clients[1].delete('/user/categories/{}/'.format(cat_id))
		self.assertEqual(res.status_code, 400, 'cant delete other people\'s cat')

		res = self.clients[0].delete('/user/categories/{}/'.format(cat_id))
		res = self.clients[0].post('/user/categories/{}/'.format(cat_id), {'name':'cat1'}, format='json')
		self.assertEqual(res.status_code, 400, 'killed your own cat')



	def _test_task(self):
		res = self.clients[0].post('/user/tasks/', {'name':'task1','description':'this is task1','type':Evidence.PHOTO}, format='json')
		self.assertEqual(res.status_code, 400, 'malformed body (deadline is missing)')

		deadline = datetime.now(timezone.utc) + timedelta(days=-5)
		deadline = calendar.timegm(deadline.timetuple())
		descr = 'this is task1'
		res = self.clients[0].post('/user/tasks/', {'name':'task1','description':descr,'deadline':deadline,'type':Evidence.PHOTO}, format='json')
		self.assertEqual(res.status_code, 400, 'invalid deadline')

		deadline = datetime.now(timezone.utc) + timedelta(days=5)
		deadline = calendar.timegm(deadline.timetuple())
		res = self.clients[0].post('/user/tasks/', {'name':'task1','description':descr,'deadline':deadline,'type':85000}, format='json')
		self.assertEqual(res.status_code, 400, 'invalid type')


		res = self.clients[0].post('/user/tasks/', {'name':'task1','description':descr, 'deadline':deadline,'type':Evidence.PHOTO}, format='json')
		self.assertIsNotNone(res.data.get('taskId'), 'new task created')
		task_id = res.data['taskId']

		res = self.clients[0].get('/user/tasks/', format='json')
		self.assertEqual(len(res.data), 1, 'created one task')
		res = self.clients[0].get('/user/tasks/{}/'.format(task_id), format='json')
		self.assertEqual(res.data[0]['description'], descr, 'task descr saved')
		self.assertEqual(res.data[0]['deadline'], deadline, 'task deadline saved')

		res = self.clients[0].post('/user/tasks/', {'name':'task1','description':descr, 'deadline':deadline,'type':Evidence.PHOTO}, format='json')
		res = self.clients[0].get('/user/tasks/', format='json')
		self.assertEqual(len(res.data), 2, '"dup" task allowed')

		res = self.clients[0].post('/user/tasks/{}/'.format(task_id), {'deadline':0, 'name':'newname'}, format='json')
		res = self.clients[0].get('/user/tasks/{}/'.format(task_id), format='json')
		self.assertEqual(res.data[0]['deadline'], deadline, 'deadline did not change')
		self.assertEqual(res.data[0]['name'], 'newname', 'name did change')

		res = self.clients[1].get('/user/tasks/{}/'.format(task_id), format='json')
		self.assertEqual(len(res.data), 0, 'not owning/viewing the task')
		res = self.clients[1].post('/user/tasks/{}/'.format(task_id), {'name':'noname'}, format='json')
		self.assertEqual(res.status_code, 400, 'not owning the task')

		Task.objects.get(pk=task_id).viewers.add(User.objects.get(pk=self.users[1]))
		res = self.clients[1].post('/user/tasks/{}/'.format(task_id), {'name':'noname'}, format='json')
		self.assertEqual(res.status_code, 400, 'not owning the task')
		res = self.clients[1].get('/user/tasks/{}/'.format(task_id), format='json')
		self.assertEqual(len(res.data), 1, 'viewing the task')
		self.task_id = task_id

	def _test_notification(self):
		res = self.clients[0].post('/user/notifications/', {'type':Notification.INVITE,'recipient':self.users[1],'task':self.task_id}, format='json')
		self.assertEqual(res.status_code, 400, 'already a viewer {}'.format(res.content))

		Task.objects.get(pk=self.task_id).viewers.remove(self.users[1])
		res = self.clients[0].post('/user/notifications/', {'type':Notification.INVITE,'recipient':self.users[1],'task':self.task_id}, format='json')
		self.assertEqual(Notification.objects.filter(sender_id=self.users[0], type=Notification.INVITE).exists(), True, 'invite sent')

	def _test_mixed_usage(self):
		pass