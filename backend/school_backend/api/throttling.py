"""
Rate limiting/throttling for API endpoints
"""
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """
    Throttle for authenticated users - 100 requests per minute
    """
    scope = 'burst'


class SustainedRateThrottle(UserRateThrottle):
    """
    Throttle for authenticated users - 1000 requests per day
    """
    scope = 'sustained'


class AnonBurstRateThrottle(AnonRateThrottle):
    """
    Throttle for anonymous users - 20 requests per minute
    """
    scope = 'anon_burst'
