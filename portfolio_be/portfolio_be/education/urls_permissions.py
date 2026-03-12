from django.urls import path
from education.views import PermissionsView

urlpatterns = [
    path('', PermissionsView.as_view(), name='permissions'),
]
