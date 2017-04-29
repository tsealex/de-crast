from django.conf import settings as djg_settings
from rest_framework.settings import APISettings

import os

USER_SETTINGS = getattr(djg_settings, 'REST_SERVICE', None)

DEFAULTS = {
	'DEBUG_MODE': True,
	'PRINT_ERR_STACK': True,

	'UPLOAD_DIR': 'uploads/',
	'IMAGE_STORAGE_DIR': 'images/',

	'FACEBOOK_AUTHENTICATION': False,
	'FACEBOOK_NEEDED_PERMISSIONS': [],
	'FACEBOOK_SECRET_KEY': None,

	'FCM_SECRET_KEY': None,

	# TODO: multiple-viewer feature is only partially implemented
	'SINGLE_VIEWER': True,
	# whehter a task completion requires viewer acknowledgement
	# TODO: this is just an unimplemented extra feature 
	'VIEWER_ACK': False,

	'EDITABLE_CONSEQUENCE': False,
	# the minimum amount of time from now to deadline when a task is created
	# TODO: Change back to production value eventually ...
	'DEADLINE_MINUTE_FROM_NOW': 1,
	'TASK_DELETION_WAITTIME': 7, # 7 days
	# the amount of time viewer(s) must wait to notify the owner again for a
	# specific task
	'NOTIFICATION_PEROID': 360,

	# magic.gc location, don't need to be set on a Linux machine
	'MAGIC_FILE': None,
	# directory that contains this server (where manage.py is located)
	'TEST_BASE_DIR': None,
	'TEST_RESOURCE_DIR': 'test_props/',
	'TESTING': False,

	'IMAGE_TYPES': ['image/jpeg'],

	'MAX_EVIDENCE_FILE_SIZE': 1024 * 1024 * 2,
	'MAX_CONSEQUENCE_FILE_SIZE': 1024 * 1024 * 2,

	'KARMA_DEDUCTION_ON_TASK_DELETION': 10,
	'KARMA_GAIN_ON_TASK_COMPLETION': 3,

}

IMPORT_STRINGS = (

)

rest_settings = APISettings(USER_SETTINGS, DEFAULTS, IMPORT_STRINGS)
