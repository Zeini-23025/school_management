# School Management System - Backend
نظام إدارة مدرسة - الخلفية (Backend)

## Requirements / المتطلبات

- Python 3.8+
- PostgreSQL (or SQLite for development)  
    PostgreSQL (أو SQLite للتطوير)
- pip

## Installation / التثبيت

1. Create a virtual environment / إنشاء virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment / تفعيل virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install requirements / تثبيت المتطلبات:
```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` / إنشاء ملف `.env` من `.env.example`:
```bash
cp .env.example .env
```

5. Edit `.env` and add correct values / تعديل ملف `.env` وإضافة القيم الصحيحة:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_HOST=localhost
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your-database-password
```

Optional: Use PostgreSQL with Docker Compose (developer may use Postgres via Docker Compose)  
اختياري: يمكن للمطوّر استخدام PostgreSQL عبر Docker Compose

docker-compose.yml example:
```yaml
version: '3.8'
services:
    db:
        image: postgres:13
        environment:
            POSTGRES_DB: school_db
            POSTGRES_USER: school_user
            POSTGRES_PASSWORD: example_password
        volumes:
            - pgdata:/var/lib/postgresql/data
        ports:
            - "5432:5432"

volumes:
    pgdata:
```

Commands to run DB with Docker Compose:
```bash
# Start only the database service
docker-compose up -d db

# When DB is ready, run migrations locally
cd school_backend
python manage.py migrate
```
If using Docker for the whole stack, add your backend service to docker-compose and configure environment accordingly.  
إذا كنت تستخدم Docker لكامل التطبيق، أضف خدمة الخلفية إلى docker-compose وقم بتكوين المتغيرات البيئية accordingly.

6. Run migrations / تشغيل migrations:
```bash
cd school_backend
python manage.py migrate
```

7. Create superuser / إنشاء superuser:
```bash
python manage.py createsuperuser
```

8. Run the server / تشغيل السيرفر:
```bash
python manage.py runserver
```

## Security / الأمان

⚠️ Important before production / هام قبل النشر في الإنتاج:

1. Change `SECRET_KEY` in `.env` / غيّر `SECRET_KEY` في ملف `.env`  
2. Set `DEBUG=False` in production / ضع `DEBUG=False` في الإنتاج  
3. Configure `ALLOWED_HOSTS` properly / حدد `ALLOWED_HOSTS` بشكل صحيح  
4. Restrict `CORS_ALLOWED_ORIGINS` / حدد `CORS_ALLOWED_ORIGINS` بدقة  
5. Use a secure database (PostgreSQL recommended) / استخدم قاعدة بيانات آمنة (PostgreSQL)  
6. Use HTTPS / استخدم HTTPS

## API Endpoints / نقاط نهاية الـ API

- `POST /api/token/` - Login (JWT) / تسجيل الدخول (JWT)  
- `POST /api/token/refresh/` - Refresh token / تحديث التوكن  
- `GET /api/students/` - List students / قائمة التلاميذ  
- `GET /api/classes/` - List classes / قائمة الأقسام  
- `GET /api/subjects/` - List subjects / قائمة المواد  
- `GET /api/results/` - List results / قائمة النتائج

## Query Parameters / بارامترات الاستعلام

- `?level=1` - Filter by level / تصفية حسب المستوى  
- `?classId=1` - Filter by class / تصفية حسب القسم  
- `?studentId=1` - Filter by student / تصفية حسب التلميذ  
- `?subjectId=1` - Filter by subject / تصفية حسب المادة  
- `?semester=1` - Filter by semester / تصفية حسب الفصل
