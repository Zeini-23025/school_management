"""
Charge les matières officielles (1ère à 6ème année) et supprime les matières existantes.
Usage: python manage.py load_official_subjects

Attention: supprime toutes les matières, tous les résultats et toutes les assignations
enseignants liées (remplacement complet).
"""

import sys
from django.core.management.base import BaseCommand
from api.models import Subject

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Matières officielles par niveau. Chaque entrée: (nom FR, nom AR, totalPoints)
OFFICIAL_SUBJECTS = {
    1: [  # السنة الأولى
        ('Éducation islamique', 'التربية الإسلامية', 40),
        ('Lecture', 'القراءة', 40),
        ('Expression', 'التعبير', 20),
        ('Écriture', 'الكتابة', 20),
        ('Éducation civique', 'التربية المدنية', 15),
        ('Mathématiques', 'الرياضيات', 40),
        ('Éducation artistique', 'التربية الفنية', 15),
        ('Éducation physique', 'الرياضة البدنية', 10),
    ],
    2: [
        ('Éducation islamique', 'التربية الإسلامية', 30),
        ('Arabe', 'اللغة العربية', 50),
        ('Calcul', 'الحساب', 40),
        ('Éducation civique', 'التربية المدنية', 15),
        ('Éducation artistique', 'التربية الفنية', 15),
        ('Français', 'الفرنسية', 20),
        ('Lecture', 'القراءة', 10),
        ('Écriture', 'الكتابة', 10),
        ('Sport', 'الرياضة', 10),
    ],
    3: [
        ('Éducation islamique', 'التربية الإسلامية', 30),
        ('Arabe', 'اللغة العربية', 50),
        ('Mathématiques', 'الرياضيات', 40),
        ('Éducation civique', 'التربية المدنية', 10),
        ('Éducation artistique', 'التربية الفنية', 10),
        ('Histoire et Géographie', 'التاريخ و الجغرافيا', 10),
        ('Français', 'الفرنسية', 30),
        ('Sciences naturelles', 'العلوم الطبيعية', 10),
        ('Éducation physique', 'الرياضة البدنية', 10),
    ],
    4: [
        ('Éducation islamique', 'التربية الإسلامية', 30),
        ('Arabe', 'اللغة العربية', 50),
        ('Mathématiques', 'الرياضيات', 40),
        ('Éducation civique', 'التربية المدنية', 10),
        ('Éducation artistique', 'التربية الفنية', 10),
        ('Histoire et Géographie', 'التاريخ و الجغرافيا', 10),
        ('Français', 'الفرنسية', 30),
        ('Sciences naturelles', 'العلوم الطبيعية', 10),
        ('Éducation physique', 'الرياضة البدنية', 10),
    ],
    5: [
        ('Éducation islamique', 'التربية الإسلامية', 30),
        ('Arabe', 'اللغة العربية', 50),
        ('Mathématiques', 'الرياضيات', 40),
        ('Éducation artistique', 'التربية الفنية', 10),
        ('Éducation civique', 'التربية المدنية', 10),
        ('Histoire et Géographie', 'التاريخ والجغرافيا', 10),
        ('Français', 'الفرنسية', 30),
        ('Sciences', 'العلوم', 10),
    ],
    6: [
        ('Éducation islamique', 'التربية الإسلامية', 20),
        ('Arabe', 'اللغة العربية', 50),
        ('Mathématiques', 'الرياضيات', 50),
        ('Éducation civique', 'التربية المدنية', 10),
        ('Histoire et Géographie', 'التاريخ و الجغرافيا', 20),
        ('Français', 'الفرنسية', 30),
        ('Sciences naturelles', 'العلوم الطبيعية', 20),
    ],
}


class Command(BaseCommand):
    help = 'Remplace toutes les matières par les matières officielles (1ère–6ème année)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Afficher ce qui serait fait sans modifier la base',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        if dry_run:
            self.stdout.write(self.style.WARNING('Mode dry-run: aucune modification.'))

        count_before = Subject.objects.count()
        if not dry_run:
            Subject.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f'✅ {count_before} matière(s) supprimée(s).'))
        else:
            self.stdout.write(self.style.WARNING(f'[dry-run] {count_before} matière(s) seraient supprimées.'))

        created = 0
        for level in range(1, 7):
            for item in OFFICIAL_SUBJECTS.get(level, []):
                name, name_ar, total_points = item
                if not dry_run:
                    Subject.objects.create(name=name, name_ar=name_ar, level=level, totalPoints=total_points)
                created += 1
                self.stdout.write(f'  Niveau {level}: {name} / {name_ar} ({total_points})')

        if not dry_run:
            self.stdout.write(self.style.SUCCESS(f'✅ {created} matière(s) créée(s).'))
        else:
            self.stdout.write(self.style.WARNING(f'[dry-run] {created} matière(s) seraient créées.'))

        self.stdout.write(self.style.SUCCESS('\nتم بنجاح.'))
