# api/models.py
from django.db import models

class Classroom(models.Model):
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} ({self.level})"


class Student(models.Model):
    name = models.CharField(max_length=100)
    classroom = models.ForeignKey(
        Classroom,
        related_name='students',  # ce nom sera utilisé pour Count()
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=100)
    coefficient = models.PositiveIntegerField()

    def __str__(self):
        return self.name
