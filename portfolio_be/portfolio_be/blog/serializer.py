from blog.models import BlogPost
from rest_framework import serializers
class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'html','css']
        read_only_fields = ['id', 'created_at', 'modified_at']