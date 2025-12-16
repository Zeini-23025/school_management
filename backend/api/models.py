from django.db import models


class Classroom(models.Model):
    """Modèle pour représenter une classe"""
    name = models.CharField(max_length=100, unique=True)
    level = models.CharField(max_length=50)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Classe"
        verbose_name_plural = "Classes"
    
    def __str__(self):
        return f"{self.name} - {self.level}"


class Student(models.Model):
    """Modèle pour représenter un élève"""
    GENDER_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    
    fullName = models.CharField(max_length=200, verbose_name="Nom complet")
    birthDate = models.DateField(verbose_name="Date de naissance")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="Genre")
    parentPhone = models.CharField(max_length=20, verbose_name="Téléphone du parent")
    address = models.TextField(blank=True, null=True, verbose_name="Adresse")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    classId = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='students',
        verbose_name="Classe"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['fullName']
        verbose_name = "Élève"
        verbose_name_plural = "Élèves"
    
    def __str__(self):
        return self.fullName
