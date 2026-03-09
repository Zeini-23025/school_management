"""
Custom validators for models and serializers
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_score(value):
    """
    Validate that score is between 0 and 20
    """
    if value < 0 or value > 20:
        raise ValidationError(
            _('%(value)s يجب أن يكون بين 0 و 20'),
            params={'value': value},
        )


def validate_coefficient(value):
    """
    Validate that coefficient is between 1 and 10
    """
    if value < 1 or value > 10:
        raise ValidationError(
            _('%(value)s يجب أن يكون بين 1 و 10'),
            params={'value': value},
        )


def validate_level(value):
    """
    Validate that level is between 1 and 6
    """
    if value < 1 or value > 6:
        raise ValidationError(
            _('%(value)s يجب أن يكون بين 1 و 6'),
            params={'value': value},
        )
