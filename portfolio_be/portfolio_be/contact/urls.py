from django.urls import include, path
from rest_framework.routers import DefaultRouter
from contact.views import SocialMediaViewSet
router = DefaultRouter()
router.register(r'/social-media', SocialMediaViewSet, basename='socialmedia')
urlpatterns = [
    path('', include(router.urls)),
]