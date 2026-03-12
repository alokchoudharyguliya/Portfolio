from django.urls import path, include
from rest_framework.routers import DefaultRouter
from skill.views import SkillViewSet
router = DefaultRouter()
router.register(r'', SkillViewSet, basename='skill')
urlpatterns = [
    path('', include(router.urls)),
]