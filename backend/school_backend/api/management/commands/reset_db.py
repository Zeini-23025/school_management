# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from api.models import Student, Classroom, Subject, Result
from django.contrib.auth.models import User
import sys

class Command(BaseCommand):
    help = 'Delete all data from database (Students, Classes, Subjects, Results)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            action='store_true',
            help='Also delete users (including superuser)',
        )

    def handle(self, *args, **options):
        # Set UTF-8 encoding for Windows console
        if sys.platform == 'win32':
            import io
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
        
        # Check if tables exist before trying to delete
        from django.db import connection
        tables = connection.introspection.table_names()
        
        # Delete results first (they depend on students and subjects)
        if 'api_result' in tables:
            results_count = Result.objects.count()
            Result.objects.all().delete()
        else:
            results_count = 0
        self.stdout.write(
            self.style.SUCCESS(f'[OK] Deleted {results_count} results')
        )

        # Delete students
        if 'api_student' in tables:
            students_count = Student.objects.count()
            Student.objects.all().delete()
        else:
            students_count = 0
        self.stdout.write(
            self.style.SUCCESS(f'[OK] Deleted {students_count} students')
        )

        # Delete subjects
        if 'api_subject' in tables:
            subjects_count = Subject.objects.count()
            Subject.objects.all().delete()
        else:
            subjects_count = 0
        self.stdout.write(
            self.style.SUCCESS(f'[OK] Deleted {subjects_count} subjects')
        )

        # Delete classes
        if 'api_classroom' in tables:
            classes_count = Classroom.objects.count()
            Classroom.objects.all().delete()
        else:
            classes_count = 0
        self.stdout.write(
            self.style.SUCCESS(f'[OK] Deleted {classes_count} classes')
        )

        # Delete users (optional)
        if options['users']:
            users_count = User.objects.count()
            User.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f'[WARNING] Deleted {users_count} users (including superuser)')
            )
            self.stdout.write(
                self.style.WARNING('[!] You need to create a new superuser: python manage.py createsuperuser')
            )

        self.stdout.write(
            self.style.SUCCESS('\n[SUCCESS] All data deleted successfully!')
        )
        self.stdout.write(
            self.style.SUCCESS('[TIP] Use "python manage.py createsuperuser" to create a new admin account')
        )
