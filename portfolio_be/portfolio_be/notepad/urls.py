from django.urls import include, path
from rest_framework.routers import DefaultRouter
from notepad.views import DrawingViewSet

router = DefaultRouter()
router.register(r'', DrawingViewSet, basename='drawing')

urlpatterns = [
    path('', include(router.urls)),
]
