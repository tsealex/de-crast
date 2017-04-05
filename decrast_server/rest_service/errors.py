from django.http import JsonResponse

import sys

class APIError(Exception):
	def __init__(self, value=0, detail=None):
		self.code = value
		self.msg = errors.get(value)
		self.detail = detail
		if self.msg is None:
			self.msg = 'unknown error'

	def __str__(self):
		return repr('Error {}: {} ({})'.format(self.code, self.msg, self.detail))

class APIErrors():
	'''
	Thrown when the request contains invalid field value (i.e. username is null)
	'''
	class InvalidInput(APIError):
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
			APIError.__init__(self, 100, detail)
	'''
	Thrown when the url query is not supported by the endpoint (i.e. contains
	multiple ids) or simply is not legal (i.e. id contains non-digit)
	'''
	class BadURLQuery(APIError):
		def __init__(self, detail=None):
			APIError.__init__(self, 195, detail)
	'''
	Thrown if the requested resource doesn't exist or is invisable to the user
	(i.e. a user tries to access a task not yet created / not created by themselves)
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
		if not isinstance(exception, APIError):
			e_type, e_obj, e_tb = sys.exc_info()
			print('ERROR at line {} in {}: {}'.format(e_tb.tb_frame.f_code \
				.co_filename, e_tb.tb_lineno, e_type))
			return JsonResponse({
				'errorCode': 80,
				'errorMsg': 'internal error',
			#	'details': exception or '',
			})
		return JsonResponse({
			'errorCode': exception.code,
			'errorMsg': exception.msg,
			'detail': exception.detail or '',
		})

errors = {
	80: 'internal error',
	# err_code: err_msg
	100: 'malformed request body',
	105: 'user does not exist ',
	110: 'facebook authentication failed',
	115: 'invalid access token',
	120: 'token expired',
	125: 'unpermitted action',
	130: 'required facebook permission not granted',
	135: 'disabled user account', # not in use
	140: 'no access token provided',
	145: 'malformed request header',
	150: 'userId and refresh token do not match',
	155: 'invalid refresh token',
	160: 'do not match',
	165: 'invalid input',
	170: 'unknown error',
	175: 'illegal URL parameters',
	180: 'does not exist',
	190: 'already exists',
	195: 'bad url query',
}

def missing(key):
	return 'missing {}'.format(key.replace('\'', ''))