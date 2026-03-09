# 🗄️ Database Class Diagram (UML) - Database Schema
## School Management System

---

## 📊 PlantUML Source Code

File: `UML_DATABASE_DIAGRAM.puml`

You can use this file directly in the [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/) to generate the diagram.

---

## 🎨 Visual Representation

### Database Schema Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                       DATABASE (Database)                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   Classroom (Table)                        │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │                   Classroom (Table)                        │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ PK  │ id: Integer                                          │   │
│  ├─────┼──────────────────────────────────────────────────────┤   │
│  │     │ name: String(100) [NOT NULL]                         │   │
│  │     │ level: Integer [NOT NULL, CHECK: 1-6]                │   │
│  └─────┼──────────────────────────────────────────────────────┘   │
│        │                                                          │
│        │ 1                                                        │
│        │                                                          │
│        │ N                                                        │
│        ▼                                                          │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Student (Table)                         │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ PK  │ id: Integer                                          │   │
│  ├─────┼──────────────────────────────────────────────────────┤   │
│  │ FK  │ classId_id: Integer → Classroom.id                   │   │
│  ├─────┼──────────────────────────────────────────────────────┤   │
│  │     │ fullName: String(255) [NOT NULL]                     │   │
│  │     │ birthDate: Date [NOT NULL]                           │   │
│  │     │ gender: Char(1) [NOT NULL, CHECK: 'M'|'F']           │   │
│  │     │ parentPhone: String(20) [NULL]                       │   │
│  │     │ address: Text [NULL]                                 │   │
│  │     │ notes: Text [NULL]                                   │   │
│  └─────┼──────────────────────────────────────────────────────┘   │
│        │                                                          │
│        │ 1                                                        │
│        │                                                          │
│        │ N                                                        │
│        ▼                                                          │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Result (Table)                          │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ PK  │ id: Integer                                          │   │
│  ├─────┼──────────────────────────────────────────────────────┤   │
│  │ FK  │ studentId_id: Integer → Student.id                   │   │
│  │ FK  │ subjectId_id: Integer → Subject.id                   │   │
│  ├─────┼──────────────────────────────────────────────────────┤   │
│  │     │ score: Float [NOT NULL, CHECK: 0-20]                 │   │
│  │     │ semester: Integer [NOT NULL, CHECK: 1|2|3]           │   │
│  │     │ type: String(10) [NOT NULL, CHECK: 'test'|'exam']    │   │
│  ├─────┼──────────────────────────────────────────────────────┤   │
│  │UNIQUE│ (studentId_id, subjectId_id, semester, type)        │   │
│  └─────┼──────────────────────────────────────────────────────┘   │
│        │                                                          │
│        │ N                                                        │
│        │                                                          │
│        │ 1                                                        │
│        ▲                                                          │
│  ┌─────┼──────────────────────────────────────────────────────┐   │
│  │     │              Subject (Table)                         │   │
│  ├─────┼──────────────────────────────────────────────────────┤   │
│  │ PK  │ id: Integer                                          │   │
│  ├─────┼──────────────────────────────────────────────────────┤   │
│  │     │ name: String(100) [NOT NULL]                         │   │
│  │     │ coefficient: Integer [DEFAULT: 1]                    │   │
│  │     │ level: Integer [NOT NULL, CHECK: 1-6]                │   │
│  └─────┴──────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Tables Description

### 1. **Classroom**
```sql
Table: api_classroom

Columns:
- id (PK): Integer, Auto-increment
- name: String(100), NOT NULL
- level: Integer, NOT NULL, CHECK (level >= 1 AND level <= 6)

Indexes:
- idx_classroom_level ON level
```

Purpose: Represents a classroom or grade section  
Example: "Class 1A", "Class 2B"

---

### 2. **Student**
```sql
Table: api_student

Columns:
- id (PK): Integer, Auto-increment
- classId_id (FK): Integer → api_classroom.id, NOT NULL, CASCADE DELETE
- fullName: String(255), NOT NULL
- birthDate: Date, NOT NULL
- gender: Char(1), NOT NULL, CHECK (gender IN ('M', 'F'))
- parentPhone: String(20), NULL
- address: Text, NULL
- notes: Text, NULL

Indexes:
- idx_student_class ON classId_id
- idx_student_name ON fullName

Foreign Key:
- classId_id REFERENCES api_classroom(id) ON DELETE CASCADE
```

Purpose: Represents a student enrolled in the school  
Relationship: Belongs to one Classroom  
Cascade: Deleting a Classroom deletes its Students

---

### 3. **Subject**
```sql
Table: api_subject

Columns:
- id (PK): Integer, Auto-increment
- name: String(100), NOT NULL
- coefficient: Integer, DEFAULT 1
- level: Integer, NOT NULL, CHECK (level >= 1 AND level <= 6)

Indexes:
- idx_subject_level ON level
```

Purpose: Represents a school subject  
Coefficient: Used for weighted grade calculation  
Level: Academic level for the subject (1-6)

---

### 4. **Result**
```sql
Table: api_result

Columns:
- id (PK): Integer, Auto-increment
- studentId_id (FK): Integer → api_student.id, NOT NULL, CASCADE DELETE
- subjectId_id (FK): Integer → api_subject.id, NOT NULL, CASCADE DELETE
- score: Float, NOT NULL, CHECK (score >= 0 AND score <= 20)
- semester: Integer, NOT NULL, CHECK (semester IN (1, 2, 3))
- type: String(10), NOT NULL, CHECK (type IN ('test', 'exam'))

Indexes:
- idx_result_student ON studentId_id
- idx_result_subject ON subjectId_id
- idx_result_semester ON semester

Unique Constraint:
- UNIQUE (studentId_id, subjectId_id, semester, type)

Foreign Keys:
- studentId_id REFERENCES api_student(id) ON DELETE CASCADE
- subjectId_id REFERENCES api_subject(id) ON DELETE CASCADE
```

Purpose: Represents a test or exam result  
Relationships:
- Belongs to one Student
- Belongs to one Subject

Unique Constraint:
- A student cannot have more than one result for the same subject, semester, and type

Cascade: Deleting the Student or Subject deletes related Results

---

## 🔗 Relationships Summary

### 1. Classroom → Student (1 to N)
- Relationship: One-to-Many
- Description: One classroom contains many students
- Foreign Key: `Student.classId_id` → `Classroom.id`
- Cascade: DELETE CASCADE

### 2. Student → Result (1 to N)
- Relationship: One-to-Many
- Description: One student has many results
- Foreign Key: `Result.studentId_id` → `Student.id`
- Cascade: DELETE CASCADE

### 3. Subject → Result (1 to N)
- Relationship: One-to-Many
- Description: One subject has many results
- Foreign Key: `Result.subjectId_id` → `Subject.id`
- Cascade: DELETE CASCADE

---

## 📐 Entity Relationship Diagram (ERD)

```
    ┌─────────────┐                    ┌─────────────┐
    │  Classroom  │                    │   Subject   │
    ├─────────────┤                    ├─────────────┤
    │ id (PK)     │                    │ id (PK)     │
    │ name        │                    │ name        │
    │ level       │                    │ coefficient │
    └──────┬──────┘                    │ level       │
           │                           └──────┬──────┘
           │ 1                                 │
           │                                   │
           │ N                                 │ N
    ┌──────▼──────┐                    ┌──────▼──────┐
    │   Student   │                    │   Result    │
    ├─────────────┤                    ├─────────────┤
    │ id (PK)     │◄───────────────────┤ id (PK)     │
    │ fullName    │      N             │ studentId   │
    │ birthDate   │      │             │ subjectId   │
    │ gender      │      │             │ score       │
    │ parentPhone │      │             │ semester    │
    │ address     │      │             │ type        │
    │ notes       │      │             │             │
    │ classId (FK)│      │             │ UNIQUE:     │
    └─────────────┘      └─────────────┤ (studentId, │
                                       │  subjectId, │
                                       │  semester,  │
                                       │  type)      │
                                       └─────────────┘
```

---

## 🎯 Business Rules

### 1. Classroom Level
- Range: 1 to 6
- Meaning: Primary school grade levels

### 2. Student Gender
- Values: 'M' (male) or 'F' (female)
- Required: Yes

### 3. Result Score
- Range: 0 to 20
- Scale: Grading scale from 0 to 20

### 4. Result Semester
- Values: 1, 2, or 3
- Meaning: School semesters (three per year)

### 5. Result Type
- Values: 'test' or 'exam'
- Purpose: Distinguish between tests and exams

### 6. Unique Constraint on Result
- Rule: A student cannot have more than one result for the same:
  - Subject
  - Semester
  - Type (test or exam)

Example:
- ✅ Valid: Student 1, Subject 1, Semester 1, Type 'test' → Score 15
- ✅ Valid: Student 1, Subject 1, Semester 1, Type 'exam' → Score 18
- ❌ Invalid: Student 1, Subject 1, Semester 1, Type 'test' → Score 16 (Duplicate!)

---

## 📝 SQL Schema (Complete)

```sql
-- Classroom Table
CREATE TABLE api_classroom (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 6)
);

CREATE INDEX idx_classroom_level ON api_classroom(level);

-- Student Table
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

-- Subject Table
CREATE TABLE api_subject (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    coefficient INTEGER NOT NULL DEFAULT 1,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 6)
);

CREATE INDEX idx_subject_level ON api_subject(level);

-- Result Table
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

## 🚀 How to Generate Image

### Option 1: PlantUML Online (Recommended)
1. Open: http://www.plantuml.com/plantuml/uml/
2. Open the file `UML_DATABASE_DIAGRAM.puml`
3. Copy the content and paste it into the editor
4. Click "Submit"
5. Save the image:
   - PNG for general viewing
   - SVG for high-quality print
   - PDF for documentation

### Option 2: VS Code Extension
1. Install the "PlantUML" extension in VS Code
2. Open the `.puml` file
3. Press `Alt+D` to preview the diagram
4. `Ctrl+Shift+P` → "PlantUML: Export Current Diagram"

---

## 📊 Summary

| Table     | Primary Key | Foreign Keys                                        | Unique Constraints                                     | Indexes                         |
|-----------|-------------|-----------------------------------------------------|--------------------------------------------------------|---------------------------------|
| Classroom | id          | -                                                   | -                                                      | level                           |
| Student   | id          | classId_id → Classroom                               | -                                                      | classId_id, fullName            |
| Subject   | id          | -                                                   | -                                                      | level                           |
| Result    | id          | studentId_id → Student<br>subjectId_id → Subject     | (studentId_id, subjectId_id, semester, type)           | studentId_id, subjectId_id, semester |

---

Document Version: 1.0  
Last Updated: 2025  
Format: PlantUML  
Focus: Database Schema Only

