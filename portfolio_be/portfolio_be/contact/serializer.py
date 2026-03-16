from rest_framework import serializers
from contact.models import SocialMedia
class SocialMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMedia
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']