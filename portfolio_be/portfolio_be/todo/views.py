from django.shortcuts import render
from todo.models import Todo
from todo.serializer import TodoSerializer
from rest_framework import generics
from rest_framework.viewsets import ModelViewSet
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
# Create your views here.
# @extend_schema_view(
#     get=extend_schema(summary="List all todo posts", responses={200: TodoSerializer(many=True)}),
#     post=extend_schema(summary="Create a new todo post", request=TodoSerializer, responses={201: TodoSerializer, 400: None}),
# )
# class TodoAPIView(generics.ListCreateAPIView):
#     queryset = Todo.objects.all()
#     serializer_class = TodoSerializer
    
@extend_schema_view(
    get=extend_schema(summary="List all todo posts (ModelViewSet)", responses={200
: TodoSerializer(many=True)}),
    post=extend_schema(summary="Create a new todo post (ModelViewSet)", request=
TodoSerializer, responses={201: TodoSerializer, 400: None}),
)
class TodoModelViewSet(ModelViewSet):
    serializer_class = TodoSerializer
    queryset = Todo.objects.all()
    def list(self, request, *args, **kwargs):
        # apply filtering/ordering/search backends
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        pending=queryset.filter(completed=False).count()
        completed=queryset.filter(completed=True).count()
        return Response({
            "pending": pending,
            "completed": completed,
            "todos": serializer.data
        })
    # enable ordering by `priority` and searching by `title`
    filter_backends = [OrderingFilter, SearchFilter]
    ordering_fields = ['priority', 'created_at']
    ordering = ['-priority']
    search_fields = ['title']