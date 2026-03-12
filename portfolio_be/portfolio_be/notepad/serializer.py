from rest_framework import serializers
from notepad.models import Drawing


class DrawingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list/gallery views — excludes large strokes JSON."""
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Drawing
        fields = [
            'id', 'title', 'thumbnail_url',
            'canvas_width', 'canvas_height',
            'created_at', 'modified_at',
        ]
        read_only_fields = fields

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                # Build absolute URL using request context
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None


class DrawingSerializer(serializers.ModelSerializer):
    """Full read serializer — includes all fields."""

    class Meta:
        model = Drawing
        fields = [
            'id', 'title', 'strokes',
            'canvas_width', 'canvas_height', 'device_pixel_ratio',
            'thumbnail', 'created_at', 'modified_at',
        ]
        read_only_fields = ['id', 'created_at', 'modified_at']


class DrawingCreateUpdateSerializer(serializers.ModelSerializer):
    """Write serializer — accepts stroke data and canvas metadata."""

    class Meta:
        model = Drawing
        fields = [
            'id', 'title', 'strokes',
            'canvas_width', 'canvas_height', 'device_pixel_ratio',
        ]
        read_only_fields = ['id']

    def validate_strokes(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError('strokes must be a JSON array.')
        for i, stroke in enumerate(value):
            if not isinstance(stroke, dict):
                raise serializers.ValidationError(
                    f'Stroke at index {i} must be an object.'
                )
            if 'points' not in stroke or not isinstance(stroke['points'], list):
                raise serializers.ValidationError(
                    f'Stroke at index {i} missing "points" array.'
                )
        return value


class DrawingThumbnailSerializer(serializers.ModelSerializer):
    """Used only for the multipart thumbnail upload action."""
    thumbnail = serializers.ImageField(required=True)

    class Meta:
        model = Drawing
        fields = ['thumbnail']
