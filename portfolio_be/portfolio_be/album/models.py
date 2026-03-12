from django.db import models
from base.models import Image, TimestampedModel

# Create your models here.
class Album(TimestampedModel):
    title = models.CharField(max_length=200)
    def __str__(self):
        return self.title
    
class AlbumImage(Image):
    album = models.ForeignKey(Album, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='album/images/')
    order = models.PositiveIntegerField(default=0)  # Optional field to maintain image order within the album

    class Meta:
        ordering = ['order']  # Default ordering by the 'order' field

    def __str__(self):
        return f'{self.album.title} - Image {self.order}'
    
    