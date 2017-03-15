from django.http import JsonResponse

class APIError(Exception):
	def __init__(self, value=0, details=None):
		self.code = value
		self.msg = errors.get(value)
		self.details = details
		if self.msg is None:
			self.msg = 'unknown error'

	def __str__(self):
		return repr('Error {}: {} ({})'.format(self.code, self.msg, self.details))

class ExceptionMiddleware(object):
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		return self.get_response(request)

	def process_exception(self, request, exception):
		if not isinstance(exception, APIError):
			return JsonResponse({
				'err_code': 80,
				'err_msg': 'internal error',
				'details': exception or '',
			})
		return JsonResponse({
			'err_code': exception.code,
			'err_msg': exception.msg,
			'details': exception.details or '',
		})

errors = {
	80: 'internal error',
	# err_code: err_msg
	100: 'malformatted request body',
	105: 'user does not exist ',
	110: 'facebook authentication failed',
	115: 'invalid access token',
	120: 'token expired',
	125: 'unpermitted action',
	130: 'required facebook permission not granted',
	135: 'disabled user account', # not in use
	140: 'no access token provided',
	145: 'malformatted request header',
	150: 'userId and refresh token do not match',
	155: 'invalid refresh token',
	160: 'userId and access token do not match',
	165: 'invalid input',
	170: 'unknown error',
	175: 'illegal URL parameters',
}
