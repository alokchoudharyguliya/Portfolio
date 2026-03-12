from album.models import Album, AlbumImage, Image
from rest_framework import serializers


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlbumImage
        fields = [
            'id',
            'title',
            'image',
            'size',
            'dimensions',
            'created_at',
            'modified_at',
        ]



class ImageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlbumImage
        fields = [
            'image',
        ]


class AlbumSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)

    class Meta:
        model = Album
        fields = '__all__'