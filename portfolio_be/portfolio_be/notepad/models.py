import uuid
from django.db import models
from base.models import TimestampedModel


class Drawing(TimestampedModel):
    """
    Stores a user's canvas drawing.

    Stroke data format (stored in `strokes` JSON field):
      [
        {
          "color": "#000000",
          "width": 3,
          "composite": "source-over",    # or "destination-out" for eraser strokes
          "points": [[x, y], [x, y], ...] # relative coords (fraction of canvas)
        },
        ...
      ]

    Using relative coordinates makes strokes device/resolution-independent
    on replay. Scale back by (canvas_width * dpr) when redrawing.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, blank=True, default='Untitled', db_index=True)

    # Stroke data stored as JSON — append-only list of stroke objects.
    # For very large canvases a separate StrokeChunk model can be used instead,
    # but JSONField is optimal for the typical use case here.
    strokes = models.JSONField(default=list, blank=True)

    # Canvas dimensions at save time (CSS pixels, before DPR scaling)
    canvas_width = models.PositiveIntegerField(default=800)
    canvas_height = models.PositiveIntegerField(default=400)
    device_pixel_ratio = models.FloatField(default=1.0)

    # Raster thumbnail (PNG/WebP). Uploaded separately via the /thumbnail/ action.
    # Kept optional so the drawing is always saveable without a render step.
    thumbnail = models.ImageField(
        upload_to='notepad/thumbnails/', blank=True, null=True
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Drawing'
        verbose_name_plural = 'Drawings'

    def __str__(self):
        return f'{self.title} ({self.id})'
