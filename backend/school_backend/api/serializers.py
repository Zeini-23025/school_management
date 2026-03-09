from rest_framework import serializers
from .models import Classroom, Student, Subject, Result, TeacherAssignment


class ClassroomSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = '__all__'

    def to_representation(self, instance):
        """Convert id to string for frontend compatibility"""
        representation = super().to_representation(instance)
        # Ensure id is always a string for frontend
        if 'id' in representation:
            representation['id'] = str(representation['id'])
        return representation

    def get_student_count(self, obj):
        return obj.students.count()


class StudentSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='classId.name', read_only=True)
    class_level = serializers.IntegerField(source='classId.level', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'

    def to_representation(self, instance):
        """Convert classId and id to string for frontend compatibility"""
        representation = super().to_representation(instance)
        # Ensure classId and id are always strings for frontend
        if 'classId' in representation:
            representation['classId'] = str(representation['classId'])
        if 'id' in representation:
            representation['id'] = str(representation['id'])
        return representation

    def validate_fullName(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("الاسم يجب أن يكون على الأقل 3 أحرف")
        return value.strip()

    def validate_birthDate(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("تاريخ الميلاد لا يمكن أن يكون في المستقبل")
        return value


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

    def to_representation(self, instance):
        """Convert id to string for frontend compatibility"""
        representation = super().to_representation(instance)
        # Ensure id is always a string for frontend
        if 'id' in representation:
            representation['id'] = str(representation['id'])
        return representation

    def validate_totalPoints(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError("عدد النقاط يجب أن يكون بين 1 و 100")
        return value


class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='studentId.fullName', read_only=True)
    subject_name = serializers.CharField(source='subjectId.name', read_only=True)
    subject_name_ar = serializers.CharField(source='subjectId.name_ar', read_only=True, allow_null=True)
    submitted_by_name = serializers.CharField(source='submittedBy.username', read_only=True)
    approved_by_name = serializers.CharField(source='approvedBy.username', read_only=True, allow_null=True)

    class Meta:
        model = Result
        fields = '__all__'

    def to_representation(self, instance):
        """Convert IDs to strings for frontend compatibility"""
        representation = super().to_representation(instance)
        # Ensure all IDs are strings for frontend
        if 'studentId' in representation:
            representation['studentId'] = str(representation['studentId'])
        if 'subjectId' in representation:
            representation['subjectId'] = str(representation['subjectId'])
        if 'id' in representation:
            representation['id'] = str(representation['id'])
        if 'submittedBy' in representation and representation['submittedBy']:
            representation['submittedBy'] = str(representation['submittedBy'])
        if 'approvedBy' in representation and representation['approvedBy']:
            representation['approvedBy'] = str(representation['approvedBy'])
        return representation

    def validate(self, data):
        """Validate score against subject's totalPoints"""
        score = data.get('score')
        subject_id = data.get('subjectId')

        if score is not None and subject_id is not None:
            try:
                subject = Subject.objects.get(pk=subject_id)
                max_points = subject.totalPoints
                if score < 0 or score > max_points:
                    raise serializers.ValidationError({
                        'score': f'النقطة يجب أن تكون بين 0 و {max_points} (عدد النقاط الإجمالي للمادة: {subject.name})'
                    })
            except Subject.DoesNotExist:
                pass  # Subject validation will be handled elsewhere

        return data


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    classroom_level = serializers.IntegerField(source='classroom.level', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_name_ar = serializers.CharField(source='subject.name_ar', read_only=True, allow_null=True)
    subject_total_points = serializers.IntegerField(source='subject.totalPoints', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TeacherAssignment
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        for key in ('id', 'user', 'classroom', 'subject'):
            if key in rep and rep[key] is not None:
                rep[key] = str(rep[key])
        return rep