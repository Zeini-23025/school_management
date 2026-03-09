"""
Utility functions for logging and error handling
"""
import logging
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def log_api_error(error, context=None):
    """
    Log API errors with context
    """
    error_msg = {
        'error': str(error),
        'context': context or {}
    }
    logger.error(f"API Error: {error_msg}", exc_info=True)
    return error_msg


def handle_api_exception(exception, default_message="حدث خطأ غير متوقع"):
    """
    Handle API exceptions and return appropriate response
    """
    logger.error(f"API Exception: {str(exception)}", exc_info=True)
    return Response(
        {'error': default_message, 'detail': str(exception)},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
