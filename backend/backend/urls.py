from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import welcome, ClassroomViewSet, StudentViewSet

router = DefaultRouter()
router.register(r'classes', ClassroomViewSet, basename='classroom')
router.register(r'students', StudentViewSet, basename='student')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/welcome/', welcome),
    path('api/', include(router.urls)),
]
