from django.urls import path
from .views import TrackAPIView

urlpatterns = [
    path("collect/", TrackAPIView.as_view(), name="tracking-collect"),
]
