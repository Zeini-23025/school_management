# 📐 Architecture & Design Document
## نظام إدارة المدرسة (School Management System)

---

## 📋 Table of Contents
1. [نظرة عامة](#نظرة-عامة)
2. [البنية المعمارية](#البنية-المعمارية)
3. [نمط التصميم](#نمط-التصميم)
4. [قاعدة البيانات](#قاعدة-البيانات)
5. [API Endpoints](#api-endpoints)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [تدفق البيانات](#تدفق-البيانات)
9. [التقنيات المستخدمة](#التقنيات-المستخدمة)
10. [الأمان](#الأمان)

---

## 🎯 نظرة عامة

نظام إدارة مدرسة شامل يوفر إدارة كاملة للطلاب، الأقسام، المواد الدراسية، النتائج والإحصائيات.

### الوظائف الرئيسية:
- ✅ إدارة الطلاب (إضافة، تعديل، حذف)
- ✅ إدارة الأقسام والمستويات
- ✅ إدارة المواد الدراسية
- ✅ تسجيل النتائج (اختبارات وامتحانات)
- ✅ حساب المعدلات والإحصائيات
- ✅ تصدير/استيراد البيانات (Excel)
- ✅ طباعة كشوف الدرجات
- ✅ لوحة إحصائيات تفاعلية

---

## 🏗️ البنية المعمارية

### نمط التصميم: **3-Tier Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│                  (React + TypeScript)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Pages   │  │Components│  │ Context  │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
                        ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                    Business Logic Layer                  │
│              (Django REST Framework)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Views   │  │Serializers│  │Permissions│           │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
                        ↕ ORM
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│            (PostgreSQL / SQLite)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Students │  │ Results  │  │ Subjects │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 نمط التصميم

### Frontend Patterns:
1. **Context API Pattern** - لإدارة الحالة العامة
2. **Component-Based Architecture** - مكونات قابلة لإعادة الاستخدام
3. **Custom Hooks** - منطق قابل لإعادة الاستخدام
4. **Separation of Concerns** - فصل المكونات حسب الوظيفة

### Backend Patterns:
1. **Model-View-Serializer (MVS)** - نمط Django REST Framework
2. **ViewSet Pattern** - للعمليات CRUD القياسية
3. **APIView Pattern** - للعمليات المخصصة (Statistics)
4. **Serializer Pattern** - للتحويل بين Models و JSON

---

## 🗄️ قاعدة البيانات

### Entity Relationship Diagram (ERD)

```
┌──────────────┐         ┌──────────────┐
│  Classroom   │         │   Subject    │
├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ name         │         │ name         │
│ level        │◄────────┤ coefficient  │
└──────┬───────┘         │ level        │
       │                └──────┬───────┘
       │ 1                     │
       │                       │
       │ N                     │ N
       │                       │
┌──────▼───────┐         ┌──────▼───────┐
│   Student    │         │    Result    │
├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ fullName     │◄────────┤ studentId(FK)│
│ birthDate    │    N     │ subjectId(FK)│
│ gender       │         │ score        │
│ parentPhone  │         │ semester     │
│ address      │         │ type         │
│ notes        │         │              │
│ classId (FK) │         │ UNIQUE:      │
└──────────────┘         │ (studentId,  │
                         │  subjectId,  │
                         │  semester,   │
                         │  type)       │
                         └──────────────┘
```

### Models Description:

#### 1. **Classroom** (القسم)
```python
- id: Primary Key
- name: اسم القسم (مثال: "قسم 1 أ")
- level: المستوى الدراسي (1-6)
```

#### 2. **Student** (الطالب)
```python
- id: Primary Key
- fullName: الاسم الكامل
- birthDate: تاريخ الميلاد
- gender: الجنس (M/F)
- parentPhone: رقم هاتف ولي الأمر
- address: العنوان
- notes: ملاحظات
- classId: Foreign Key → Classroom
```

#### 3. **Subject** (المادة)
```python
- id: Primary Key
- name: اسم المادة
- coefficient: المعامل (لحساب المعدل)
- level: المستوى الدراسي (1-6)
```

#### 4. **Result** (النتيجة)
```python
- id: Primary Key
- studentId: Foreign Key → Student
- subjectId: Foreign Key → Subject
- score: الدرجة (0-20)
- semester: الفصل الدراسي (1, 2, 3)
- type: نوع التقييم ('test' أو 'exam')
- UNIQUE CONSTRAINT: (studentId, subjectId, semester, type)
```

### Business Rules:
1. **حساب المعدل**: 
   - إذا وُجد اختبار وامتحان: `(test + exam) / 2`
   - إذا وُجد أحدهما فقط: استخدام القيمة المتوفرة
   - المعدل العام = `Σ(score × coefficient) / Σ(coefficient)`

2. **النجاح/الرسوب**: 
   - المعدل ≥ 10: ناجح
   - المعدل < 10: راسب

3. **الترتيب**: حسب المعدل العام (تنازلي)

---

## 🔌 API Endpoints

### Base URL: `http://127.0.0.1:8000/api`

### Authentication:
```
POST /api/token/          - الحصول على Access Token
POST /api/token/refresh/  - تحديث Access Token
```

### Students:
```
GET    /api/students/           - قائمة جميع الطلاب
POST   /api/students/           - إضافة طالب جديد
GET    /api/students/{id}/      - تفاصيل طالب
PUT    /api/students/{id}/      - تحديث طالب
PATCH  /api/students/{id}/       - تحديث جزئي
DELETE /api/students/{id}/      - حذف طالب
```

### Classes:
```
GET    /api/classes/            - قائمة جميع الأقسام
POST   /api/classes/            - إضافة قسم جديد
GET    /api/classes/{id}/      - تفاصيل قسم
PUT    /api/classes/{id}/      - تحديث قسم
DELETE /api/classes/{id}/      - حذف قسم
```

### Subjects:
```
GET    /api/subjects/           - قائمة جميع المواد
POST   /api/subjects/           - إضافة مادة جديدة
GET    /api/subjects/{id}/      - تفاصيل مادة
PUT    /api/subjects/{id}/      - تحديث مادة
DELETE /api/subjects/{id}/      - حذف مادة
```

### Results:
```
GET    /api/results/            - قائمة جميع النتائج
POST   /api/results/            - إضافة نتيجة جديدة
GET    /api/results/{id}/      - تفاصيل نتيجة
PUT    /api/results/{id}/      - تحديث نتيجة
DELETE /api/results/{id}/      - حذف نتيجة
```

### Statistics:
```
GET    /api/statistics/?semester=1  - إحصائيات الفصل الدراسي
```

### Response Format:
```json
{
  "globalAverage": 14.5,
  "passRate": 75.5,
  "passedStudents": 30,
  "failedStudents": 10,
  "bestClass": {
    "id": "1",
    "name": "قسم 1 أ",
    "avg": 15.2
  },
  "classPerformance": [...],
  "subjectPerformance": [...]
}
```

---

## 🎨 Frontend Architecture

### Structure:
```
frontend3/
├── api/                    # API serializers/types
├── components/             # مكونات قابلة لإعادة الاستخدام
│   ├── Input.tsx
│   └── Layout.tsx
├── constants/              # الثوابت والترجمات
│   └── translations.ts
├── context/                # Context API
│   └── SchoolContext.tsx   # الحالة العامة + API calls
├── features/               # Features (Feature-based structure)
│   ├── auth/
│   │   └── Login.tsx
│   ├── students/
│   │   └── Students.tsx
│   ├── classes/
│   │   └── Classes.tsx
│   ├── subjects/
│   │   └── Subjects.tsx
│   ├── results/
│   │   └── Results.tsx
│   ├── statistics/
│   │   └── Statistics.tsx
│   └── dashboard/
│       └── Dashboard.tsx
├── pages/                  # Pages (Route components)
├── types.ts                # TypeScript types
└── App.tsx                 # Main App component
```

### State Management:

#### 1. **SchoolContext** (Global State)
```typescript
interface SchoolContextType {
  // State
  students: Student[];
  classes: Classroom[];
  subjects: Subject[];
  results: Result[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  addStudent: (student) => Promise<void>;
  updateStudent: (student) => Promise<void>;
  deleteStudent: (id) => Promise<void>;
  saveResults: (results) => Promise<void>;
  fetchStatistics: (semester) => Promise<any>;
  // ... etc
}
```

#### 2. **Local State** (Component-level)
- `useState` للمكونات البسيطة
- `useMemo` للحسابات المعقدة
- `useCallback` للدوال الممررة كـ props

### Key Components:

#### **SchoolContext.tsx**
- إدارة الحالة العامة
- جميع API calls
- إدارة التوكنات (JWT)
- نظام الإشعارات

#### **Layout.tsx**
- الهيكل العام للصفحات
- Navigation Bar
- Sidebar

#### **Pages:**
- **Login.tsx**: تسجيل الدخول
- **Dashboard.tsx**: لوحة التحكم
- **Students.tsx**: إدارة الطلاب
- **Classes.tsx**: إدارة الأقسام
- **Subjects.tsx**: إدارة المواد
- **Results.tsx**: إدارة النتائج + طباعة + Excel
- **Statistics.tsx**: الإحصائيات والرسوم البيانية

---

## ⚙️ Backend Architecture

### Structure:
```
backend/
├── school_backend/
│   ├── api/                    # Django App
│   │   ├── models.py           # Database models
│   │   ├── serializers.py      # Data serialization
│   │   ├── views.py            # API views
│   │   ├── urls.py             # URL routing
│   │   ├── permissions.py      # Access control
│   │   ├── validators.py       # Data validation
│   │   └── management/
│   │       └── commands/
│   │           └── reset_db.py # Custom command
│   ├── school_backend/         # Django project
│   │   ├── settings.py         # Configuration
│   │   ├── urls.py             # Root URLs
│   │   └── wsgi.py             # WSGI config
│   └── manage.py
├── requirements.txt
└── .env                        # Environment variables
```

### Key Components:

#### **models.py**
- تعريف Models (Classroom, Student, Subject, Result)
- العلاقات (Foreign Keys)
- Constraints (unique_together)

#### **serializers.py**
- تحويل Models ↔ JSON
- Validation
- `to_representation` لتحويل IDs إلى strings

#### **views.py**
- **ViewSets**: CRUD operations
  - `StudentViewSet`
  - `ClassroomViewSet`
  - `SubjectViewSet`
  - `ResultViewSet`
- **APIView**: Custom logic
  - `StatisticsView` - حساب الإحصائيات

#### **permissions.py**
- `IsAuthenticated` - يتطلب تسجيل الدخول
- Custom permissions إذا لزم الأمر

#### **urls.py**
- Router configuration
- Custom endpoints

---

## 🔄 تدفق البيانات

### 1. تسجيل الدخول:
```
User → Login.tsx → SchoolContext.login() 
→ POST /api/token/ → Backend validates 
→ Returns JWT → Store in localStorage 
→ Redirect to Dashboard
```

### 2. تحميل البيانات:
```
App Load → SchoolContext.fetchData() 
→ Multiple GET requests (/students, /classes, /subjects, /results)
→ Update state → Components re-render
```

### 3. إضافة طالب:
```
User fills form → Students.tsx → SchoolContext.addStudent()
→ POST /api/students/ → Backend validates & saves
→ Returns new student → Update state → Show notification
```

### 4. حساب المعدل:
```
Results.tsx → Filter results by student/semester
→ Find test & exam for each subject
→ Calculate: (test + exam) / 2 or use available
→ Weighted average: Σ(score × coeff) / Σ(coeff)
→ Display in table
```

### 5. الإحصائيات:
```
Statistics.tsx → SchoolContext.fetchStatistics(semester)
→ GET /api/statistics/?semester=1
→ Backend calculates:
  - Student averages
  - Global average
  - Pass rate
  - Class/subject performance
→ Return JSON → Display in charts
```

### 6. تصدير Excel:
```
User clicks "تصدير" → Results.tsx.handleDownloadTemplate()
→ Generate Excel using xlsx library
→ Include student data + subject columns
→ Download file
```

---

## 🛠️ التقنيات المستخدمة

### Frontend:
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.1 | UI Framework |
| **TypeScript** | 5.8.2 | Type Safety |
| **Vite** | 6.2.0 | Build Tool |
| **React Router** | 7.10.1 | Routing |
| **Lucide React** | 0.556.0 | Icons |
| **Recharts** | 3.5.1 | Charts/Graphs |
| **xlsx** | latest | Excel import/export |

### Backend:
| Technology | Version | Purpose |
|------------|---------|---------|
| **Django** | 6.0 | Web Framework |
| **Django REST Framework** | 3.16.1 | API Framework |
| **djangorestframework-simplejwt** | 5.5.1 | JWT Authentication |
| **django-cors-headers** | 4.9.0 | CORS Handling |
| **psycopg2** | 2.9.11 | PostgreSQL Adapter |
| **python-dotenv** | 1.2.1 | Environment Variables |

### Database:
- **PostgreSQL** (Production)
- **SQLite** (Development)

---

## 🔒 الأمان

### Authentication:
- **JWT (JSON Web Tokens)**
  - Access Token: قصير الأمد (15 دقيقة)
  - Refresh Token: طويل الأمد (7 أيام)
  - Stored in `localStorage`

### Authorization:
- جميع endpoints تتطلب `IsAuthenticated`
- Token في Header: `Authorization: Bearer <token>`

### CORS:
- مُكوّن `django-cors-headers`
- Configurable في `settings.py`

### Data Validation:
- **Frontend**: TypeScript types + form validation
- **Backend**: Django serializers + model validators

### Security Best Practices:
- ✅ Environment variables للبيانات الحساسة
- ✅ SQL Injection protection (Django ORM)
- ✅ XSS protection (React auto-escaping)
- ✅ CSRF protection (Django middleware)
- ✅ Password hashing (Django default)

---

## 📊 Performance Optimizations

### Frontend:
1. **Memoization**: `useMemo` للحسابات المعقدة
2. **Callback Memoization**: `useCallback` للدوال
3. **Lazy Loading**: يمكن إضافة React.lazy للصفحات
4. **Code Splitting**: Vite يقوم به تلقائياً

### Backend:
1. **select_related**: لتقليل عدد queries
2. **prefetch_related**: للعلاقات Many-to-Many
3. **Database Indexing**: على Foreign Keys
4. **Caching**: يمكن إضافة Redis للـ caching

### Database:
- Indexes على:
  - `Student.classId`
  - `Result.studentId`
  - `Result.subjectId`
  - `Subject.level`

---

## 🚀 Deployment Considerations

### Frontend:
- Build: `npm run build`
- Static files: يمكن استضافة على CDN
- Environment: `VITE_API_BASE_URL`

### Backend:
- WSGI Server: Gunicorn أو uWSGI
- Reverse Proxy: Nginx
- Database: PostgreSQL (Production)
- Environment: `.env` file

### Recommended Stack:
```
Frontend (Vite Build) → Nginx
Backend (Django) → Gunicorn → Nginx
Database → PostgreSQL
```

---

## 📝 Notes

### ID Type Consistency:
- **Problem**: Backend returns integers, Frontend expects strings
- **Solution**: `to_representation` في serializers يحول IDs إلى strings
- **Frontend**: استخدام `String(id)` في جميع المقارنات

### Average Calculation:
- **Rule**: إذا وُجد test و exam: `(test + exam) / 2`
- **Otherwise**: استخدام القيمة المتوفرة
- **Weighted**: حسب coefficient المادة

### Semester System:
- 3 semesters: 1, 2, 3
- كل نتيجة مرتبطة بـ semester محدد

---

## 📚 References

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Author**: System Architecture Documentation
