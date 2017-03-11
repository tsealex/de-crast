import jwt

from django.contrib.auth import get_user_model
from django.utils.encoding import smart_text
from rest_framework.authentication import (
	BaseAuthentication, get_authorization_header
)

from rest.errors import APIError

from .utils import *
from .settings import settings

class JWTAuthentication(BaseAuthentication):
	'''
	Authenticate an api call (request)
	'''
	def authenticate(self, request):
		token = self.get_token_from_header(request)

		try:
			payload = decode_header(token)
			tk_type = payload.get('type')
			if tk_type is None or tk_type != settings.JWT_ACTK_ID:
				raise APIError(115)
		except jwt.ExpiredSignature:
			raise APIError(120)
		except jwt.DecodeError:
			raise APIError(115, details='DecodeError')
		except jwt.InvalidTokenError:
			raise APIError(115)

		user = self.authenticate_credentials(payload)
		return (user, token)

	'''
	Returns the user object that matches the token payload's user id
	'''
	def authenticate_credentials(self, payload):
		# bascially user.id (not user.username)
		username = get_username_from_payload(payload)
		if not username:
			raise APIError(115)
		try:
			user = get_user_model().objects.get_by_natural_key(username)
		except:
			raise APIError(105)

		return user

	'''
	Returns the access token embeded in the header
	'''
	def get_token_from_header(self, request):
		auth = get_authorization_header(request).split()
		prefix = settings.JWT_AUTH_HEADER_PREFIX.lower()

		if not auth:
			raise APIError(140)

		if len(auth) != 2 or smart_text(auth[0].lower()) != prefix:
			raise APIError(145)

		return auth[1]

