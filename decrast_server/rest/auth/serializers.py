from rest_framework import serializers
from rest.models import User
from rest.errors import APIError

from .utils import *
from .settings import settings

''''
Used to validate a user-provided Facebook access token. Once verified, log the
user in or, if the user hasn't registered, register the user.
Returns a JSON Web token that can be used to authenticate later calls
'''
class JWTSerializer(serializers.Serializer):
	def __init__(self, *args, **kwargs):
		super(JWTSerializer, self).__init__(*args, **kwargs)
		self.fields['fb_id'] = serializers.IntegerField()
		self.fields['fb_tk'] = serializers.CharField()

	@property
	def object(self):
		return self.validated_data

	def validate(self, data):
		credentials = {
			'fb_id': data.get('fb_id'),
			'fb_tk': data.get('fb_tk'),
		}

		if all(credentials.values()):
			# TODO: validate the user-provided facebook token with FB server

			user = None
			try:
				user = User.objects.get(fb_id=credentials['fb_id'])
			except:
				user = User.objects.create_user(fb_id=credentials['fb_id'])

			ac_payload, ac_exp = create_payload(user, settings.JWT_ACTK_ID)
			rf_payload, rf_exp = create_payload(user, settings.JWT_RFTK_ID)

			return {
				'user': user,
				'ac_tk': encode_header(ac_payload),
				'rf_tk': encode_header(rf_payload),
				'ac_exp': ac_exp,
				'rf_exp': rf_exp,
			}
		else:
			raise APIError(100)

class RefreshSerializer(serializers.Serializer):
	def __init__(self, *args, **kwargs):
		super(RefreshSerializer, self).__init__(*args, **kwargs)
		self.fields['uid'] = serializers.IntegerField()
		self.fields['rf_tk'] = serializers.CharField()

	@property
	def object(self):
		return self.validated_data

	def validate(self, data):
		token = data.get('rf_tk')
		uid = data.get('uid')

		if uid is not None and token is not None:
			try:
				payload = decode_header(token)
				tk_type = payload.get('type')
				if not tk_type or tk_type != settings.JWT_RFTK_ID:
					raise APIError(155)

				username = get_username_from_payload(payload)
				if not username:
					raise APIError(115)
				if username != uid:
					raise APIError(150)
				user = User.objects.get_by_natural_key(username)
				ac_payload, ac_exp = create_payload(user, settings.JWT_ACTK_ID)

				return {
					'user': user,
					'ac_tk': encode_header(ac_payload),
					'rf_tk': token,
					'ac_exp': ac_exp,
				}
			except jwt.ExpiredSignature:
				raise APIError(120)
			except jwt.InvalidTokenError:
				raise APIError(155)
			except User.DoesNotExist:
				raise APIError(105)
			except jwt.DecodeError:
				raise APIError(80, details='DecodeError')
		else:
			raise APIError(100)