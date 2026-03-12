from todo.models import Todo
from rest_framework import serializers
class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ['id', 'title', 'description', 'completed', 'created_at', 'modified_at','priority']
        read_only_fields = ['id', 'created_at', 'modified_at']