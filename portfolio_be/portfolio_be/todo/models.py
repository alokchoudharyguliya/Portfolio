from django.db import models
from base.models import TimestampedModel

# Create your models here.
class Todo(TimestampedModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    priority = models.IntegerField(default=0)
    def __str__(self):
        return self.title