from django.http import JsonResponse

from .settings import rest_settings

import sys
import traceback

class APIError(Exception):

	def __init__(self, value=170, detail=None):
		self.code = value
		self.msg = errors.get(value)
		self.detail = detail
		if self.msg is None: self.msg = 'unknown error'

	def __str__(self):
		return repr('Error {}: {} ({})'.format(self.code, self.msg, self.detail))

class APIErrors():
	'''
	Thrown when the request contains invalid field value (i.e. username is null)
	'''
	class ValidationError(APIError):
		def __init__(self, detail=None):
			APIError.__init__(self, 165, detail)
	'''
	Thrown when a required attempts to change / view data that the user doesn't
	have the permission to change / view (i.e. changing a task's deadline)
	'''
	class UnpermittedAction(APIError):
		def __init__(self, detail=None):
			APIError.__init__(self, 125, detail)
	'''
	Thrown when a required field is missing in the request body
	'''
	class MalformedRequestBody(APIError):
		def __init__(self, detail=None):
			APIError.__init__(self, 100, detail.replace('\'', ''))
	'''
	Thrown when the url query is not supported by the endpoint (i.e. contains
	multiple ids) or simply is not legal (i.e. id contains non-digit)
	'''
	class BadURLQuery(APIError):
		def __init__(self, detail=None):
			APIError.__init__(self, 195, detail)
	'''
	Thrown if the requested resource doesn't exist or is invisable to the user
	(i.e. a user tries to access a task not yet createdd / invisible to them)
	'''
	class DoesNotExist(APIError):
		def __init__(self, detail=None):
			APIError.__init__(self, 180, detail)
	'''
	Thrown when a resource identified by some key fields in the request body
	already exists 
	'''
	class AlreadyExists(APIError):
		def __init__(self, detail=None):
			APIError.__init__(self, 190, detail)


class ExceptionMiddleware(object):

	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		return self.get_response(request)

	def process_exception(self, request, exception):
		print('\n-----------------------')
		if not isinstance(exception, APIError):
			if rest_settings.DEBUG_MODE:
				if rest_settings.PRINT_ERR_STACK: traceback.print_exc()
				else: print('Unexpected Error: ', exception)
				print('-----------------------')
			return JsonResponse({
				'errorCode': 80,
				'errorMsg': 'internal error',
				'details': None,
			}, status=400)
		else:
			if rest_settings.DEBUG_MODE: print(exception)
			print('-----------------------')
			return JsonResponse({
				'errorCode': exception.code,
				'errorMsg': exception.msg,
				'detail': exception.detail,
			}, status=400)

errors = {
	# errorCode: errorMsg
	80: 'internal error',
	170: 'unknown error',
	
	100: 'malformed request body',
	145: 'malformed request header',

	110: 'facebook authentication failed',
	125: 'unpermitted action',

	115: 'invalid token',
	120: 'token expired',
	160: 'do not match',

	165: 'validation error',
	195: 'bad url query',

	180: 'does not exist',
	190: 'already exists',
}