from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db.models import Count, Q

from .models import Classroom, Student
from .serializers import ClassroomSerializer, StudentSerializer


@api_view(['GET'])
def welcome(request):
    return Response({"message": "School Management API ready"})


class ClassroomViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les classes"""
    queryset = Classroom.objects.annotate(
        student_count=Count('students')
    )
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'level']
    ordering_fields = ['name', 'level']
    ordering = ['name']


class StudentViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les élèves avec recherche et filtrage"""
    queryset = Student.objects.select_related('classId').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['fullName', 'parentPhone']
    ordering_fields = ['fullName', 'birthDate', 'created_at']
    ordering = ['fullName']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrage par classId via query parameter
        class_id = self.request.query_params.get('classId', None)
        if class_id:
            queryset = queryset.filter(classId_id=class_id)
        
        # Recherche par nom (insensible à la casse)
        # Le paramètre 'search' est déjà géré par SearchFilter,
        # mais on peut aussi ajouter un filtre personnalisé
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(fullName__icontains=search) |
                Q(parentPhone__icontains=search)
            )
        
        return queryset