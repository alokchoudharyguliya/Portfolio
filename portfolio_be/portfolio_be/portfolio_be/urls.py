"""
URL configuration for portfolio_be project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── OpenAPI schema + docs (excluded from wrapper middleware intentionally) ──
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url='/schema/'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url='/schema/'), name='redoc'),

    # path('api/auth/', include('auth_user.urls')),
    path('api/expense/', include('expense.urls')),
    path('api/todo/', include('todo.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/skill/',include('skill.urls')),
    path('api/album/',include('album.urls')),
    path('api/notepad/', include('notepad.urls')),
    path('api/tracking/', include('tracking.urls')),
    path('api/education/', include('education.urls')),
    # Temporary hard-coded permissions endpoint for frontend testing
    path('api/me/permissions/', include('education.urls_permissions')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
