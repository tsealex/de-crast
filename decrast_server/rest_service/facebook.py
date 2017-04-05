import http.client
import os
import json

from .errors import APIErrors
from .settings import rest_settings


class FacebookManager():

	APP_ID = '859339004207573'

	def __init__(self):
		pass

	'''
	Validate the provided Facebook token.
	we should also pass the fb_id to check whether fb_id matches the one for the token
	and  check whether the required permissions are granted
	'''
	def validate_fb_token(self, fb_token, fb_id):
		if not rest_settings.FACEBOOK_AUTHENTICATION:
			return
		self.app_access_token = self.get_app_access_token()
		legal_token = self.verify_fb_token(fb_token, fb_id)
		if not legal_token:
			raise APIError(110)

	'''
	This function gets our application's access token.
 	The application access token is used to verify a user's
 	Facebook access token for authorization.

	Per: https://developers.facebook.com/docs/facebook-login/access-tokens#apptokens
	'''
	def get_app_access_token(self):
		try:
			# App's secret key is stored in a local env var.
			secret_key = rest_settings.FACEBOOK_SECRET_KEY or os.environ['FB_SECRET_KEY'] 

			conn = http.client.HTTPSConnection("graph.facebook.com")
			conn.request("GET", "/oauth/access_token?client_id={}&client_secret={}&" \
				"grant_type=client_credentials".format(APP_ID, secret_key))
			resp = conn.getresponse()
			resp_str = resp.read().decode("utf-8")
			equals_index = resp_str.index('=')

			return resp_str[(equals_index+1):]

		except ValueError as ve:
			print("Illegal access token response: " + str(ve))
			raise APIError(170)
		except Exception as e:
			print("Access token response error: " + str(e))
			raise APIError(170)

	'''
	This function checks to see if the provided FB user access
	token is valid.

	Per: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow#checktoken
	'''
	def verify_fb_token(self, fb_token, fb_id):
		conn = http.client.HTTPSConnection("graph.facebook.com")
		conn.request("GET", "/debug_token?input_token={}&access_token={}"
			.format(fb_token, self.app_access_token))
		resp = conn.getresponse()
		bytes = resp.read()

		as_json = json.loads(bytes.decode("utf-8"))

		if as_json['data']['is_valid']:
			return False

		user_id = as_json['data'].get('user_id')
		if user_id is None or user_id != fb_id:
			return False

		# check if all required permissions are granted
		scopes = as_json['data'].get('scopes')
		if scopes is None: return False
		# https://developers.facebook.com/docs/facebook-login/permissions/#reference-user_hometown
		for permission in rest_settings.FACEBOOK_NEEDED_PERMISSIONS:
			if permission not in scopes:
				return False

		# TODO: maybe we also need to check if the token has expired

		return True


facebook_mgr = FacebookManager()