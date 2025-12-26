from rest_framework import status


# -----------------------------------
# :: Error Response Function
# -----------------------------------

"""
Utility function to standardise API error responses with a message, code, optional details, and HTTP status.
"""


def error_response(message, code="UNKNOWN_ERROR", details=None, http_status=400):
    return {
        "success": False,
        "error": {
            "message": message,
            "code": code,
            "details": details or {},
        },
    }, http_status


# -----------------------------------
# :: Success Response Function
# -----------------------------------

"""
Utility function to standardise API success responses with optional data, a message, and HTTP status.
"""


def success_response(data=None, message="Success", http_status=200):
    return {
        "success": True,
        "message": message,
        "data": data,
    }, http_status


# -----------------------------------
# :: UNAUTHORIZED Function
# -----------------------------------

"""
Predefined standard response for unauthenticated access, returning a 401 Unauthorized error with a consistent structure.
"""

UNAUTHORIZED = error_response(
    "Authentication required",
    code="UNAUTHORIZED",
    http_status=status.HTTP_401_UNAUTHORIZED,
)


# -----------------------------------
# :: FORBIDDEN Function
# -----------------------------------

"""
Predefined standard response for forbidden access, returning a 403 Forbidden error with a consistent structure
"""

FORBIDDEN = error_response(
    "Permission denied",
    code="FORBIDDEN",
    http_status=status.HTTP_403_FORBIDDEN,
)


# -----------------------------------
# :: NOT_FOUND Function
# -----------------------------------

"""
Predefined standard response for missing resources, returning a 404 Not Found error with a consistent structure.
"""

NOT_FOUND = error_response(
    "Resource not found",
    code="NOT_FOUND",
    http_status=status.HTTP_404_NOT_FOUND,
)


# -----------------------------------
# :: VALIDATION_ERROR Function
# -----------------------------------

"""
Predefined response for validation failures, returning a 400 Bad Request with detailed error information.
"""


def VALIDATION_ERROR(details): return error_response(
    "Validation failed",
    code="VALIDATION_ERROR",
    details=details,
    http_status=status.HTTP_400_BAD_REQUEST,
)


# -----------------------------------
# :: INTERNAL_ERROR Function
# -----------------------------------
"""
Predefined response for internal server errors, returning a 500 status with a standard error message.
"""

INTERNAL_ERROR = error_response(
    "Internal server error",
    code="INTERNAL_ERROR",
    http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
)
