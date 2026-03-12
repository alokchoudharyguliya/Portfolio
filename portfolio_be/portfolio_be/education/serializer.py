from rest_framework import serializers
from education.models import Achievement, Education, EducationImage


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = [
            'id', 'title', 'description', 'issuer',
            'date', 'result',
            'created_at', 'modified_at',
        ]
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'issuer': {'required': False, 'allow_blank': True},
            'date':  {'required': False, 'allow_null': True},
        }


class EducationImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = EducationImage
        fields = [
            'id', 'title', 'image', 'size', 'dimensions', 'order', 'created_at', 'modified_at',
        ]


class EducationImageUploadSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True)

    class Meta:
        model = EducationImage
        fields = ['image', 'title', 'order']



class EducationSerializer(serializers.ModelSerializer):
    images = EducationImageSerializer(many=True, read_only=True)
    class Meta:
        model = Education
        fields = [
            'id', 'name', 'description', 'institution',
            'start_date', 'end_date', 'coursework', 'score', 'result','images',
            'created_at', 'modified_at',
        ]
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'institution': {'required': False, 'allow_blank': True},
            'start_date':  {'required': False, 'allow_null': True},
            'end_date':    {'required': False, 'allow_null': True},
            'coursework':  {'required': False, 'allow_blank': True},
            'score':       {'required': False, 'allow_blank': True},
            'result':      {'required': False, 'allow_null': True},
        }
        