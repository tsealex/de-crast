from django.conf.urls import url

from .views import *

urlpatterns = [
    url(r'^auth/$', AuthViewSet.as_view({'post': 'create'})),
    url(r'^list/$', AuthViewSet.as_view({'get': 'list'})),
    url(r'^users/$', UserViewSet.as_view({'get': 'list'})),
    url(r'^user/$', UserViewSet.as_view({'post': 'update'})),
]