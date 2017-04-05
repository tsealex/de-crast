from django.conf.urls import url
from rest_framework.routers import DefaultRouter

from .views import *


urlpatterns = [
	url(r'^auth/$', AuthViewSet.as_view({'post': 'create'})),
	url(r'^list/$', AuthViewSet.as_view({'get': 'list'})), # TODO: remove this
	url(r'^users/$', UserViewSet.as_view({'get': 'list'})), # TODO: remove this
	url(r'^user/$', UserViewSet.as_view({'post': 'update'})),

	url(r'^user/categories/$', CategoryViewSet.as_view({'get': 'list', 'put': 'create'})),
	url(r'^user/categories/(?P<query>.+)/$', CategoryViewSet.as_view({'put': 'update'})),

	url(r'^user/tasks/$', OwnedTaskViewSet.as_view({'get': 'list', 'post': 'create'})),
	url(r'^user/tasks/viewing/$', ViewedTaskViewSet.as_view({'get': 'list'})),
	url(r'^user/tasks/(?P<query>.+)/$', TaskViewSet.as_view({'get': 'retrieve', 'post': 'update'})),

	url(r'^search/(?P<username>[0-9a-zA-Z-]+)/$', SpecialViewSet.as_view({'get': 'search_user'})),
	url(r'^user/friends/(?P<query>.+)/$', SpecialViewSet.as_view({'get': 'get_user_friends'})),
	url(r'^user/perform/(?P<action>[0-9]+)/(?P<query>.+)/$', SpecialViewSet.as_view({'get': 'perform_action'}))
]
