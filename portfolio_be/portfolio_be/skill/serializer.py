from rest_framework import serializers
from skill.models import Skill, SkillImage


class SkillImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SkillImage
        fields = ['id', 'image', 'image_url',  'size', 'dimensions', 'created_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class SkillImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillImage
        fields = ['image']
        extra_kwargs = {
            'image': {'required': True},
        }


class SkillSerializer(serializers.ModelSerializer):
    # Expose the linked SkillImage URL as a flat read-only field
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = [
            'id', 'name', 'description', 'proficiency',
            'years_of_experience', 'count_of_projects',
            'certificate_url', 'skill_image', 'image_url',
            'created_at', 'modified_at',
        ]
        extra_kwargs = {
            'skill_image': {'read_only': True},
            'proficiency': {'required': False, 'allow_null': True},
            'years_of_experience': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_null': True},
            'certificate_url': {'required': False, 'allow_null': True},
            'count_of_projects': {'required': False},
        }

    def get_image_url(self, obj):
        if obj.skill_image and obj.skill_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.skill_image.image.url)
            return obj.skill_image.image.url
        return None