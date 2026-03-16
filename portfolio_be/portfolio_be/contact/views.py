from contact.models import SocialMedia
from contact.serializer import SocialMediaSerializer
from rest_framework.viewsets import ModelViewSet
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

@extend_schema_view(
    get=extend_schema(summary="List all social media links", responses={200: SocialMediaSerializer(many=True)}),
    post=extend_schema(summary="Create a new social media link", request=SocialMediaSerializer, responses={201: SocialMediaSerializer, 400: None}),
)
class SocialMediaViewSet(ModelViewSet):
    serializer_class = SocialMediaSerializer
    queryset = SocialMedia.objects.all()