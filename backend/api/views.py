from rest_framework import viewsets
from django.db.models import Count
from .models import Classroom, Subject
from .serializers import ClassroomSerializer, SubjectSerializer

class ClassroomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassroomSerializer

    def get_queryset(self):
        return Classroom.objects.annotate(
            student_count=Count('students')
        )


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
