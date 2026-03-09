# 📖 Application User Guide
## Elementary School Management System

---

## 🎯 Overview

This system helps manage an elementary school digitally. It includes:
- Student and class management
- Subjects management
- Recording grades (tests and exams)
- Calculating averages and statistics
- Printing report cards
- Exporting/importing data

---

## 🚀 Getting Started

### 1. Login

#### Step 1: Open the app
- Open your browser and go to: `http://localhost:3001` (or the configured address)

#### Step 2: Enter credentials
You will see a login page:

```
┌─────────────────────────────┐
│    📚 Login                  │
│  School Management System    │
│                             │
│  Username: [admin]          │
│  Password: [••••••]         │
│                             │
│      [Sign In]              │
└─────────────────────────────┘
```

- **Username**: Enter the username (example: `admin`)
- **Password**: Enter the password

#### What happens in the background:
1. The app sends credentials to the server (`/api/token/`)
2. The server verifies the credentials
3. If valid, it returns a **JWT Token**
4. The app stores the token in the browser
5. You are redirected to the **Dashboard**

---

## 🏠 Dashboard

After logging in, you will see the home page:

### Statistic cards:
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Students │  │ Classes  │  │ Pass %   │  │ Latest   │
│   150    │  │   12     │  │   85%    │  │   450    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

- These cards display quick statistics
- They update automatically when data changes

### Quick links:
- **Add New Student** → goes to the Students page
- **Enter Grades** → goes to the Results page
- **Print Reports** → goes to the Results page (print view)

---

## 👥 Student Management

### Access:
From the side menu → **Students** or from the Dashboard → **Add New Student**

### 1. Add a new student

#### Steps:
1. Click the **"+ Add Student"** button (at the top)
2. A modal will open with a form:

```
┌──────────────────────────────────────┐
│  [X] Add New Student                 │
├──────────────────────────────────────┤
│  Full Name: [_______________]        │
│  Date of Birth: [__/__/____]         │
│  Gender: ○ Male  ○ Female             │
│  Class: [Select class ▼]              │
│  Guardian Phone: [_______________]    │
│  Address: [_______________]           │
│  Notes: [_______________]             │
│                                       │
│        [Save]      [Cancel]           │
└──────────────────────────────────────┘
```

3. Fill in required fields:
   - **Full Name**: Required ⚠️
   - **Date of Birth**: Required ⚠️
   - **Gender**: Choose Male or Female
   - **Class**: Select class from the list
   - **Guardian Phone**: Optional
   - **Address**: Optional
   - **Notes**: Optional

4. Click **"Save"**

#### What happens:
- The app sends data to the server (`POST /api/students/`)
- The server saves the student in the database
- The app shows a success notification (✓)
- The table updates automatically

---

### 2. View Students List

#### The table shows:
```
┌──────┬──────────────┬──────────┬───────┬────────────┐
│ No.  │ Name         │ Class    │ Avg.  │ Actions    │
├──────┼──────────────┼──────────┼───────┼────────────┤
│ 1    │ Ahmed Mohamed│ Class 1A │ 15.50 │ [View] [Edit] [Delete] │
│ 2    │ Fatima Ali   │ Class 1B │ 16.20 │ [View] [Edit] [Delete] │
└──────┴──────────────┴──────────┴───────┴────────────┘
```

#### Search and filter:
- **Search**: Type in the search box to filter students by name
- **Filter by class**: Select a class from the dropdown

---

### 3. Edit Student

#### Steps:
1. In the table, click the **"Edit"** button (pencil icon)
2. The same modal opens with the student's current data
3. Modify the fields you want
4. Click **"Save"**

---

### 4. Delete Student

#### Steps:
1. In the table, click the **"Delete"** button (trash icon)
2. A confirmation message appears: "Are you sure you want to delete this student?"
3. Click **"Confirm"** to proceed

⚠️ Warning: All grades related to this student will be deleted automatically!

---

### 5. View Report Card

#### Steps:
1. In the table, click the **"View"** button (file icon)
2. A window opens showing:
   - Student information
   - List of subjects
   - Scores for each subject (test + exam + average)
   - Semester average
   - Pass/Fail status

#### Selecting the term:
- Use the dropdown to change the term (1, 2, 3)

---

### 6. Export Students List

#### Steps:
1. Click the **"Export CSV"** button (at the top)
2. An Excel file will be downloaded containing:
   - Full name
   - Date of birth
   - Gender
   - Class
   - Guardian phone
   - Address

---

## 📚 Classes & Subjects Management

### Classes:
1. From the side menu → **Classes**
2. **Add Class**: Click "+ Add Class"
   - Enter class name (e.g., "Class 1A")
   - Set level (1-6)
3. **Edit/Delete**: Same as students

### Subjects:
1. From the side menu → **Subjects**
2. **Add Subject**: Click "+ Add Subject"
   - Enter subject name (e.g., "Mathematics")
   - Set coefficient (used for weighted average)
   - Set level (1-6)
3. **Edit/Delete**: Same as students

---

## 📝 Grades Management

### Access:
From the side menu → **Results**

### The page contains:

#### 1. Filters (at the top):
```
Class: [Select class ▼]
Term: ○ 1  ○ 2  ○ 3
Assessment type: ○ Test  ○ Exam
Display mode: ○ Single Subject  ○ All Subjects
```

#### 2. Single Subject Mode

##### Steps to enter grades:
1. Choose the **class**
2. Choose the **term** (1, 2, 3)
3. Choose the **assessment type** (Test or Exam)
4. Choose the **subject** from the list
5. A list of all students in the class appears:

```
┌────────────────┬──────────┐
│ Student Name   │ Score    │
├────────────────┼──────────┤
│ Ahmed Mohamed  │ [15.5]   │
│ Fatima Ali     │ [16.0]   │
│ Khaled Hassan  │ [14.5]   │
└────────────────┴──────────┘
```

6. Enter scores for each student (0-20)
7. Click **"Save"**

##### What happens:
- The app saves the grades to the database
- For each student/subject/term/type, only one score can be stored
- Entering a new score will replace the old one

---

#### 3. All Subjects Mode (Grid Mode)

##### Steps:
1. Select **class**, **term**, and **assessment type**
2. Click the **"All Subjects"** (Grid Mode) button
3. A large table appears:

```
┌──────────┬──────┬──────┬──────┬──────┐
│ Student  │ Math │ Arabic│ French│ Science│
├──────────┼──────┼──────┼──────┼──────┤
│ Ahmed    │ 15.5 │ 16.0 │ 14.5 │ 15.0 │
│ Fatima   │ 16.5 │ 17.0 │ 15.5 │ 16.0 │
└──────────┴──────┴──────┴──────┴──────┘
```

4. Enter all grades at once
5. Click **"Save"**

---

#### 4. Calculating Averages

##### How it works:
- The app automatically calculates each student's averages
- **If both test and exam exist**: average = `(test + exam) / 2`
- **If only one exists**: that value is used
- **Weighted average**: `Σ(score × coefficient) / Σ(coefficient)`

##### Example:
- Mathematics: test 15 + exam 18 = **subject average: 16.5**
- Arabic: test 16 + exam 16 = **subject average: 16.0**
- Coefficients: Math (3) + Arabic (2)
- **Overall average**: `(16.5×3 + 16.0×2) / (3+2) = 16.3`

---

#### 5. Printing Report Cards

##### Steps:
1. Select class and term
2. Click the **"Print"** button (Printer icon)
3. A print window will open:

```
┌────────────────────────────────────────┐
│  Elementary School                      │
│  Report Card - Term 1                   │
│  Class: 1A                              │
│                                        │
│  ┌────────┬──────┬──────┬──────┬──────┐│
│  │ Student│ Math │ Arabic│ Avg  │    ││
│  ├────────┼──────┼──────┼──────┼──────┤│
│  │ Ahmed  │ 16.5 │ 16.0 │ 16.3 │ Pass││
│  └────────┴──────┴──────┴──────┴──────┘│
│                                        │
│  [Ctrl+P to print]                     │
└────────────────────────────────────────┘
```

4. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac) to print

---

#### 6. Download Excel Template

##### Steps:
1. Select class, term, and assessment type
2. Choose display mode (Single Subject or All Subjects)
3. Click the **"Download Template"** button
4. An Excel file will be downloaded containing:
   - Student names
   - Columns for subjects (or a single column if "Single Subject" mode)
   - Empty cells to enter scores

##### Using the template:
1. Open the file in Excel
2. Enter the scores
3. Save the file
4. In the app, click **"Upload Excel"**
5. Choose the file
6. Click **"Import"**

---

## 📊 Statistics

### Access:
From the side menu → **Statistics**

### The page shows:

#### 1. Main cards:
```
┌──────────────────────┐  ┌──────────────────────┐
│ Overall Average      │  │ Pass Rate            │
│      14.5 / 20       │  │        75.5%         │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ Top Class            │  │ Struggling Students  │
│     Class 1A         │  │         10           │
│  (Avg: 15.2)         │  │                      │
└──────────────────────┘  └──────────────────────┘
```

#### 2. Charts:
- **Bar chart**: Class performance
- **Pie chart**: Pass/Fail ratio
- **Line chart**: Subject performance over time

#### 3. Select term:
- Use the dropdown to change the term (1, 2, 3)
- All statistics will update automatically

---

## 🔐 Security

### Authentication:
- All pages (except the login page) require authentication
- If the token expires, you will be logged out automatically

### Data storage:
- All data is stored in the database
- Requests are sent via HTTPS (in production)

---

## 💡 Usage Tips

### 1. Add data in order:
1. First: **Classes** (students need classes)
2. Second: **Subjects** (grades need subjects)
3. Third: **Students** (they are linked to classes)
4. Fourth: **Results** (link students to subjects)

### 2. Use "All Subjects" mode to save time:
- Faster for entering all grades at once
- Suitable when entering a full term's results

### 3. Save frequently:
- After entering grades, click "Save" immediately
- Avoid data loss

### 4. Use Excel for bulk entry:
- Useful when entering many students' grades
- Multiple people can work on the same file

---

## ⚠️ Common Errors & Solutions

### 1. "Email or password is incorrect"
- **Cause**: Wrong login credentials
- **Solution**: Verify username and password

### 2. "Cannot reach server"
- **Cause**: Backend is not running
- **Solution**: 
  - Ensure Backend is running (`python manage.py runserver`)
  - Check the frontend configuration URL

### 3. "Class is empty"
- **Cause**: No class selected or the selected class has no students
- **Solution**: Choose a class that contains students

### 4. "Average not showing"
- **Cause**: No results for the student in the selected term
- **Solution**: Ensure grades are entered for that term

### 5. "File upload error"
- **Cause**: Incorrect file format or mismatched columns
- **Solution**: Use the template generated by the app (`Download Template`)

---

## 📞 Support

### For more information:
- See `ARCHITECTURE.md` for technical details
- See `ARCHITECTURE_DIAGRAMS.md` for diagrams

---

## 🎯 Quick Summary

```
1. Login
   ↓
2. Dashboard (view quick stats)
   ↓
3. Prepare base data:
   - Classes
   - Subjects
   - Students
   ↓
4. Enter results:
   - Tests and exams
   - By term
   ↓
5. View outcomes:
   - Report cards (for students)
   - Statistics (for the school)
   ↓
6. Export/Print:
   - Print report cards
   - Export data
```

---

**Updated**: 2025  
**Version**: 1.0  
**Language**: English

