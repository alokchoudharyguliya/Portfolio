import uuid
from django.db import models
from tracking.utils import hash_ip
from django.utils import timezone

from base.models import TimestampedModel

class Visitor(TimestampedModel):
	"""Optional first-party anonymous visitor record.

	This stores a short-lived, non-PII identifier you may set in a first-party
	cookie when a user consents. Avoid storing raw IPs or PII here.
	"""

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	anon_id = models.CharField(max_length=64, unique=True, db_index=True)
	last_seen = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = "tracking_visitor"

	def __str__(self) -> str:  # pragma: no cover - trivial
		return f"Visitor {self.anon_id}"


class PageView(models.Model):
	"""A single page view / hit record.

	Store only minimal, anonymized data. Compute `ip_hash` server-side before
	saving (use `_hash_ip()` helper or your view). Keep `consent` to ensure
	storage respects user choice.
	"""

	id = models.BigAutoField(primary_key=True)
	visitor = models.ForeignKey(
		Visitor,
		null=True,
		blank=True,
		on_delete=models.SET_NULL,
		related_name="pageviews",
	)
	ip_hash = models.CharField(max_length=64, db_index=True, blank=True)
	path = models.CharField(max_length=2048)
	method = models.CharField(max_length=10, default="GET")
	user_agent = models.CharField(max_length=512, blank=True)
	referrer = models.CharField(max_length=2048, blank=True)
	timestamp = models.DateTimeField(default=timezone.now, db_index=True)
	consent = models.BooleanField(default=False, db_index=True)
	meta = models.JSONField(null=True, blank=True)

	class Meta:
		db_table = "tracking_pageview"
		indexes = [
			models.Index(fields=["ip_hash"]),
			models.Index(fields=["timestamp"]),
			models.Index(fields=["consent"]),
		]

	def save(self, *args, **kwargs):
		# ensure ip_hash is normalized (in case callers passed raw ip)
		if self.ip_hash and len(self.ip_hash) != 32:
			self.ip_hash = hash_ip(self.ip_hash)
		super().save(*args, **kwargs)

	def __str__(self) -> str:  # pragma: no cover - trivial
		return f"PageView {self.path} @ {self.timestamp.isoformat()}"

