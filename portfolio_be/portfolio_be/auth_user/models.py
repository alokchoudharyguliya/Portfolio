from django.db import models
from base.models import TimestampedModel
# Create your models here.
class User(TimestampedModel):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.email