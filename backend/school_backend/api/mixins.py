"""
Reusable mixins for ViewSets
"""
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class LoggingMixin:
    """
    Mixin to add logging to ViewSet actions
    """
    def perform_create(self, serializer):
        instance = serializer.save()
        logger.info(f"{self.__class__.__name__}: Created {instance}")
        return instance
    
    def perform_update(self, serializer):
        instance = serializer.save()
        logger.info(f"{self.__class__.__name__}: Updated {instance}")
        return instance
    
    def perform_destroy(self, instance):
        logger.info(f"{self.__class__.__name__}: Deleted {instance}")
        instance.delete()

class ErrorHandlingMixin:
    """
    Mixin to handle errors consistently
    """
    def handle_exception(self, exc):
        logger.error(f"Exception in {self.__class__.__name__}: {str(exc)}", exc_info=True)
        return super().handle_exception(exc)
