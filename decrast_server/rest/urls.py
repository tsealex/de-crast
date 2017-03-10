from django.conf.urls import url

from .views import UserViewSet

urlpatterns = [
    url(r'^users/$', UserViewSet.as_view({'get': 'list'})),
    url(r'^auth/$', UserViewSet.as_view({'post': 'create'})),
    url(r'^user/$', UserViewSet.as_view({'post': 'update'})),
]