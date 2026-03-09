"""
Crée 10 élèves de test par classe, avec des noms mauritaniens (mix filles/garçons).
Chaque élève reçoit un NNI de test à 10 chiffres.
Usage: python manage.py create_test_students
"""

import sys
from datetime import date
from django.core.management.base import BaseCommand
from django.db.models import Q
from api.models import Classroom, Student

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# NNI de test : 10 chiffres (début à 1000000001)
NNI_START = 1000000001

# 10 noms mauritaniens : 5 garçons (M), 5 filles (F) — mélangés
TEST_STUDENTS = [
    ('Mohamed Ould Abdallahi', 'M'),
    ('Fatimetou Mint Ahmed', 'F'),
    ('Oumar Salem', 'M'),
    ('Aichetou Mint Moussa', 'F'),
    ('Ely Ould Brahim', 'M'),
    ('Mariem Mint Mohamed', 'F'),
    ('Sidi Ould Cheikh', 'M'),
    ('Khadijetou Mint Abdallah', 'F'),
    ('Moussa Ould Salem', 'M'),
    ('Mouna Mint Ely', 'F'),
]

DEFAULT_BIRTH_DATE = date(2016, 3, 15)


def next_available_nni(used_nnis):
    """Retourne le prochain NNI de 10 chiffres non utilisé."""
    n = NNI_START
    while str(n) in used_nnis:
        n += 1
        if n > 9999999999:
            raise ValueError('Plus de NNI disponible (10 chiffres).')
    return str(n)


class Command(BaseCommand):
    help = 'Crée 10 élèves de test par classe (noms mauritaniens, NNI 10 chiffres)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Supprimer tous les élèves existants avant de créer les élèves de test',
        )
        parser.add_argument(
            '--fill-nni',
            action='store_true',
            help='Attribuer un NNI de test (10 chiffres) à tous les élèves qui n\'en ont pas',
        )

    def handle(self, *args, **options):
        if options.get('clear'):
            n = Student.objects.count()
            Student.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'✅ {n} élève(s) supprimé(s).'))

        if options.get('fill_nni'):
            used = set(
                Student.objects.exclude(nni__isnull=True).exclude(nni='')
                .values_list('nni', flat=True)
            )
            to_fill = Student.objects.filter(Q(nni__isnull=True) | Q(nni=''))
            filled = 0
            for student in to_fill:
                nni = next_available_nni(used)
                used.add(nni)
                student.nni = nni
                student.save()
                filled += 1
                self.stdout.write(f'  {student.fullName} ({student.classId.name}) → NNI {nni}')
            self.stdout.write(self.style.SUCCESS(f'\n✅ {filled} élève(s) avec NNI attribué.'))
            if not options.get('clear'):
                # Continue to create students if not --clear
                pass
            else:
                return

        classrooms = list(Classroom.objects.all().order_by('level', 'name'))
        if not classrooms:
            self.stdout.write(self.style.ERROR('Aucune classe trouvée. Créez d\'abord des classes (admin ou API).'))
            return

        used_nnis = set(
            Student.objects.exclude(nni__isnull=True).exclude(nni='').values_list('nni', flat=True)
        )
        created = 0
        for classroom in classrooms:
            for full_name, gender in TEST_STUDENTS:
                if not Student.objects.filter(classId=classroom, fullName=full_name).exists():
                    nni = next_available_nni(used_nnis)
                    used_nnis.add(nni)
                    Student.objects.create(
                        fullName=full_name,
                        nni=nni,
                        birthDate=DEFAULT_BIRTH_DATE,
                        gender=gender,
                        classId=classroom,
                        parentPhone='',
                        address='Nouakchott',
                    )
                    created += 1
                    self.stdout.write(f'  {classroom.name} (niveau {classroom.level}): {full_name} — NNI {nni}')

        self.stdout.write(self.style.SUCCESS(f'\n✅ {created} élève(s) créé(s) avec NNI 10 chiffres.'))
