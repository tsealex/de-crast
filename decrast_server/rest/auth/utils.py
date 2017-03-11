import jwt
from calendar import timegm
from datetime import datetime

from .settings import settings

def create_payload(user, tk_type=settings.JWT_ACTK_ID):
	exp_delta = settings.JWT_AC_EXP if tk_type == settings.JWT_ACTK_ID else settings.JWT_RF_EXP
	exp_time = datetime.utcnow() + exp_delta
	payload = {
		'type': tk_type,
		'exp': exp_time,
	}
	# the username here refers to user id (Django thing)
	payload[get_username_field()] = get_username(user)
	return payload, exp_time

def get_username_from_payload(payload):
	return payload.get(get_username_field())

def encode_header(payload):
	return jwt.encode(
		payload,
		settings.JWT_PRIVATE_KEY or settings.JWT_SECRET_KEY,
		settings.JWT_ALGORITHM
	).decode('utf-8')

def decode_header(token):
	return jwt.decode(
		token,
		settings.JWT_PRIVATE_KEY or settings.JWT_SECRET_KEY,
		settings.JWT_VERIFY,
		options={'verify_exp': settings.JWT_VERIFY_EXPIRATION},
		leeway=settings.JWT_LEEWAY,
		audience=settings.JWT_AUDIENCE,
		issuer=settings.JWT_ISSUER,
		algorithms=[settings.JWT_ALGORITHM]
	)

def get_username_field():
	try:
		field = get_user_model().USERNAME_FIELD
	except:
		field = 'username'
	return field

def get_username(user):
	try:
		username = user.get_username()
	except:
		username = user.username
	return username