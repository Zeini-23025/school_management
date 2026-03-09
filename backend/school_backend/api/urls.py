from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'classes', ClassroomViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'results', ResultViewSet)
router.register(r'assignments', TeacherAssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
    path('statistics/', StatisticsView.as_view(), name='statistics'),
    path('user/me/', CurrentUserView.as_view(), name='current_user'),
    path('users/', UserListView.as_view(), name='user_list'),
]