from rest_framework import serializers
from .models import Classroom, Subject

class ClassroomSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'level', 'student_count']

        


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'coefficient']
