# from expense.views import ExpenseAPIView, ExpenseView
from expense.views import ExpenseModelViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', ExpenseModelViewSet, basename='expense')
urlpatterns = [
    path('', include(router.urls)),
    # path('expenses-api/', ExpenseAPIView.as_view(), name='expense-list-create'),
    # path('expenses-generic/', ExpenseGenericViewSet.as_view({'get': 'list', 'post': 'create'}), name='expense-generic-list-create'),
    # path('expenses-modelviewset/', ExpenseModelViewSet.as_view({'get': 'list', 'post': 'create', 'get': 'retrieve'}), name='expense-modelviewset'),
]