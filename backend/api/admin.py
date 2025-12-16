from django.contrib import admin
from .models import Classroom, Student


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'level']
    search_fields = ['name', 'level']
    list_filter = ['level']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['id', 'fullName', 'birthDate', 'gender', 'parentPhone', 'classId']
    search_fields = ['fullName', 'parentPhone']
    list_filter = ['gender', 'classId', 'birthDate']
    date_hierarchy = 'birthDate'
