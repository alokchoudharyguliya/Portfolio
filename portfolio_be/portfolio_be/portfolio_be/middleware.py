import json
import logging
from django.http import HttpResponse
from rest_framework.response import Response as DRFResponse

logger = logging.getLogger(__name__)


def _build_payload(data, status):
    """Build the standard wrapper payload dict."""
    success = 200 <= status < 400
    payload = {
        "success": success,
        "message": "",
        "data": data if success else None,
    }
    if not success:
        payload["errors"] = data
    return payload


class APIResponseWrapperMiddleware:
    """Wrap all API responses under /api with a standard shape:
        {"success": bool, "message": str, "data": ..., "errors": ...}

    Two hooks are used:
    - process_template_response: intercepts DRF Response BEFORE Django renders it,
      so modifying response.data here is picked up by the renderer.
    - __call__ (response phase): intercepts already-rendered plain HttpResponse
      objects whose Content-Type is application/json.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    # ------------------------------------------------------------------ #
    # Hook 1 – DRF Response (before rendering)                            #
    # Django calls this for any response with a callable .render() method #
    # ------------------------------------------------------------------ #
    def process_template_response(self, request, response):
        """Modify response.data before Django renders the DRF Response."""
        # Skip schema/docs routes (they serve HTML, not JSON)
        if request.path.startswith(("/api/schema", "/api/docs", "/api/redoc")):
            return response

        if not request.path.startswith("/api"):
            return response

        if not isinstance(response, DRFResponse):
            return response

        # Skip wrapping 204 No Content, 201 Created (for delete), 304 Not Modified
        # These should not have a wrapped response body
        if response.status_code in (204, 304):
            return response

        data = response.data
        # Already wrapped – leave it alone
        if isinstance(data, dict) and "success" in data:
            return response

        response.data = _build_payload(data, response.status_code)
        logger.debug("APIResponseWrapperMiddleware: wrapped DRF template response for %s", request.path)
        return response

    # ------------------------------------------------------------------ #
    # Hook 2 – already-rendered plain HttpResponse with JSON body         #
    # ------------------------------------------------------------------ #
    def __call__(self, request):
        response = self.get_response(request)

        # DRF responses are handled by process_template_response above
        if isinstance(response, DRFResponse):
            return response

        if not request.path.startswith("/api"):
            return response

        content_type = response.get("Content-Type", "")
        if "application/json" not in content_type:
            return response

        try:
            decoded = json.loads(response.content.decode())
        except Exception:
            logger.exception("APIResponseWrapperMiddleware: could not decode JSON body for %s", request.path)
            return response

        if isinstance(decoded, dict) and "success" in decoded:
            return response  # already wrapped

        payload = _build_payload(decoded, response.status_code)
        body = json.dumps(payload).encode()
        response.content = body
        response["Content-Length"] = str(len(body))
        logger.debug("APIResponseWrapperMiddleware: wrapped plain JSON response for %s", request.path)
        return response

class FrameOptionsOverrideMiddleware:
    """Override X-Frame-Options header to allow iframes for PDF preview.
    This runs AFTER SecurityMiddleware to override its default 'deny' setting.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # Allow iframes from any origin (development)
        response['X-Frame-Options'] = 'ALLOW-FROM *'
        return response