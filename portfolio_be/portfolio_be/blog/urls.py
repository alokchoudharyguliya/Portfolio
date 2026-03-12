from django.urls import include, path
from blog.views import BlogPostViewSet
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'', BlogPostViewSet, basename='blogpost')
urlpatterns = [
    path('', include(router.urls)),
]
