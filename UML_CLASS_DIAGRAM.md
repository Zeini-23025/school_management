# 📊 Class Diagram (UML) - School Management System

---

## 📐 PlantUML Source Code

You can use the following code in the PlantUML Online Editor (http://www.plantuml.com/plantuml/uml/) or any editor that supports PlantUML to generate the image.

File: `UML_CLASS_DIAGRAM.puml`

---

## 🎨 Visual Representation

### Backend Classes (Django)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Django)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐      ┌──────────────────┐                   │
│  │   Classroom      │      │     Student      │                   │
│  ├──────────────────┤      ├──────────────────┤                   │
│  │ - id: Integer    │◄─────│ - id: Integer    │                   │
│  │ - name: String   │  1   │ - fullName       │                   │
│  │ - level: Integer │      │ - birthDate      │                   │
│  └──────────────────┘      │ - gender         │                   │
│                            │ - parentPhone    │                   │
│                            │ - address        │                   │
│                            │ - notes          │                   │
│                            │ - classId: FK    │                   │
│                            └────────┬─────────┘                   │
│                                     │ 1                            │
│                                     │                              │
│                                     │ N                            │
│                            ┌────────▼─────────┐                   │
│                            │      Result      │                   │
│                            ├──────────────────┤                   │
│                            │ - id: Integer    │                   │
│                            │ - studentId: FK  │                   │
│                            │ - subjectId: FK  │                   │
│                            │ - score: Float   │                   │
│                            │ - semester: Int  │                   │
│                            │ - type: String   │                   │
│                            └────────┬─────────┘                   │
│                                     │ N                            │
│                                     │                              │
│                            ┌────────▼─────────┐                   │
│                            │     Subject      │                   │
│                            ├──────────────────┤                   │
│                            │ - id: Integer    │                   │
│                            │ - name: String   │                   │
│                            │ - coefficient    │                   │
│                            │ - level: Integer │                   │
│                            └──────────────────┘                   │
│                                                                     │
│  ┌──────────────────┐      ┌──────────────────┐                   │
│  │ClassroomViewSet  │      │  StudentViewSet  │                   │
│  ├──────────────────┤      ├──────────────────┤                   │
│  │ + list()         │      │ + list()         │                   │
│  │ + create()       │      │ + create()       │                   │
│  │ + retrieve()     │      │ + bulk_create()  │                   │
│  │ + update()       │      │ + retrieve()     │                   │
│  │ + destroy()      │      │ + update()       │                   │
│  └──────────────────┘      │ + destroy()      │                   │
│                            └──────────────────┘                   │
│                                                                     │
│  ┌──────────────────┐      ┌──────────────────┐                   │
│  │ SubjectViewSet   │      │  ResultViewSet   │                   │
│  ├──────────────────┤      ├──────────────────┤                   │
│  │ + list()         │      │ + list()         │                   │
│  │ + create()       │      │ + create()       │                   │
│  │ + retrieve()     │      │ + retrieve()     │                   │
│  │ + update()       │      │ + update()       │                   │
│  │ + destroy()      │      │ + destroy()      │                   │
│  └──────────────────┘      └──────────────────┘                   │
│                                                                     │
│  ┌──────────────────┐                                              │
│  │ StatisticsView   │                                              │
│  ├──────────────────┤                                              │
│  │ + get()          │                                              │
│  │ - calculate_...  │                                              │
│  └──────────────────┘                                              │
│                                                                     │
│  ┌──────────────────┐      ┌──────────────────┐                   │
│  │ClassroomSerializer│     │StudentSerializer │                   │
│  │ResultSerializer  │      │SubjectSerializer │                   │
│  └──────────────────┘      └──────────────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Frontend Classes (React + TypeScript)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + TypeScript)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SchoolContext                            │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ - students: Student[]                                       │   │
│  │ - classes: Classroom[]                                      │   │
│  │ - subjects: Subject[]                                       │   │
│  │ - results: Result[]                                         │   │
│  │ - loading: boolean                                          │   │
│  │ - error: string | null                                      │   │
│  │                                                             │   │
│  │ + fetchData(): Promise<void>                                │   │
│  │ + addStudent(student): Promise<void>                        │   │
│  │ + updateStudent(student): Promise<void>                     │   │
│  │ + deleteStudent(id): Promise<void>                          │   │
│  │ + saveResults(results): Promise<void>                       │   │
│  │ + fetchStatistics(semester): Promise<Object>                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                        │
│                            │ uses                                   │
│                            ▼                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Student    │  │  Classroom   │  │   Subject    │            │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤            │
│  │ + id: string │  │ + id: string │  │ + id: string │            │
│  │ + fullName   │  │ + name       │  │ + name       │            │
│  │ + birthDate  │  │ + level      │  │ + coefficient│            │
│  │ + gender     │  │ + studentCount│ │ + level      │            │
│  │ + classId    │  └──────────────┘  └──────────────┘            │
│  └──────────────┘                                                 │
│                                                                     │
│  ┌──────────────┐                                                  │
│  │    Result    │                                                  │
│  ├──────────────┤                                                  │
│  │ + id?: string│                                                  │
│  │ + studentId  │                                                  │
│  │ + subjectId  │                                                  │
│  │ + score      │                                                  │
│  │ + semester   │                                                  │
│  │ + type       │                                                  │
│  └──────────────┘                                                  │
│                                                                     │
│  ┌──────────────────┐      ┌──────────────────┐                  │
│  │  StudentsPage    │      │   ResultsPage    │                  │
│  ├──────────────────┤      ├──────────────────┤                  │
│  │ + handleAdd()    │      │ + handleSave()   │                  │
│  │ + handleEdit()   │      │ + handlePrint()  │                  │
│  │ + handleDelete() │      │ + handleUpload() │                  │
│  │ + calculateAvg() │      │ + handleDownload()│                 │
│  └──────────────────┘      └──────────────────┘                  │
│                                                                     │
│  ┌──────────────────┐                                              │
│  │ StatisticsPage   │                                              │
│  ├──────────────────┤                                              │
│  │ + loadStatistics()│                                             │
│  │ + handleSemester()│                                             │
│  └──────────────────┘                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Relationships Summary

### Database Relationships:
1. **Classroom 1 ─── N Student**
   - One classroom has many students
   - A student belongs to one classroom

2. **Student 1 ─── N Result**
   - One student has many results
   - A result belongs to one student

3. **Subject 1 ─── N Result**
   - One subject has many results
   - A result belongs to one subject

### Backend Relationships:
- **ViewSets** use **Models** and **Serializers**
- **StatisticsView** uses all models for calculations
- **Serializers** convert models to/from JSON

### Frontend Relationships:
- **SchoolContext** manages all data types
- **Pages** use **SchoolContext** to read/update data
- **Pages** display instances of **Student**, **Result**, etc.

---

## 📝 How to Generate Image

### Option 1: PlantUML Online
1. Open: http://www.plantuml.com/plantuml/uml/
2. Copy the contents of `UML_CLASS_DIAGRAM.puml`
3. Paste into the editor
4. Click "Submit" to view the image
5. Save the image (PNG, SVG, or PDF)

### Option 2: PlantUML Local
```bash
# Install PlantUML (example using node-plantuml)
npm install -g node-plantuml

# Generate the image
plantuml UML_CLASS_DIAGRAM.puml

# This will create: UML_CLASS_DIAGRAM.png
```

### Option 3: VS Code Extension
1. Install the "PlantUML" extension in VS Code
2. Open the `.puml` file
3. Press Alt+D to preview the diagram
4. Press Ctrl+Shift+P → "PlantUML: Export Current Diagram"

### Option 4: Mermaid (Alternative)
You can also use Mermaid if you prefer.

---

## 📋 Class Details

### Backend Models

#### Classroom
- Purpose: Represents a classroom or grade
- Key Fields: `name`, `level`
- Relationships: Has many Students

#### Student
- Purpose: Represents a student
- Key Fields: `fullName`, `birthDate`, `gender`, `classId`
- Relationships: Belongs to Classroom, Has many Results

#### Subject
- Purpose: Represents a subject
- Key Fields: `name`, `coefficient`, `level`
- Relationships: Has many Results

#### Result
- Purpose: Represents an exam or test result
- Key Fields: `studentId`, `subjectId`, `score`, `semester`, `type`
- Constraints: Unique on (studentId, subjectId, semester, type)
- Relationships: Belongs to Student and Subject

### Frontend Components

#### SchoolContext
- Purpose: Manage global application state
- Responsibilities:
  - Store data
  - Perform API calls
  - Manage tokens
  - Show notifications

#### Pages
- StudentsPage: Manage students
- ResultsPage: Manage results, print, export to Excel
- StatisticsPage: Show statistics

---

## 🎯 Legend

```
┌─────────┐
│  Class  │  = Class/Component
├─────────┤
│ - field │  = Private attribute
│ + method│  = Public method
└─────────┘

───>  = Uses/Dependency
◄────  = Ownership (1 to N)
...>  = Implements
```

---

**Version**: 1.0  
**Last Updated**: 2025  
**Format**: PlantUML  
**Recommended Tool**: PlantUML Online Editor

