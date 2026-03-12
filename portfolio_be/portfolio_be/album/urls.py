from django.urls import include, path
from rest_framework.routers import DefaultRouter
from album.views import AlbumViewSet
router = DefaultRouter()
router.register(r'', AlbumViewSet, basename='album')
urlpatterns = [
    path('', include(router.urls)),
]
