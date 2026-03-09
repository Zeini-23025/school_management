
import { Classroom, Student, Subject } from "./types";

export const MOCK_CLASSES: Classroom[] = [
  { id: 'c1', name: 'السنة الأولى - أ', level: 1, studentCount: 25 },
  { id: 'c2', name: 'السنة الثانية - ب', level: 2, studentCount: 22 },
  { id: 'c3', name: 'السنة الخامسة - ج', level: 5, studentCount: 18 },
];

export const MOCK_SUBJECTS: Subject[] = [
  // مواد المستوى 1
  { id: 's1', name: 'الرياضيات', coefficient: 5, level: 1 },
  { id: 's2', name: 'اللغة العربية', coefficient: 5, level: 1 },
  { id: 's3', name: 'التربية الإسلامية', coefficient: 2, level: 1 },
  
  // مواد المستوى 2
  { id: 's2_1', name: 'الرياضيات', coefficient: 5, level: 2 },
  { id: 's2_2', name: 'اللغة العربية', coefficient: 5, level: 2 },
  
  // مواد المستوى 5
  { id: 's5_1', name: 'الفرنسية', coefficient: 3, level: 5 },
  { id: 's5_2', name: 'العلوم الطبيعية', coefficient: 3, level: 5 },
  { id: 's5_3', name: 'التاريخ والجغرافيا', coefficient: 2, level: 5 },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'st1',
    fullName: 'أحمد محمد محمود',
    birthDate: '2015-05-15',
    gender: 'M',
    parentPhone: '22334455',
    classId: 'c1',
    address: 'نواكشوط - تفرغ زينة',
    notes: 'متميز'
  },
  {
    id: 'st2',
    fullName: 'فاطمة بنت عبد الله',
    birthDate: '2015-08-20',
    gender: 'F',
    parentPhone: '33445566',
    classId: 'c1',
    address: 'نواكشوط - لكصر',
  }
];
