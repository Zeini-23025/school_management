"""
Script to create users for testing
Use: python create_test_users.py
"""
from django.contrib.auth.models import User
import os
import sys
import django

# Django setup
# The script is located in backend/create_test_users.py
# school_backend is located at backend/school_backend/
current_dir = os.path.dirname(os.path.abspath(__file__))
school_backend_dir = os.path.join(current_dir, 'school_backend')

if not os.path.exists(school_backend_dir):
    print(f"❌ خطأ: لم يتم العثور على مجلد school_backend في {current_dir}")
    sys.exit(1)

# إضافة المسار إلى sys.path
sys.path.insert(0, current_dir)

# تعيين إعدادات Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school_backend.settings')

django.setup()


def create_test_users():
    """Create users for testing"""

    admin_username = 'admin'
    admin_password = 'admin123'

    if User.objects.filter(username=admin_username).exists():
        admin_user = User.objects.get(username=admin_username)
        admin_user.set_password(admin_password)
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print(f"✅ تم تحديث مستخدم الإدارة: {admin_username}")
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
        print(f"✅ تم إنشاء مستخدم الإدارة: {admin_username}")

    teacher1_username = 'teacher1'
    teacher1_password = 'teacher123'

    if User.objects.filter(username=teacher1_username).exists():
        teacher1_user = User.objects.get(username=teacher1_username)
        teacher1_user.set_password(teacher1_password)
        teacher1_user.is_staff = False
        teacher1_user.is_superuser = False
        teacher1_user.save()
        print(f"✅ تم تحديث مستخدم المعلم 1: {teacher1_username}")
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
        print(f"✅ تم إنشاء مستخدم المعلم 1: {teacher1_username}")

    teacher2_username = 'teacher2'
    teacher2_password = 'teacher123'

    if User.objects.filter(username=teacher2_username).exists():
        teacher2_user = User.objects.get(username=teacher2_username)
        teacher2_user.set_password(teacher2_password)
        teacher2_user.is_staff = False
        teacher2_user.is_superuser = False
        teacher2_user.save()
        print(f"✅ تم تحديث مستخدم المعلم 2: {teacher2_username}")
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
        print(f"✅ تم إنشاء مستخدم المعلم 2: {teacher2_username}")

    print("\n" + "="*50)
    print("📋 معلومات المستخدمين:")
    print("="*50)
    print(f"\n👤 الإدارة:")
    print(f"   Username: {admin_username}")
    print(f"   Password: {admin_password}")
    print(f"   Role: admin (is_superuser=True)")

    print(f"\n👨‍🏫 المعلم 1:")
    print(f"   Username: {teacher1_username}")
    print(f"   Password: {teacher1_password}")
    print(f"   Role: teacher (is_staff=False)")

    print(f"\n👨‍🏫 المعلم 2:")
    print(f"   Username: {teacher2_username}")
    print(f"   Password: {teacher2_password}")
    print(f"   Role: teacher (is_staff=False)")

    print("\n" + "="*50)
    print("✅ تم إنشاء جميع المستخدمين بنجاح!")
    print("="*50)
    print("\n💡 يمكنك الآن:")
    print("   1. تسجيل الدخول كمعلم لإدخال النتائج")
    print("   2. تسجيل الدخول كإدارة لمراجعة والموافقة على النتائج")
    print("\n")


if __name__ == '__main__':
    try:
        create_test_users()
    except Exception as e:
        print(f"❌ خطأ: {e}")
        import traceback
        traceback.print_exc()
