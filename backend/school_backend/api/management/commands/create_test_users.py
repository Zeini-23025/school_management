"""
Django management command to create test users
Usage: python manage.py create_test_users
"""

import sys
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')


class Command(BaseCommand):
    help = 'Create test users for admin and teachers'

    def handle(self, *args, **options):
        # 1. Create admin user
        admin_username = 'admin'
        admin_password = 'admin123'
        
        if User.objects.filter(username=admin_username).exists():
            admin_user = User.objects.get(username=admin_username)
            admin_user.set_password(admin_password)
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ تم تحديث مستخدم الإدارة: {admin_username}'))
        else:
            admin_user = User.objects.create_user(
                username=admin_username,
                email='admin@school.com',
                password=admin_password,
                first_name='مدير',
                last_name='النظام'
            )
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ تم إنشاء مستخدم الإدارة: {admin_username}'))
        
        # 2. Create teacher 1
        teacher1_username = 'teacher1'
        teacher1_password = 'teacher123'
        
        if User.objects.filter(username=teacher1_username).exists():
            teacher1_user = User.objects.get(username=teacher1_username)
            teacher1_user.set_password(teacher1_password)
            teacher1_user.is_staff = False
            teacher1_user.is_superuser = False
            teacher1_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ تم تحديث مستخدم المعلم 1: {teacher1_username}'))
        else:
            teacher1_user = User.objects.create_user(
                username=teacher1_username,
                email='teacher1@school.com',
                password=teacher1_password,
                first_name='معلم',
                last_name='أول'
            )
            teacher1_user.is_staff = False
            teacher1_user.is_superuser = False
            teacher1_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ تم إنشاء مستخدم المعلم 1: {teacher1_username}'))
        
        # 3. Create teacher 2
        teacher2_username = 'teacher2'
        teacher2_password = 'teacher123'
        
        if User.objects.filter(username=teacher2_username).exists():
            teacher2_user = User.objects.get(username=teacher2_username)
            teacher2_user.set_password(teacher2_password)
            teacher2_user.is_staff = False
            teacher2_user.is_superuser = False
            teacher2_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ تم تحديث مستخدم المعلم 2: {teacher2_username}'))
        else:
            teacher2_user = User.objects.create_user(
                username=teacher2_username,
                email='teacher2@school.com',
                password=teacher2_password,
                first_name='معلم',
                last_name='ثاني'
            )
            teacher2_user.is_staff = False
            teacher2_user.is_superuser = False
            teacher2_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ تم إنشاء مستخدم المعلم 2: {teacher2_username}'))
        
        # 4. Create teacher 3
        teacher3_username = 'teacher3'
        teacher3_password = 'teacher123'
        
        if User.objects.filter(username=teacher3_username).exists():
            teacher3_user = User.objects.get(username=teacher3_username)
            teacher3_user.set_password(teacher3_password)
            teacher3_user.is_staff = False
            teacher3_user.is_superuser = False
            teacher3_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ تم تحديث مستخدم المعلم 3: {teacher3_username}'))
        else:
            teacher3_user = User.objects.create_user(
                username=teacher3_username,
                email='teacher3@school.com',
                password=teacher3_password,
                first_name='معلم',
                last_name='ثالث'
            )
            teacher3_user.is_staff = False
            teacher3_user.is_superuser = False
            teacher3_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ تم إنشاء مستخدم المعلم 3: {teacher3_username}'))
        
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('📋 معلومات المستخدمين:'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(self.style.SUCCESS(f'\n👤 الإدارة:'))
        self.stdout.write(self.style.SUCCESS(f'   Username: {admin_username}'))
        self.stdout.write(self.style.SUCCESS(f'   Password: {admin_password}'))
        self.stdout.write(self.style.SUCCESS(f'   Role: admin (is_superuser=True)'))
        
        self.stdout.write(self.style.SUCCESS(f'\n👨‍🏫 المعلم 1:'))
        self.stdout.write(self.style.SUCCESS(f'   Username: {teacher1_username}'))
        self.stdout.write(self.style.SUCCESS(f'   Password: {teacher1_password}'))
        self.stdout.write(self.style.SUCCESS(f'   Role: teacher (is_staff=False)'))
        
        self.stdout.write(self.style.SUCCESS(f'\n👨‍🏫 المعلم 2:'))
        self.stdout.write(self.style.SUCCESS(f'   Username: {teacher2_username}'))
        self.stdout.write(self.style.SUCCESS(f'   Password: {teacher2_password}'))
        self.stdout.write(self.style.SUCCESS(f'   Role: teacher (is_staff=False)'))
        
        self.stdout.write(self.style.SUCCESS(f'\n👨‍🏫 المعلم 3:'))
        self.stdout.write(self.style.SUCCESS(f'   Username: {teacher3_username}'))
        self.stdout.write(self.style.SUCCESS(f'   Password: {teacher3_password}'))
        self.stdout.write(self.style.SUCCESS(f'   Role: teacher (is_staff=False)'))
        
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('✅ تم إنشاء جميع المستخدمين بنجاح!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(self.style.SUCCESS('\n💡 يمكنك الآن:'))
        self.stdout.write(self.style.SUCCESS('   1. تسجيل الدخول كمعلم لإدخال النتائج'))
        self.stdout.write(self.style.SUCCESS('   2. تسجيل الدخول كإدارة لمراجعة والموافقة على النتائج'))
        self.stdout.write(self.style.SUCCESS('\n'))
