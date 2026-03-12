from django.db import models

# Create your models here.
class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        
class Image(TimestampedModel):
    title = models.CharField(max_length=200)
    size = models.PositiveIntegerField(blank=True, null=True)  # Optional field to store file size in bytes
    dimensions = models.CharField(max_length=50, blank=True, null=True)  # Optional field to store dimensions like "800x600"
    
    def __str__(self):
        return self.title