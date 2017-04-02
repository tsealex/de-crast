import datetime

from django.conf import settings as djg_settings
from rest_framework.settings import APISettings

USER_SETTINGS = getattr(djg_settings, 'JWT_AUTH', None)

DEFAULTS = {
	'JWT_ALGORITHM': 'HS256',

	'JWT_PRIVATE_KEY': None,
	'JWT_PUBLIC_KEY': None,

	'JWT_SECRET_KEY': djg_settings.SECRET_KEY,

	'JWT_AC_EXP': datetime.timedelta(days=60), # seconds=1200
	'JWT_RF_EXP': datetime.timedelta(days=60), # days=14

	'JWT_VERIFY': True,
	'JWT_VERIFY_EXPIRATION': True,
	'JWT_LEEWAY': 0,
	'JWT_AUDIENCE': None,
	'JWT_ISSUER': None,

	'JWT_ACTK_ID': 'ACCESS',
	'JWT_RFTK_ID': 'REFRESH',
	'JWT_AUTH_HEADER_PREFIX': 'JWT',
}

IMPORT_STRINGS = (
	'JWT_ENCODE_HANDLER',
	'JWT_DECODE_HANDLER',
	'JWT_PAYLOAD_HANDLER',
	'JWT_PAYLOAD_GET_USER_ID_HANDLER',
	'JWT_PAYLOAD_GET_USERNAME_HANDLER',
	'JWT_RESPONSE_PAYLOAD_HANDLER',
)

settings = APISettings(USER_SETTINGS, DEFAULTS, IMPORT_STRINGS)