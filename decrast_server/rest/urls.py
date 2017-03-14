from django.conf.urls import url

from .views import *

urlpatterns = [
	url(r'^auth/$', AuthViewSet.as_view({'post': 'create'})),
	url(r'^list/$', AuthViewSet.as_view({'get': 'list'})),
	url(r'^users/$', UserViewSet.as_view({'get': 'list'})),
	url(r'^user/$', UserViewSet.as_view({'post': 'update'})),
	url(r'^user/category/$', CategoryViewSet.as_view({'put': 'add'})),
	url(r'^user/categories/$', CategoryViewSet.as_view({'get': 'list'})),
	url(r'^user/categories/$', CategoryViewSet.as_view({'get': 'list'})),
	url(r'^user/tasks/$', TaskViewSet.as_view({'get': 'list', 'post': 'add'})),
]
