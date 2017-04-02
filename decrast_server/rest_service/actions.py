from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import IntegrityError
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated

from .errors import APIErrors
from .models import *
from .serializers import *
from .factories import *
from .user import User

class SpecialViewSet(viewsets.ViewSet):
	parser_classes = (JSONParser,)
	'''

	'''
	def get_user_by_fb_id(self, request, query):
		# TODO: may need to change in the future
		fb_ids = extract_ids(query)
		queryset = User.objects.filter(fb_id__in=fb_ids)
		serializer = UserSerializer(queryset, many=True)
		return Response(serializer.data)

	'''

	'''
	def get_user_by_username(self, request, username):
		# TODO: input check
		queryset = User.objects.filter(username__contains=username)
		serializer = UserSerializer(queryset, many=True)
		return Response(serializer.data)

