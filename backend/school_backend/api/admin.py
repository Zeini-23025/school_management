from django.contrib import admin
from .models import Classroom, Student, Subject, Result, TeacherAssignment


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('name', 'level')


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('fullName', 'nni', 'classId', 'gender', 'birthDate')
    list_filter = ('classId', 'gender')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'totalPoints')


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('studentId', 'subjectId', 'score', 'semester', 'type', 'status')


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'classroom', 'subject')
    list_filter = ('user', 'classroom__level')
