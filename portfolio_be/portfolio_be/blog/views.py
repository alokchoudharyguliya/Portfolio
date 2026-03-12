from django.shortcuts import render
from blog.models import BlogPost
from blog.serializer import BlogPostSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from rest_framework.viewsets import ModelViewSet
# Create your views here.
@extend_schema_view(
    get=extend_schema(summary="List all blog posts", responses={200: BlogPostSerializer(many=True)}),
    post=extend_schema(summary="Create a new blog post", request=BlogPostSerializer, responses={201: BlogPostSerializer, 400: None}),
)
class BlogPostViewSet(ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    