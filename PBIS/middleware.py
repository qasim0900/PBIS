import logging
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


# -----------------------------------
# :: Logger Variable
# -----------------------------------


"""
Sets up a logger named after the current module for logging messages.
"""

logger = logging.getLogger(__name__)


# -----------------------------------
# :: API Error Handler Class
# -----------------------------------


"""
Utility class to standardise API responses with methods for success and error formatting.
"""


class APIErrorHandler:

    # -----------------------------------
    # :: Format Error Function
    # -----------------------------------

    """
    Returns a standardized error response dictionary with optional code and details.
    """

    @staticmethod
    def format_error(message, code=None, details=None):
        return {
            "success": False,
            "error": {
                "message": message,
                "code": code or "UNKNOWN_ERROR",
                "details": details or {},
            },
        }

    # -----------------------------------
    # :: Format Success Function
    # -----------------------------------

    """
    Returns a standardized success response dictionary with optional data and message.
    """

    @staticmethod
    def format_success(data=None, message="Success"):
        return {
            "success": True,
            "message": message,
            "data": data,
        }

# --------------------------------------
# :: Custom Exception Handler Function
# --------------------------------------


"""
Custom DRF exception handler that logs errors and returns all API responses in a consistent `success/error` format.
"""


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return Response(
            APIErrorHandler.format_error(
                "Internal server error",
                code="INTERNAL_ERROR",
            ),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    if response.status_code >= 500:
        logger.error(f"Server error: {exc}", exc_info=True)
        return Response(
            APIErrorHandler.format_error(
                "Internal server error",
                code="INTERNAL_ERROR",
            ),
            status=response.status_code,
        )
    message = str(response.data.get("detail") or "Request error")
    return Response(
        APIErrorHandler.format_error(
            message,
            code="REQUEST_ERROR",
            details=response.data,
        ),
        status=response.status_code,
    )


# --------------------------------------
# :: Request Logging Middleware Class
# --------------------------------------

"""
Middleware that logs all API requests with method, path, status code, and user info for requests starting with `/api/`.
"""


class RequestLoggingMiddleware:

    # -----------------------------------
    # :: __init__ Function
    # -----------------------------------

    """
    Initialises the middleware with the `get_response` callable to process requests.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    # -----------------------------------
    # :: __call__ Function
    # -----------------------------------

    """
    Processes each request, logs API requests with method, path, status, and user, then returns the response.
    """

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/api/"):
            logger.info(
                f"{request.method} {request.path} - Status: {response.status_code} - User: {request.user}"
            )
        return response
