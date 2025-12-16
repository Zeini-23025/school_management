from rest_framework import serializers
from .models import Classroom, Student


class ClassroomSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Classroom"""
    student_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Classroom
        fields = ['id', 'name', 'level', 'student_count']


class StudentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Student"""
    classId = serializers.PrimaryKeyRelatedField(
        queryset=Classroom.objects.all(),
        source='classId'
    )
    class_name = serializers.CharField(source='classId.name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id',
            'fullName',
            'birthDate',
            'gender',
            'parentPhone',
            'address',
            'notes',
            'classId',
            'class_name',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
