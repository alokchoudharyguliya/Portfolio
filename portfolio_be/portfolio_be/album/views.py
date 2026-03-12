from django.shortcuts import render
from album.models import Album, Image
from album.serializer import AlbumSerializer, ImageSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from album.serializer import ImageCreateSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from drf_spectacular.types import OpenApiTypes


UPLOAD_IMAGE_SCHEMA = {
    "tags": ["Album"],
    "summary": "Upload an image to the album (multipart/form-data)",
    "description": "Upload a single image file. Required field: `image`. Optional: `title`.",
    "request": {
        "multipart/form-data": {
            "type": "object",
            "required": ["image"],
            "properties": {
                "image": {
                    "type": "string",
                    "format": "binary",
                    "description": "Image file to upload"
                },
                "title": {
                    "type": "string",
                    "description": "Optional image title"
                }
            }
        }
    },
    "responses": {
        201: OpenApiResponse(response=OpenApiTypes.OBJECT, description="Created image returned"),
        200: OpenApiResponse(response=OpenApiTypes.OBJECT, description="List of images"),
        400: OpenApiResponse(response=OpenApiTypes.OBJECT, description="Validation error")
    }
}

# Create your views here.

@extend_schema_view(
    get=extend_schema(summary="List all albums", responses={200: AlbumSerializer(many=True)}),
    post=extend_schema(summary="Create a new album", request=AlbumSerializer, responses={201: AlbumSerializer, 400: None}),
    images=extend_schema(**UPLOAD_IMAGE_SCHEMA),
)
class AlbumViewSet(ModelViewSet):
    serializer_class = AlbumSerializer
    # prefetch images to avoid N+1 when serializing nested images
    queryset = Album.objects.prefetch_related('images').all()

    @action(detail=True, methods=['get', 'post'], parser_classes=[MultiPartParser, FormParser])
    def images(self, request, pk=None):
        """Return a list of images belonging to this album or allow uploading an image to this album.

        GET: list images
        POST: upload a new image (multipart/form-data) with fields `title` and `image`.
        """
        album = self.get_object()

        if request.method == 'POST':
            serializer = ImageCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save(album=album)

            # attempt to populate size and dimensions
            try:
                # file size in bytes
                file_obj = instance.image
                try:
                    instance.size = file_obj.size
                except Exception:
                    pass

                # dimensions using Pillow if available or ImageField attributes
                try:
                    width = getattr(file_obj, 'width', None)
                    height = getattr(file_obj, 'height', None)
                    if width and height:
                        instance.dimensions = f"{width}x{height}"
                    else:
                        from PIL import Image as PilImage
                        pil_img = PilImage.open(file_obj.path)
                        instance.dimensions = f"{pil_img.width}x{pil_img.height}"
                except Exception:
                    pass

                instance.save()
            except Exception:
                # ignore population errors and continue
                instance.save()

            out = ImageSerializer(instance, context={'request': request})
            return Response(out.data, status=status.HTTP_201_CREATED)

        images_qs = album.images.all()

        # support pagination if configured
        page = self.paginate_queryset(images_qs)
        if page is not None:
            serializer = ImageSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = ImageSerializer(images_qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path=r'images/(?P<image_pk>[^/.]+)')
    @extend_schema(responses={204: OpenApiResponse(description="Image deleted")})
    def delete_image(self, request, pk=None, image_pk=None):
        """Delete an image belonging to this album and remove its file from storage."""
        album = self.get_object()
        try:
            img = album.images.get(pk=image_pk)
        except album.images.model.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # remove file from storage
        try:
            img.image.delete(save=False)
        except Exception:
            pass

        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path=r'images/(?P<image_pk>[^/.]+)/move')
    @extend_schema(
        summary="Move an image from this album to another",
        request={"application/json": {"type": "object", "properties": {"target_album": {"type": "integer"}}}},
        responses={200: ImageSerializer}
    )
    def move_image(self, request, pk=None, image_pk=None):
        """Move an image from this album to another album.

        POST body: { "target_album": <album_id> }
        """
        album = self.get_object()
        try:
            img = album.images.get(pk=image_pk)
        except album.images.model.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        target_album_id = request.data.get('target_album')
        if not target_album_id:
            return Response({"detail": "target_album is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_album = Album.objects.get(pk=target_album_id)
        except Album.DoesNotExist:
            return Response({"detail": "Target album not found."}, status=status.HTTP_404_NOT_FOUND)

        img.album = target_album
        img.save()
        out = ImageSerializer(img, context={'request': request})
        return Response(out.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """When deleting an album, move its images to a fallback 'other/untagged' album instead of deleting them."""
        album = self.get_object()

        # ensure we have a fallback album to keep untagged images
        untagged_album, _ = Album.objects.get_or_create(title='other/untagged')

        # move images in bulk to the untagged album
        images_qs = album.images.all()
        if images_qs.exists():
            images_qs.update(album=untagged_album)

        return super().destroy(request, *args, **kwargs)


class ImageViewSet(ModelViewSet):
    """List and manage all images. Each image includes `album_id` and `album_title`."""
    serializer_class = ImageSerializer
    queryset = Image.objects.select_related('album').all()