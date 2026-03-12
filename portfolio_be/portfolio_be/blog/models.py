from django.db import models

from base.models import TimestampedModel

# Create your models here.
class BlogPost(TimestampedModel):
    title = models.CharField(max_length=200)
    html = models.TextField()
    css = models.TextField(blank=True)

    def __str__(self):
        return self.title