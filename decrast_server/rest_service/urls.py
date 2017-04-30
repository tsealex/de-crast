from django.conf.urls import url
from rest_framework.routers import DefaultRouter

from .views import *
from .actions import *



urlpatterns = [
	# Temporary / Debugging Views
	url(r'^list/$', AuthViewSet.as_view({'get': 'list'})), # TODO: remove this
	url(r'^user/list/$', UserViewSet.as_view({'get': 'list'})), # TODO: remove this
	url(r'^meme/image/$', MemePopulator.as_view({'post': 'image'})),
	url(r'^meme/message/$', MemePopulator.as_view({'post': 'message'})),
	url(r'^meme/image/(?P<query>.+)/$', MemePopulator.as_view({'delete': 'del_image'})),
	url(r'^meme/message/(?P<query>.+)/$', MemePopulator.as_view({'delete': 'del_message'})),


	# Authentication
	url(r'^refresh/$', AuthViewSet.as_view({'post': 'update'})),
	url(r'^auth/$', AuthViewSet.as_view({'post': 'create'})),

	# User
	url(r'^user/$', UserViewSet.as_view({'post': 'update'})),
	
	# Category
	url(r'^user/categories/$', CategoryViewSet.as_view({'get': 'list', 'post': 'create'})),
	url(r'^user/categories/(?P<query>.+)/$', CategoryViewSet.as_view({'delete': 'destroy', 'post': 'update'})),

	# Consequence
	url(r'^user/tasks/(?P<query>.+)/consequence/$', ConsequenceViewSet.as_view({'post': 'update', 'get': 'retrieve'})),
	url(r'^user/tasks/(?P<query>.+)/consequence/file/$', ConsequenceViewSet.as_view({'get': 'file'})),

	# Evidence
	url(r'^user/tasks/(?P<query>.+)/evidence/$', EvidenceViewSet.as_view({'post': 'update', 'get': 'retrieve'})),
	url(r'^user/tasks/(?P<query>.+)/evidence/file/$', EvidenceViewSet.as_view({'get': 'file'})),

	# Task
	url(r'^user/tasks/$', OwnedTaskViewSet.as_view({'get': 'list', 'post': 'create'})),
	url(r'^user/tasks/viewing/$', ViewedTaskViewSet.as_view({'get': 'list'})),
	url(r'^user/tasks/(?P<query>.+)/$', TaskViewSet.as_view({'get': 'retrieve', 'post': 'update'})),

	# Notification
	url(r'^user/notifications/$', NotificationViewSet.as_view({'get': 'list', 'post': 'create'})),
	url(r'^user/notifications/respond/$', NotificationViewSet.as_view({'post': 'update'})),
	url(r'^user/notifications/(?P<query>.+)/task/$', NotificationViewSet.as_view({'get': 'task'})),
	url(r'^user/notifications/(?P<query>.+)/file/$', NotificationViewSet.as_view({'get': 'file'})),
	url(r'^user/notifications/(?P<query>.+)/$', NotificationViewSet.as_view({'get': 'retrieve'})),

	# Special Actions	
	url(r'^user/search/(?P<username>[0-9a-zA-Z-]+)/$', SpecialViewSet.as_view({'get': 'get_user_by_username'})),
	url(r'^user/facebook/(?P<query>.+)/$', SpecialViewSet.as_view({'get': 'get_user_by_fb_id'})),

]
