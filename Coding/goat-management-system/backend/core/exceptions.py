from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        return Response(
            {
                "success": False,
                "message": _extract_message(response.data),
                "errors": response.data,
            },
            status=response.status_code,
        )

    logger.exception("Unhandled exception", exc_info=exc)
    return Response(
        {"success": False, "message": "An unexpected error occurred.", "errors": None},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _extract_message(data):
    if isinstance(data, dict):
        first = next(iter(data.values()), None)
        if isinstance(first, list) and first:
            return str(first[0])
        return str(first) if first else "Validation error."
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data)
