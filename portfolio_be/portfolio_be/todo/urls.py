from django.urls import path,include
# from todo.views import TodoAPIView
from todo.views import TodoModelViewSet
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'', TodoModelViewSet, basename='todo') 
urlpatterns = [
    # path('todos/', TodoAPIView.as_view(), name='todo-list-create'),
    # path('', TodoModelViewSet.as_view({'get': 'list', 'post': 'create', 'put': 'update', 'delete': 'destroy'}), name='todo-list-create-mv'),
    path('', include(router.urls)),
]