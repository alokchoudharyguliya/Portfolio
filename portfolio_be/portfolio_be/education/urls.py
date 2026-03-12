from django.urls import path, include
from rest_framework.routers import DefaultRouter
from education.views import AchievementViewSet, EducationViewSet
router = DefaultRouter()
# Register achievements first so the explicit 'achievements/' list route
# does not get shadowed by the generic education detail route (which
# matches any single path segment and could capture 'achievements').
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'', EducationViewSet, basename='education')
urlpatterns = [
    path('', include(router.urls)),
    path('permissions/', include('education.urls_permissions')),
]
