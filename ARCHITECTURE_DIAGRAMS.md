# 📊 Architecture Diagrams
## Detailed design drawings

---

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    React Application                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │   Pages    │  │ Components │  │  Context   │         │   │
│  │  │            │  │            │  │   (State)  │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  │         │                │                │               │   │
│  │         └────────────────┴────────────────┘              │   │
│  │                            │                              │   │
│  │                    HTTP/REST API Calls                    │   │
│  └────────────────────────────┼──────────────────────────────┘   │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                                │ HTTPS/HTTP
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                      BACKEND SERVER                                │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │                  Django REST Framework                    │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │     │
│  │  │   Views      │  │ Serializers  │  │ Permissions  │ │     │
│  │  │  (ViewSets)  │  │              │  │              │ │     │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │     │
│  │         │                 │                  │         │     │
│  │         └─────────────────┴──────────────────┘         │     │
│  │                            │                            │     │
│  │                      Django ORM                          │     │
│  └────────────────────────────┼────────────────────────────┘     │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                                │ SQL Queries
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                      DATABASE (PostgreSQL)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Classroom   │  │   Student    │  │   Subject    │          │
│  │   Table      │  │    Table     │  │    Table     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐                                              │
│  │    Result    │                                              │
│  │    Table     │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Diagram

### 2.1 Login Flow
```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Enter credentials
     ▼
┌─────────────────┐
│   Login.tsx     │
└────┬────────────┘
     │
     │ 2. SchoolContext.login()
     ▼
┌─────────────────┐
│ SchoolContext   │
└────┬────────────┘
     │
     │ 3. POST /api/token/
     ▼
┌─────────────────┐
│  Django Backend │
│  (JWT Auth)     │
└────┬────────────┘
     │
     │ 4. Validate credentials
     ▼
┌─────────────────┐
│  Return JWT     │
│  (access +      │
│   refresh)      │
└────┬────────────┘
     │
     │ 5. Store in localStorage
     ▼
┌─────────────────┐
│  Redirect to    │
│   Dashboard     │
└─────────────────┘
```

### 2.2 Data Fetching Flow
```
┌─────────────────┐
│  App Load       │
└────┬────────────┘
     │
     │ 1. useEffect
     ▼
┌─────────────────┐
│ SchoolContext   │
│ .fetchData()    │
└────┬────────────┘
     │
     ├─── 2a. GET /api/students/
     ├─── 2b. GET /api/classes/
     ├─── 2c. GET /api/subjects/
     └─── 2d. GET /api/results/
     │
     ▼
┌─────────────────┐
│  Backend        │
│  (ViewSets)     │
└────┬────────────┘
     │
     │ 3. Query Database
     ▼
┌─────────────────┐
│  Database       │
│  (PostgreSQL)   │
└────┬────────────┘
     │
     │ 4. Return Data
     ▼
┌─────────────────┐
│  Serializers    │
│  (Convert to    │
│   JSON)         │
└────┬────────────┘
     │
     │ 5. Update State
     ▼
┌─────────────────┐
│  Components     │
│  Re-render      │
└─────────────────┘
```

### 2.3 Average Calculation Flow
```
┌─────────────────┐
│  Results.tsx    │
│  (User View)    │
└────┬────────────┘
     │
     │ 1. Select Class & Semester
     ▼
┌─────────────────┐
│  Filter Students│
│  by Class       │
└────┬────────────┘
     │
     │ 2. Get Level Subjects
     ▼
┌─────────────────┐
│  For each       │
│  Student:       │
└────┬────────────┘
     │
     │ 3. For each Subject:
     ▼
┌─────────────────┐
│  Find Results:  │
│  - test result  │
│  - exam result  │
└────┬────────────┘
     │
     │ 4. Calculate Subject Score
     ▼
┌─────────────────┐
│  If both exist: │
│  (test+exam)/2  │
│  Else: use one  │
└────┬────────────┘
     │
     │ 5. Weighted Average
     ▼
┌─────────────────┐
│  Σ(score ×      │
│   coefficient) /│
│  Σ(coefficient) │
└────┬────────────┘
     │
     │ 6. Display in Table
     ▼
┌─────────────────┐
│  Results Table  │
│  with Averages  │
└─────────────────┘
```

---

## 3. Class Diagram (UML)

### 3.1 Backend Models

```
┌─────────────────────┐
│     Classroom       │
├─────────────────────┤
│ + id: int (PK)      │
│ + name: str         │
│ + level: int        │
└──────────┬──────────┘
           │
           │ 1
           │
           │ N
┌──────────▼──────────┐
│      Student        │
├─────────────────────┤
│ + id: int (PK)      │
│ + fullName: str     │
│ + birthDate: date   │
│ + gender: str       │
│ + parentPhone: str  │
│ + address: str      │
│ + notes: str        │
│ + classId: FK       │
└──────────┬──────────┘
           │
           │ 1
           │
           │ N
┌──────────▼──────────┐
│       Result        │
├─────────────────────┤
│ + id: int (PK)      │
│ + studentId: FK     │
│ + subjectId: FK     │
│ + score: float      │
│ + semester: int     │
│ + type: str         │
└──────────┬──────────┘
           │
           │ N
           │
           │ 1
┌──────────▼──────────┐
│      Subject        │
├─────────────────────┤
│ + id: int (PK)      │
│ + name: str         │
│ + coefficient: int  │
│ + level: int        │
└─────────────────────┘
```

### 3.2 Frontend Types

```
┌─────────────────────┐
│   SchoolContext     │
├─────────────────────┤
│ - students: []      │
│ - classes: []       │
│ - subjects: []      │
│ - results: []       │
│ - loading: bool     │
│ + fetchData()       │
│ + addStudent()      │
│ + updateStudent()   │
│ + deleteStudent()   │
│ + saveResults()     │
│ + fetchStatistics() │
└─────────────────────┘
           │
           │ uses
           │
┌──────────▼──────────┐
│      Student        │
├─────────────────────┤
│ + id: string        │
│ + fullName: string  │
│ + birthDate: string │
│ + gender: 'M'|'F'   │
│ + classId: string   │
└─────────────────────┘

┌─────────────────────┐
│     Classroom       │
├─────────────────────┤
│ + id: string        │
│ + name: string      │
│ + level: number     │
└─────────────────────┘

┌─────────────────────┐
│      Subject        │
├─────────────────────┤
│ + id: string        │
│ + name: string      │
│ + coefficient: num  │
│ + level: number     │
└─────────────────────┘

┌─────────────────────┐
│       Result        │
├─────────────────────┤
│ + id?: string       │
│ + studentId: string │
│ + subjectId: string  │
│ + score: number     │
│ + semester: 1|2|3    │
│ + type: 'test'|     │
│        'exam'       │
└─────────────────────┘
```

---

## 4. Sequence Diagram

### 4.1 Add Student Sequence

```
User          Students.tsx    SchoolContext    Backend API    Database
 │                  │              │               │            │
 │ 1. Fill Form     │              │               │            │
 ├─────────────────>│              │               │            │
 │                  │              │               │            │
 │ 2. Submit        │              │               │            │
 ├─────────────────>│              │               │            │
 │                  │              │               │            │
 │                  │ 3. addStudent()              │            │
 │                  ├─────────────>│               │            │
 │                  │              │               │            │
 │                  │              │ 4. POST /api/students/    │
 │                  │              ├──────────────>│            │
 │                  │              │               │            │
 │                  │              │               │ 5. INSERT  │
 │                  │              │               ├───────────>│
 │                  │              │               │            │
 │                  │              │               │ 6. Return │
 │                  │              │               │<───────────┤
 │                  │              │               │            │
 │                  │              │ 7. Response   │            │
 │                  │              │<──────────────┤            │
 │                  │              │               │            │
 │                  │ 8. Update    │               │            │
 │                  │    State     │               │            │
 │                  │<─────────────┤               │            │
 │                  │              │               │            │
 │ 9. Show Success  │              │               │            │
 │<─────────────────┤              │               │            │
 │                  │              │               │            │
```

### 4.2 Calculate Statistics Sequence

```
Statistics.tsx    SchoolContext    Backend API    Database
      │                 │               │            │
      │ 1. Load Page    │               │            │
      ├────────────────>│               │            │
      │                 │               │            │
      │ 2. fetchStatistics(semester)    │            │
      ├────────────────>│               │            │
      │                 │               │            │
      │                 │ 3. GET /api/statistics/   │
      │                 ├──────────────>│            │
      │                 │               │            │
      │                 │               │ 4. Query  │
      │                 │               │   Students │
      │                 │               ├───────────>│
      │                 │               │            │
      │                 │               │ 5. Query  │
      │                 │               │   Results │
      │                 │               ├───────────>│
      │                 │               │            │
      │                 │               │ 6. Return │
      │                 │               │<───────────┤
      │                 │               │            │
      │                 │               │ 7. Calculate Averages │
      │                 │               │            │
      │                 │ 8. Return JSON│            │
      │                 │<──────────────┤            │
      │                 │               │            │
      │ 9. Update State │               │            │
      │<────────────────┤               │            │
      │                 │               │            │
      │ 10. Render      │               │            │
      │     Charts      │               │            │
      │                 │               │            │
```

---

## 5. Component Hierarchy

```
App.tsx
│
├─── Router
│    │
│    ├─── Login.tsx
│    │
│    └─── Layout.tsx
│         │
│         ├─── Sidebar
│         │
│         └─── Main Content
│              │
│              ├─── Dashboard.tsx
│              │    └─── StatCard (×4)
│              │
│              ├─── Students.tsx
│              │    ├─── StudentForm (Modal)
│              │    ├─── StudentTable
│              │    └─── ReportCardModal
│              │
│              ├─── Classes.tsx
│              │    ├─── ClassForm (Modal)
│              │    └─── ClassTable
│              │
│              ├─── Subjects.tsx
│              │    ├─── SubjectForm (Modal)
│              │    └─── SubjectTable
│              │
│              ├─── Results.tsx
│              │    ├─── FilterBar
│              │    ├─── ResultsTable
│              │    ├─── ExcelExport
│              │    └─── PrintView
│              │
│              └─── Statistics.tsx
│                   ├─── StatCard (×4)
│                   ├─── BarChart (Recharts)
│                   ├─── PieChart (Recharts)
│                   └─── LineChart (Recharts)
│
└─── NotificationContainer
     └─── Notification (×N)
```

---

## 6. Database Schema (Detailed)

### 6.1 Classroom Table
```sql
CREATE TABLE api_classroom (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 6)
);

CREATE INDEX idx_classroom_level ON api_classroom(level);
```

### 6.2 Student Table
```sql
CREATE TABLE api_student (
    id SERIAL PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    birthDate DATE NOT NULL,
    gender VARCHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    parentPhone VARCHAR(20),
    address TEXT,
    notes TEXT,
    classId_id INTEGER NOT NULL,
    FOREIGN KEY (classId_id) REFERENCES api_classroom(id) ON DELETE CASCADE
);

CREATE INDEX idx_student_class ON api_student(classId_id);
CREATE INDEX idx_student_name ON api_student(fullName);
```

### 6.3 Subject Table
```sql
CREATE TABLE api_subject (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    coefficient INTEGER NOT NULL DEFAULT 1,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 6)
);

CREATE INDEX idx_subject_level ON api_subject(level);
```

### 6.4 Result Table
```sql
CREATE TABLE api_result (
    id SERIAL PRIMARY KEY,
    studentId_id INTEGER NOT NULL,
    subjectId_id INTEGER NOT NULL,
    score FLOAT NOT NULL CHECK (score >= 0 AND score <= 20),
    semester INTEGER NOT NULL CHECK (semester IN (1, 2, 3)),
    type VARCHAR(10) NOT NULL CHECK (type IN ('test', 'exam')),
    FOREIGN KEY (studentId_id) REFERENCES api_student(id) ON DELETE CASCADE,
    FOREIGN KEY (subjectId_id) REFERENCES api_subject(id) ON DELETE CASCADE,
    UNIQUE (studentId_id, subjectId_id, semester, type)
);

CREATE INDEX idx_result_student ON api_result(studentId_id);
CREATE INDEX idx_result_subject ON api_result(subjectId_id);
CREATE INDEX idx_result_semester ON api_result(semester);
```

---

## 7. API Request/Response Examples

### 7.1 GET /api/students/
**Request:**
```http
GET /api/students/ HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response:**
```json
[
  {
    "id": "1",
    "fullName": "أحمد محمد",
    "birthDate": "2010-05-15",
    "gender": "M",
    "parentPhone": "0123456789",
    "address": "الشارع الرئيسي",
    "notes": "",
    "classId": "1"
  }
]
```

### 7.2 POST /api/results/
**Request:**
```http
POST /api/results/ HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

{
  "studentId": "1",
  "subjectId": "2",
  "score": 15.5,
  "semester": 1,
  "type": "exam"
}
```

**Response:**
```json
{
  "id": "10",
  "studentId": "1",
  "subjectId": "2",
  "score": 15.5,
  "semester": 1,
  "type": "exam"
}
```

### 7.3 GET /api/statistics/?semester=1
**Request:**
```http
GET /api/statistics/?semester=1 HTTP/1.1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response:**
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
  "classPerformance": [
    {
      "id": "1",
      "name": "قسم 1 أ",
      "avg": 15.2,
      "studentCount": 20
    }
  ],
  "subjectPerformance": [
    {
      "id": "1",
      "name": "الرياضيات",
      "avg": 16.0
    }
  ],
  "passFailData": [
    {"name": "ناجح", "value": 30},
    {"name": "راسب", "value": 10}
  ]
}
```

---

## 8. State Management Flow

```
┌─────────────────────────────────────────┐
│         SchoolContext (Global)          │
│  ┌───────────────────────────────────┐ │
│  │ State:                            │ │
│  │ - students: Student[]             │ │
│  │ - classes: Classroom[]            │ │
│  │ - subjects: Subject[]             │ │
│  │ - results: Result[]               │ │
│  │ - loading: boolean                │ │
│  │ - error: string | null            │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ Actions:                           │ │
│  │ - fetchData()                     │ │
│  │ - addStudent()                    │ │
│  │ - updateStudent()                 │ │
│  │ - deleteStudent()                 │ │
│  │ - saveResults()                   │ │
│  │ - fetchStatistics()               │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
              │
              │ Provides
              │
              ▼
┌─────────────────────────────────────────┐
│         Component (Local State)         │
│  ┌───────────────────────────────────┐ │
│  │ useState:                         │ │
│  │ - selectedClass                   │ │
│  │ - selectedSemester                │ │
│  │ - isModalOpen                     │ │
│  │ - formData                        │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ useMemo:                          │ │
│  │ - filteredStudents                │ │
│  │ - calculatedAverages              │ │
│  │ - levelSubjects                   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 9. Error Handling Flow

```
┌─────────────────┐
│  API Call       │
└────┬────────────┘
     │
     │ Try
     ▼
┌─────────────────┐
│  HTTP Request   │
└────┬────────────┘
     │
     ├─── Success (200)
     │    │
     │    ▼
     │ ┌─────────────────┐
     │ │ Update State    │
     │ │ Show Success    │
     │ │ Notification    │
     │ └─────────────────┘
     │
     ├─── Error (400/401/500)
     │    │
     │    ▼
     │ ┌─────────────────┐
     │ │ Catch Error     │
     │ │ Log Error       │
     │ │ Set Error State │
     │ │ Show Error      │
     │ │ Notification    │
     │ └─────────────────┘
     │
     └─── Network Error
          │
          ▼
     ┌─────────────────┐
     │ Catch Error     │
     │ Show "Network   │
     │ Error" Message  │
     └─────────────────┘
```

---

## 10. Security Flow

```
┌─────────────────┐
│  User Request   │
└────┬────────────┘
     │
     │ 1. Check localStorage
     ▼
┌─────────────────┐
│  Access Token   │
│  Exists?        │
└────┬────────────┘
     │
     ├─── No
     │    │
     │    ▼
     │ ┌─────────────────┐
     │ │ Redirect to     │
     │ │ Login Page      │
     │ └─────────────────┘
     │
     └─── Yes
          │
          │ 2. Add to Header
          ▼
     ┌─────────────────┐
     │ Authorization:  │
     │ Bearer <token>  │
     └────┬────────────┘
          │
          │ 3. Send Request
          ▼
     ┌─────────────────┐
     │  Backend        │
     │  Validates JWT  │
     └────┬────────────┘
          │
          ├─── Valid
          │    │
          │    ▼
          │ ┌─────────────────┐
          │ │ Process Request │
          │ │ Return Data     │
          │ └─────────────────┘
          │
          └─── Invalid/Expired
               │
               │ 4. Try Refresh Token
               ▼
          ┌─────────────────┐
          │ POST /token/    │
          │ refresh/        │
          └────┬────────────┘
               │
               ├─── Success
               │    │
               │    ▼
               │ ┌─────────────────┐
               │ │ Update Token    │
               │ │ Retry Request   │
               │ └─────────────────┘
               │
               └─── Failed
                    │
                    ▼
               ┌─────────────────┐
               │ Logout User     │
               │ Redirect Login  │
               └─────────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: 2025
