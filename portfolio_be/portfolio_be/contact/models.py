from django.db import models

from base.models import TimestampedModel

class SocialMedia(TimestampedModel):
    name = models.CharField(max_length=100)
    url = models.URLField()
    icon_url=models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name