from django.urls import path, include
from api.views import welcome
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions


schema_view = get_schema_view(
    openapi.Info(
        title="School Management API",
        default_version='v1',
        description="API documentation for the School Management system",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('api/welcome/', welcome),

    # JWT token endpoints
    path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
        ),
    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
        ),

    # users app endpoints
    path(
        'api/users/',
        include('users.urls')
        ),

    # API documentation
    path(
        "swagger.json",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path(
        "redoc/",
        schema_view.with_ui("redoc", cache_timeout=0),
        name="schema-redoc",
    ),
]
