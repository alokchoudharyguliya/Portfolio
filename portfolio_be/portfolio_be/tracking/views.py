from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import JSONParser

from django.utils import timezone

from tracking.serializer import PageViewSerializer

class TrackAPIView(APIView):
	"""Accept lightweight tracking beacons (POST).

	Expected payload (JSON): { path, method?, user_agent?, referrer?, timestamp?, anon_id? }
	Server will determine IP from request headers and will set `consent` based on
	`analytics_consent` cookie (value '1' => True).
	"""

	permission_classes = [permissions.AllowAny]
	parser_classes = [JSONParser]

	def post(self, request, *args, **kwargs):
		data = request.data.copy()

		# Infer consent from cookie if not provided explicitly
		consent_cookie = request.COOKIES.get("analytics_consent")
		if "consent" not in data:
			data["consent"] = True if consent_cookie == "1" else False

		# Determine client IP (simple heuristic)
		xff = request.META.get("HTTP_X_FORWARDED_FOR")
		if xff:
			ip = xff.split(",")[0].strip()
		else:
			ip = request.META.get("REMOTE_ADDR", "")

		# Attach raw ip; PageView.save() will hash it.
		data["ip_hash"] = ip

		# If timestamp wasn't provided, use server time
		if not data.get("timestamp"):
			data["timestamp"] = timezone.now()

		serializer = PageViewSerializer(data=data)
		if serializer.is_valid():
			serializer.save()
			return Response(status=status.HTTP_204_NO_CONTENT)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

