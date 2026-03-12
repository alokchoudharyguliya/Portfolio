from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from django.db.models import Prefetch
from education.models import Education, Achievement, EducationImage
import os
import shutil
import logging
from education.models import Achievement, Education
from education.serializer import (
    EducationSerializer,
    AchievementSerializer,
    EducationImageSerializer,
    EducationImageUploadSerializer,
)
from drf_spectacular.utils import extend_schema_view, extend_schema
from drf_spectacular.openapi import OpenApiResponse, OpenApiTypes
from rest_framework.views import APIView

from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

EDUCATION_FIELDS_SCHEMA = {
    "type": "object",
    "properties": {
        "name":        {"type": "string", "description": "Degree / qualification title"},
        "description": {"type": "string"},
        "institution": {"type": "string"},
        "start_date":  {"type": "string", "format": "date"},
        "end_date":    {"type": "string", "format": "date"},
        "coursework":  {"type": "string", "description": "Comma-separated subjects"},
        "score":       {"type": "string"},
    },
}


@extend_schema_view(
    list=extend_schema(
        summary="List all education entries",
        responses={200: EducationSerializer(many=True)}
    ),
    create=extend_schema(
        summary="Create a new education entry (name required, supports multipart for result file)",
        request={"multipart/form-data": {**EDUCATION_FIELDS_SCHEMA, "required": ["name"]}},
        responses={201: EducationSerializer, 400: OpenApiResponse(response=OpenApiTypes.OBJECT, description="Validation error")}
    ),
    retrieve=extend_schema(
        summary="Get a single education entry by ID",
        responses={200: EducationSerializer, 404: None}
    ),
    update=extend_schema(
        summary="Replace an education entry by ID",
        request={"multipart/form-data": EDUCATION_FIELDS_SCHEMA},
        responses={200: EducationSerializer, 400: None, 404: None}
    ),
    partial_update=extend_schema(
        summary="Partially update an education entry by ID (supports multipart for result file)",
        request={"multipart/form-data": EDUCATION_FIELDS_SCHEMA},
        responses={200: EducationSerializer, 400: None, 404: None}
    ),
    destroy=extend_schema(
        summary="Delete an education entry by ID",
        responses={204: None, 404: None}
    ),
)
class EducationViewSet(ModelViewSet):
    serializer_class = EducationSerializer
    queryset = Education.objects.all().prefetch_related(Prefetch('images', queryset=EducationImage.objects.order_by('order')))
    parser_classes = (JSONParser, MultiPartParser, FormParser)  # Try JSON first, fall back to multipart
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to explicitly delete result file before deleting the instance."""
        instance = self.get_object()
        logger.warning(f"[EDUCATION DELETE] Deleting education {instance.id}, result={instance.result}")
        # Explicitly delete the result file if present
        if instance.result:
            try:
                file_path = instance.result.path if hasattr(instance.result, 'path') else None
                logger.warning(f"[EDUCATION DELETE] File path: {file_path}")
                
                # First try Django's FileField.delete()
                instance.result.delete(save=False)
                logger.warning(f"[EDUCATION DELETE] FileField.delete() completed")
                
                # Fallback: force remove with os and shutil
                if file_path:
                    if os.path.isfile(file_path):
                        try:
                            os.remove(file_path)
                            logger.warning(f"[EDUCATION DELETE] os.remove() succeeded")
                        except Exception as e:
                            logger.error(f"[EDUCATION DELETE] os.remove() failed: {e}")
                    elif os.path.isdir(file_path):
                        try:
                            shutil.rmtree(file_path)
                            logger.warning(f"[EDUCATION DELETE] shutil.rmtree() succeeded")
                        except Exception as e:
                            logger.error(f"[EDUCATION DELETE] shutil.rmtree() failed: {e}")
                    
                    # Final check
                    if os.path.exists(file_path):
                        logger.error(f"[EDUCATION DELETE] File STILL EXISTS after all deletion attempts: {file_path}")
                    else:
                        logger.warning(f"[EDUCATION DELETE] File successfully removed")
            except Exception as e:
                logger.error(f"[EDUCATION DELETE] Error: {type(e).__name__}: {e}", exc_info=True)
        # Now call parent destroy to delete the database record
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def download_result(self, request, pk=None):
        """
        Download the result file for a specific education entry.
        Accessed at: /api/education/{id}/download_result/
        """
        education = self.get_object()
        if not education.result:
            return Response(
                {"error": "No result file available"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        file_path = education.result.path
        if not os.path.exists(file_path):
            return Response(
                {"error": "File not found on server"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            file = open(file_path, 'rb')
            # Determine MIME type based on file extension
            filename = os.path.basename(file_path)
            ext = os.path.splitext(filename)[1].lower()
            mime_type = 'application/pdf' if ext == '.pdf' else 'application/octet-stream'
            
            response = FileResponse(file, content_type=mime_type)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response(
                {"error": f"Error downloading file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Upload or delete education image(s)",
        request={
            "multipart/form-data": {
                "type": "object",
                
                "required": ["image"],
                "properties": {"image": {"type": "string", "format": "binary"},"title": {"type": "string", "description": "Optional caption for the image"}},
            }
        },
        responses={201: EducationImageSerializer, 204: None, 400: OpenApiResponse(response=OpenApiTypes.OBJECT, description="Validation error")}
    )
    @action(detail=True, methods=['post', 'delete'], url_path='image', parser_classes=[MultiPartParser, FormParser])
    def manage_image(self, request, pk=None):
        education = self.get_object()

        if request.method == 'DELETE':
            # Support deleting a single image by id (query param `image_id`)
            image_id = request.query_params.get('image_id') or request.data.get('image_id')
            if image_id:
                try:
                    img = EducationImage.objects.get(pk=image_id, education=education)
                except EducationImage.DoesNotExist:
                    return Response({'detail': 'Image not found.'}, status=status.HTTP_404_NOT_FOUND)
                try:
                    img.image.delete(save=False)
                except Exception:
                    pass
                img.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            # If no image_id provided, show no image_id passed
            return Response({'detail': 'No image_id provided for deletion.'}, status=status.HTTP_400_BAD_REQUEST)
        # POST — upload new image (multiple images allowed)
        serializer = EducationImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance = serializer.save(education=education)

        # Populate size and dimensions if possible
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

        out = EducationImageSerializer(instance, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)

@extend_schema(
    summary="Create a new achievement entry (name required, supports multipart for result file)",
    request={"multipart/form-data": {
        "type": "object",
        "properties": {
            "title":        {"type": "string", "description": "Achievement title"},
            "description": {"type": "string"},
            "date":        {"type": "string", "format": "date"},
            "result":      {"type": "string", "format": "binary", "description": "File upload for achievement result (e.g. certificate). Supported formats: PDF, image files."},
        },
        "required": ["title"]
    }},
    responses={201: AchievementSerializer, 400: OpenApiResponse(response=OpenApiTypes.OBJECT, description="Validation error")}
)
class AchievementViewSet(ModelViewSet):
    serializer_class = AchievementSerializer
    queryset = Achievement.objects.all()
    parser_classes = (JSONParser, MultiPartParser, FormParser)  # Try JSON first, fall back to multipart

    def destroy(self, request, *args, **kwargs):
        """Override destroy to explicitly delete result file before deleting the instance."""
        instance = self.get_object()
        logger.warning(f"[ACHIEVEMENT DELETE] Deleting achievement {instance.id}, result={instance.result}")
        # Explicitly delete the result file if present
        if instance.result:
            try:
                file_path = instance.result.path if hasattr(instance.result, 'path') else None
                logger.warning(f"[ACHIEVEMENT DELETE] File path: {file_path}")
                
                # First try Django's FileField.delete()
                instance.result.delete(save=False)
                logger.warning(f"[ACHIEVEMENT DELETE] FileField.delete() completed")
                
                # Fallback: force remove with os and shutil
                if file_path:
                    if os.path.isfile(file_path):
                        try:
                            os.remove(file_path)
                            logger.warning(f"[ACHIEVEMENT DELETE] os.remove() succeeded")
                        except Exception as e:
                            logger.error(f"[ACHIEVEMENT DELETE] os.remove() failed: {e}")
                    elif os.path.isdir(file_path):
                        try:
                            shutil.rmtree(file_path)
                            logger.warning(f"[ACHIEVEMENT DELETE] shutil.rmtree() succeeded")
                        except Exception as e:
                            logger.error(f"[ACHIEVEMENT DELETE] shutil.rmtree() failed: {e}")
                    
                    # Final check
                    if os.path.exists(file_path):
                        logger.error(f"[ACHIEVEMENT DELETE] File STILL EXISTS after all deletion attempts: {file_path}")
                    else:
                        logger.warning(f"[ACHIEVEMENT DELETE] File successfully removed")
            except Exception as e:
                logger.error(f"[ACHIEVEMENT DELETE] Error: {type(e).__name__}: {e}", exc_info=True)
        # Now call parent destroy to delete the database record
        return super().destroy(request, *args, **kwargs)

    # @extend_schema(
    #     summary="Upload or delete achievement certificate image",
    #     request={
    #         "multipart/form-data": {
    #             "type": "object",
    #             "required": ["image"],
    #             "properties": {"image": {"type": "string", "format": "binary"}},
    #         }
    #     },
    #     responses={201: AchievementImageSerializer, 204: None, 400: OpenApiResponse(response=OpenApiTypes.OBJECT, description="Validation error")}
    # )
    # @action(detail=True, methods=['post', 'delete'], url_path='image', parser_classes=[MultiPartParser, FormParser])
    # def manage_image(self, request, pk=None):
    #     achievement = self.get_object()

    #     if request.method == 'DELETE':
    #         # delete all achievement images
    #         imgs = list(achievement.images.all())
    #         if not imgs:
    #             return Response({'detail': 'No image to delete.'}, status=status.HTTP_404_NOT_FOUND)
    #         for old in imgs:
    #             try:
    #                 old.image.delete(save=False)
    #             except Exception:
    #                 pass
    #             old.delete()
    #         return Response(status=status.HTTP_204_NO_CONTENT)

    #     # POST — upload new image (replace existing to keep single-certificate semantics)
    #     serializer = AchievementImageUploadSerializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)

    #     # remove existing images
    #     for old in list(achievement.images.all()):
    #         try:
    #             old.image.delete(save=False)
    #         except Exception:
    #             pass
    #         old.delete()

    #     # Save and link to achievement in one step
    #     instance = serializer.save(achievement=achievement)

    #     # Populate size and dimensions if possible
    #     try:
    #         instance.size = instance.image.size
    #     except Exception:
    #         pass
    #     try:
    #         from PIL import Image as PilImage
    #         pil = PilImage.open(instance.image.path)
    #         instance.dimensions = f"{pil.width}x{pil.height}"
    #     except Exception:
    #         pass
    #     instance.save()

    #     out = AchievementImageSerializer(instance, context={'request': request})
    #     return Response(out.data, status=status.HTTP_201_CREATED)
    
# Image upload/delete endpoints are implemented on `EducationViewSet.manage_image`


class PermissionsView(APIView):
    """Temporary hard-coded permissions endpoint for frontend testing.

    GET /api/me/permissions/ returns a JSON object describing global and
    resource-scoped permissions. This is intentionally static for early
    frontend work and should be replaced by real auth/permission logic.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        payload = {
            "success": True,
            "message": "",
            "data": {
                "is_superuser": True,
                # Global action flags
                # "can_create_education": True,
                # "can_edit_education": True,
                # "can_delete_education": True,
                # # Feature flags
                # "features": {
                #     "education_edit": True,
                # },
                # # Resource-scoped permissions (example)
                # "scoped": {
                #     "education": {
                #         # education_id: { edit: bool, delete: bool }
                #         "1": {"edit": False, "delete": False},
                #         "2": {"edit": True,  "delete": False},
                #         "3": {"edit": True,  "delete": True},
                #     }
                # }
            }
        }
        return Response(payload, status=status.HTTP_200_OK)