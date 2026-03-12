from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from drf_spectacular.openapi import OpenApiTypes
from skill.serializer import SkillSerializer, SkillImageUploadSerializer, SkillImageSerializer
from skill.models import Skill


SKILL_FIELDS_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "description": {"type": "string"},
        "proficiency": {"type": "integer", "description": "1-5"},
        "years_of_experience": {"type": "number"},
        "count_of_projects": {"type": "integer"},
        "certificate_url": {"type": "string"},
    }
}

SKILL_IMAGE_SCHEMA = {
    "multipart/form-data": {
        "type": "object",
        "required": ["image"],
        "properties": {
            "image": {"type": "string", "format": "binary", "description": "Skill image file"},
            "caption": {"type": "string", "description": "Optional caption"},
        }
    }
}


@extend_schema_view(
    list=extend_schema(
        summary="List all skills",
        responses={200: SkillSerializer(many=True)}
    ),
    create=extend_schema(
        summary="Create a new skill (name only required)",
        request={"application/json": {**SKILL_FIELDS_SCHEMA, "required": ["name"]}},
        responses={201: SkillSerializer, 400: OpenApiResponse(response=OpenApiTypes.OBJECT, description="Validation error")}
    ),
    retrieve=extend_schema(
        summary="Get a single skill by ID",
        responses={200: SkillSerializer, 404: None}
    ),
    update=extend_schema(
        summary="Replace a skill by ID",
        request={"application/json": SKILL_FIELDS_SCHEMA},
        responses={200: SkillSerializer, 400: None, 404: None}
    ),
    partial_update=extend_schema(
        summary="Partially update a skill by ID",
        request={"application/json": SKILL_FIELDS_SCHEMA},
        responses={200: SkillSerializer, 400: None, 404: None}
    ),
    destroy=extend_schema(
        summary="Delete a skill by ID",
        responses={204: None, 404: None}
    ),
)
class SkillViewSet(ModelViewSet):
    serializer_class = SkillSerializer
    queryset = Skill.objects.select_related('skill_image').all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @extend_schema(
        summary="Upload or replace the skill image",
        request=SKILL_IMAGE_SCHEMA,
        responses={
            201: SkillImageSerializer,
            400: OpenApiResponse(response=OpenApiTypes.OBJECT, description="Validation error"),
            404: None,
        }
    )
    @action(detail=True, methods=['post', 'delete'], url_path='image', parser_classes=[MultiPartParser, FormParser])
    def manage_image(self, request, pk=None):
        skill = self.get_object()

        if request.method == 'DELETE':
            if not skill.skill_image:
                return Response({'detail': 'No image to delete.'}, status=status.HTTP_404_NOT_FOUND)
            old = skill.skill_image
            skill.skill_image = None
            skill.save(update_fields=['skill_image'])
            try:
                old.image.delete(save=False)
            except Exception:
                pass
            old.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        # POST — upload / replace
        serializer = SkillImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Delete existing SkillImage record and its file
        if skill.skill_image:
            old = skill.skill_image
            skill.skill_image = None
            skill.save(update_fields=['skill_image'])
            try:
                old.image.delete(save=False)
            except Exception:
                pass
            old.delete()

        instance = serializer.save()

        # Populate size and dimensions
        try:
            instance.size = instance.image.size
        except Exception:
            pass
        try:
            from PIL import Image as PilImage
            pil = PilImage.open(instance.image.path)
            instance.dimensions = f"{pil.width}x{pil.height}"
        except Exception:
            pass
        instance.save()

        # Link to skill
        skill.skill_image = instance
        skill.save(update_fields=['skill_image'])

        out = SkillImageSerializer(instance, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)
