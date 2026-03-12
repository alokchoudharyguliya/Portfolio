from django.http import JsonResponse
from django.db.models import Q
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import (
    extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
)
from drf_spectacular.types import OpenApiTypes

from notepad.models import Drawing
from notepad.serializer import (
    DrawingSerializer,
    DrawingCreateUpdateSerializer,
    DrawingThumbnailSerializer,
    DrawingListSerializer,
)


# ── Pagination ────────────────────────────────────────

class DrawingPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100


# ── Schema constants ──────────────────────────────────────────────────────────

UPLOAD_THUMBNAIL_SCHEMA = {
    'tags': ['Notepad'],
    'summary': 'Upload a PNG/WebP thumbnail for this drawing',
    'description': (
        'Accepts multipart/form-data with a single `thumbnail` image field. '
        'Replaces any previously stored thumbnail.'
    ),
    'request': {
        'multipart/form-data': {
            'type': 'object',
            'required': ['thumbnail'],
            'properties': {
                'thumbnail': {
                    'type': 'string',
                    'format': 'binary',
                    'description': 'PNG or WebP thumbnail image',
                }
            },
        }
    },
    'responses': {
        200: OpenApiResponse(
            response=DrawingSerializer,
            description='Drawing with updated thumbnail URL'
        ),
        400: OpenApiResponse(description='Validation error'),
    },
}


# ── ViewSet ───────────────────────────────────────────────────────────────────

@extend_schema_view(
    list=extend_schema(
        tags=['Notepad'],
        summary='List all drawings with optional search/filter',
        parameters=[
            OpenApiParameter(
                'search', OpenApiTypes.STR, OpenApiParameter.QUERY,
                description='Search by drawing title (case-insensitive partial match)',
            ),
            OpenApiParameter(
                'ordering', OpenApiTypes.STR, OpenApiParameter.QUERY,
                description='Order by field: created_at (default), -created_at, title, -title',
            ),
            OpenApiParameter(
                'page', OpenApiTypes.INT, OpenApiParameter.QUERY,
                description='Page number (default 1, 24 per page)',
            ),
            OpenApiParameter(
                'page_size', OpenApiTypes.INT, OpenApiParameter.QUERY,
                description='Items per page (max 100, default 24)',
            ),
        ],
        responses={200: DrawingListSerializer(many=True)},
    ),
    create=extend_schema(
        tags=['Notepad'],
        summary='Save a new drawing (strokes + metadata)',
        request=DrawingCreateUpdateSerializer,
        responses={201: DrawingSerializer, 400: None},
    ),
    retrieve=extend_schema(
        tags=['Notepad'],
        summary='Get a single drawing by UUID',
        responses={200: DrawingSerializer, 404: None},
    ),
    update=extend_schema(
        tags=['Notepad'],
        summary='Replace all strokes and metadata for a drawing',
        request=DrawingCreateUpdateSerializer,
        responses={200: DrawingSerializer, 400: None, 404: None},
    ),
    partial_update=extend_schema(
        tags=['Notepad'],
        summary='Partially update a drawing (e.g. append strokes)',
        request=DrawingCreateUpdateSerializer,
        responses={200: DrawingSerializer, 400: None, 404: None},
    ),
    destroy=extend_schema(
        tags=['Notepad'],
        summary='Delete a drawing',
        responses={204: None, 404: None},
    ),
)
class DrawingViewSet(ModelViewSet):
    """
    Full CRUD for canvas drawings.

    * Strokes are stored as JSON (list of stroke objects with relative coords).
    * Thumbnails are uploaded separately via the `/thumbnail/` action so the
      save path is always fast (no canvas-to-blob round trip required).
    * The `/export/` action returns only the stroke JSON for client-side replay.
    * Supports search by title, filtering, and pagination for gallery views.
    """
    queryset = Drawing.objects.all()
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    pagination_class = DrawingPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return DrawingListSerializer
        return DrawingSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Search by title (case-insensitive partial match)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)
        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in ['-created_at', 'created_at', '-title', 'title']:
            qs = qs.order_by(ordering)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return DrawingListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return DrawingCreateUpdateSerializer
        return DrawingSerializer

    # ── Thumbnail upload ──────────────────────────────────────────────────────

    @action(
        detail=True,
        methods=['post'],
        url_path='thumbnail',
        parser_classes=[MultiPartParser, FormParser],
    )
    @extend_schema(**UPLOAD_THUMBNAIL_SCHEMA)
    def thumbnail(self, request, pk=None):
        """Upload or replace the raster thumbnail for this drawing."""
        drawing = self.get_object()
        serializer = DrawingThumbnailSerializer(drawing, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # delete old file from storage before saving new one
        if drawing.thumbnail:
            try:
                drawing.thumbnail.delete(save=False)
            except Exception:
                pass

        serializer.save()
        out = DrawingSerializer(drawing, context={'request': request})
        return Response(out.data, status=status.HTTP_200_OK)

    # ── Strokes export ────────────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='export')
    @extend_schema(
        tags=['Notepad'],
        summary='Export raw stroke JSON for replay',
        description=(
            'Returns only the stroke array and canvas metadata needed '
            'to replay and re-render the drawing at any resolution.'
        ),
        responses={200: OpenApiResponse(description='Stroke export payload')},
    )
    def export(self, request, pk=None):
        """Return the stroke data and canvas meta for client-side replay."""
        drawing = self.get_object()
        return Response({
            'id': str(drawing.id),
            'title': drawing.title,
            'canvas_width': drawing.canvas_width,
            'canvas_height': drawing.canvas_height,
            'device_pixel_ratio': drawing.device_pixel_ratio,
            'strokes': drawing.strokes,
        })
