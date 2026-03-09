
export interface Student {
  id: string;
  fullName: string;
  nni?: string;
  birthDate: string;
  gender: 'M' | 'F';
  parentPhone: string;
  classId: string;
  address: string;
  notes?: string;
}

export interface TeacherAssignment {
  id: string;
  user: string;
  classroom: string;
  subject: string;
  classroom_name?: string;
  classroom_level?: number;
  subject_name?: string;
  subject_name_ar?: string | null;
  subject_total_points?: number;
  user_username?: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'secretary';
  email?: string;
  status: 'active' | 'inactive';
  assignments?: Array<{
    id: string;
    classroomId: string;
    classroomName: string;
    classroomLevel: number;
    subjectId: string;
    subjectName: string;
    subjectTotalPoints: number;
  }>;
}

export interface Classroom {
  id: string;
  name: string;
  level: number;
  studentCount?: number;
}

export interface Subject {
  id: string;
  name: string;
  name_ar?: string | null;
  totalPoints: number;
  level: number;
}

/** Nom d'affichage de la matière selon la langue (FR/AR). */
export function getSubjectDisplayName(
  subject: { name: string; name_ar?: string | null },
  lang: string
): string {
  if (subject.name_ar && (lang === 'ar' || (typeof lang === 'string' && lang.startsWith('ar')))) return subject.name_ar;
  return subject.name;
}

export interface Result {
  id?: string;
  studentId: string;
  subjectId: string;
  score: number;
  semester: 1 | 2 | 3;
  type: 'test' | 'exam';
  status?: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  approvedBy?: string;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  comment?: string;
  student_name?: string;
  subject_name?: string;
  subject_name_ar?: string | null;
  submitted_by_name?: string;
  approved_by_name?: string;
}

export interface Activity {
  id: string;
  type: 'add' | 'update' | 'delete' | 'result';
  descriptionKey: string;
  params?: string[];
  timestamp: Date;
}

export type Language = 'ar' | 'fr';
