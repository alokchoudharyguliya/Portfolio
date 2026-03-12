from rest_framework.response import Response


class APIResponseMixin:
    """Provides standardized API response helpers for DRF views.

    Use this mixin in ViewSets or APIViews to return a consistent
    payload shape: {success, message, data} for successes and
    {success, message, errors} for failures.
    """

    def success_response(self, message: str = "", data=None, status: int = 200):
        payload = {
            "success": True,
            "message": message,
            "data": data,
        }
        return Response(payload, status=status)

    def error_response(self, message: str = "", errors=None, status: int = 400):
        payload = {
            "success": False,
            "message": message,
            "errors": errors,
        }
        return Response(payload, status=status)
