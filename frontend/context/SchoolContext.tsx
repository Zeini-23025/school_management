
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Student, Classroom, Subject, Result, Activity, User, getSubjectDisplayName } from '../types';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SchoolContextType {
  students: Student[];
  classes: Classroom[];
  subjects: Subject[];
  results: Result[];
  activities: Activity[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  t: (key: string, ...args: string[]) => string;
  language: string;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  bulkAddStudents: (students: Omit<Student, 'id'>[]) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addClass: (classroom: Omit<Classroom, 'id' | 'studentCount'>) => Promise<Classroom | void>;
  updateClass: (classroom: Classroom) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  saveResults: (newResults: Result[], customActivityMessage?: string) => Promise<void>;
  approveResult: (resultId: string) => Promise<void>;
  rejectResult: (resultId: string, reason?: string) => Promise<void>;
  fetchPendingResults: () => Promise<Result[]>;
  fetchData: () => Promise<void>;
  fetchStatistics: (semester?: number) => Promise<any>;
  fetchCurrentUser: () => Promise<void>;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);
// API Base URL - يمكن تغييره عبر environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [activities, setActivities] = useState<Activity[]>(() => {
    // Charger les activités depuis localStorage au démarrage
    try {
      const saved = localStorage.getItem('schoolActivities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { t, i18n } = useTranslation();

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // إضافة نشاط تلقائياً
  const addActivity = (type: 'add' | 'update' | 'delete' | 'result', descriptionKey: string, params?: string[]) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(),
      type,
      descriptionKey,
      params,
      timestamp: new Date()
    };
    setActivities(prev => {
      // إضافة في البداية، والاحتفاظ بآخر 50 نشاط فقط
      const updated = [newActivity, ...prev].slice(0, 50);
      // حفظ في localStorage
      localStorage.setItem('schoolActivities', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    window.location.href = '#/login';
  };

  // جلب معلومات المستخدم الحالي
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCurrentUser(null);
      return;
    }
    
    try {
      const h = getHeaders();
      const res = await fetch(`${API_BASE_URL}/user/me/`, { headers: h });
      
      if (res.status === 401) {
        logout();
        return;
      }
      
      if (res.ok) {
        const userData = await res.json();
        const user: User = {
          id: userData.id,
          username: userData.username,
          fullName: userData.fullName,
          role: userData.role,
          email: userData.email,
          status: userData.status
        };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }, []);

  // تحميل معلومات المستخدم عند بدء التطبيق
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved user:", e);
      }
    }
    
    // جلب المعلومات المحدثة من السيرفر
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const h = getHeaders();
      const responses = await Promise.all([
        fetch(`${API_BASE_URL}/students/`, { headers: h }),
        fetch(`${API_BASE_URL}/classes/`, { headers: h }),
        fetch(`${API_BASE_URL}/subjects/`, { headers: h }),
        fetch(`${API_BASE_URL}/results/`, { headers: h })
      ]);
      
      if (responses.some(r => r.status === 401)) {
        logout();
        return;
      }

      const [sRes, cRes, subRes, rRes] = responses;
      
      if (sRes.ok) setStudents(await sRes.json());
      if (cRes.ok) setClasses(await cRes.json());
      if (subRes.ok) setSubjects(await subRes.json());
      if (rRes.ok) {
        const rData = await rRes.json();
        setResults(Array.isArray(rData) ? rData : (rData.results || rData.data || []));
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "تعذر جلب البيانات. تأكد من تشغيل السيرفر.";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const fetchStatistics = useCallback(async (semester: number = 1) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const h = getHeaders();
      const res = await fetch(`${API_BASE_URL}/statistics/?semester=${semester}`, { headers: h });
      
      if (res.status === 401) {
        logout();
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "تعذر جلب الإحصائيات.";
      console.error("Error fetching statistics:", err);
      throw new Error(errorMessage);
    }
  }, []);

  const apiRequest = async (url: string, method: string, data?: any) => {
    const h = getHeaders();
    try {
      const res = await fetch(url, {
        method,
        headers: h,
        body: data ? JSON.stringify(data) : undefined
      });
      if (res.status === 401) { logout(); return null; }
      return res;
    } catch (err) { throw err; }
  };

  const addStudent = async (data: any) => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/students/`, 'POST', data);
      if (res?.ok) { 
        await fetchData(); 
        addActivity('add', t('act_student_added', data.fullName), [data.fullName]);
        notify(t('act_student_added', data.fullName)); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error adding student:", err);
    }
  };

  /* Fix: Implementation of bulkAddStudents */
  const bulkAddStudents = async (newStudents: Omit<Student, 'id'>[]) => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/students/bulk_create/`, 'POST', newStudents);
      if (res?.ok) { 
        await fetchData(); 
        addActivity('add', t('import_success', newStudents.length.toString()), [newStudents.length.toString()]);
        notify(t('import_success', newStudents.length.toString())); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error bulk adding students:", err);
    }
  };

  const addClass = async (data: any): Promise<Classroom | void> => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/classes/`, 'POST', data);
      if (res?.ok) { 
        const created = await res.json() as Classroom;
        await fetchData(); 
        addActivity('add', t('act_class_added', data.name), [data.name]);
        notify(t('act_class_added', data.name)); 
        return created;
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error adding class:", err);
    }
  };

  /* Fix: Implementation of updateClass */
  const updateClass = async (c: Classroom) => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/classes/${c.id}/`, 'PUT', c);
      if (res?.ok) { 
        await fetchData(); 
        addActivity('update', t('act_class_added', c.name), [c.name]);
        notify(t('act_class_added', c.name)); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error updating class:", err);
    }
  };

  /* Fix: Implementation of deleteClass */
  const deleteClass = async (id: string) => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/classes/${id}/`, 'DELETE');
      if (res?.ok) { 
        await fetchData(); 
        addActivity('delete', t('act_student_deleted'));
        notify(t('act_student_deleted'), 'info'); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error deleting class:", err);
    }
  };

  const addSubject = async (data: any) => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/subjects/`, 'POST', data);
      if (res?.ok) { 
        await fetchData(); 
        addActivity('add', t('act_subject_added', data.name), [data.name]);
        notify(t('act_subject_added', data.name)); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error adding subject:", err);
    }
  };

  /* Fix: Implementation of updateSubject */
  const updateSubject = async (s: Subject) => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/subjects/${s.id}/`, 'PUT', s);
      if (res?.ok) { 
        await fetchData(); 
        addActivity('update', t('act_subject_added', s.name), [s.name]);
        notify(t('act_subject_added', s.name)); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error updating subject:", err);
    }
  };

  const saveResults = async (newResults: Result[], customActivityMessage?: string) => {
    try {
      // إضافة status: 'pending' لكل نتيجة جديدة
      const resultsWithStatus = newResults.map(r => ({
        ...r,
        status: r.status || 'pending'
      }));
      
      const res = await apiRequest(`${API_BASE_URL}/results/bulk_create/`, 'POST', resultsWithStatus);
      if (res?.ok) { 
        await fetchData(); 
        const activityMessage = customActivityMessage || t('act_results_saved') + ` (${newResults.length} نتيجة)`;
        addActivity('result', activityMessage);
        notify(t('act_results_saved')); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error saving results:", err);
    }
  };

  // الموافقة على نتيجة
  const approveResult = async (resultId: string) => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/results/${resultId}/approve/`, 'POST', {});
      if (res?.ok) {
        await fetchData();
        notify('تم الموافقة على النتيجة بنجاح', 'success');
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.error || 'فشل الموافقة على النتيجة', 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل الموافقة على النتيجة';
      notify(errorMessage, 'error');
      console.error("Error approving result:", err);
    }
  };

  // رفض نتيجة
  const rejectResult = async (resultId: string, reason: string = '') => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/results/${resultId}/reject/`, 'POST', { reason });
      if (res?.ok) {
        await fetchData();
        notify('تم رفض النتيجة', 'info');
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.error || 'فشل رفض النتيجة', 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل رفض النتيجة';
      notify(errorMessage, 'error');
      console.error("Error rejecting result:", err);
    }
  };

  // جلب النتائج قيد المراجعة
  const fetchPendingResults = async (): Promise<Result[]> => {
    try {
      const h = getHeaders();
      const res = await fetch(`${API_BASE_URL}/results/pending/`, { headers: h });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error("Error fetching pending results:", err);
      return [];
    }
  };

  // Other methods similarly using notify...
  const updateStudent = async (s: Student) => {
    try {
      const res = await apiRequest(`${API_BASE_URL}/students/${s.id}/`, 'PUT', s);
      if (res?.ok) { 
        await fetchData(); 
        addActivity('update', t('act_student_updated', s.fullName), [s.fullName]);
        notify(t('act_student_updated', s.fullName)); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error updating student:", err);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      // الحصول على اسم الطالب قبل الحذف لعرضه في Activity
      const student = students.find(s => String(s.id) === String(id));
      const res = await apiRequest(`${API_BASE_URL}/students/${id}/`, 'DELETE');
      if (res?.ok) { 
        await fetchData(); 
        addActivity('delete', t('act_student_deleted') + (student ? `: ${student.fullName}` : ''));
        notify(t('act_student_deleted'), 'info'); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error deleting student:", err);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      // الحصول على اسم المادة قبل الحذف
      const subject = subjects.find(s => String(s.id) === String(id));
      const res = await apiRequest(`${API_BASE_URL}/subjects/${id}/`, 'DELETE');
      if (res?.ok) { 
        await fetchData(); 
        addActivity('delete', t('delete_subject_confirm') + (subject ? `: ${getSubjectDisplayName(subject, i18n.language)}` : ''));
        notify(t('delete_subject_confirm'), 'info'); 
      } else {
        const errorData = await res?.json().catch(() => ({}));
        notify(errorData.detail || t('error_occurred'), 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error_occurred');
      notify(errorMessage, 'error');
      console.error("Error deleting subject:", err);
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        students,
        classes,
        subjects,
        results,
        activities,
        currentUser,
        loading,
        error,
        t,
        language: i18n.language === 'ar' ? 'ar' : 'fr',
        addStudent,
        bulkAddStudents,
        updateStudent,
        deleteStudent,
        addClass,
        updateClass,
        deleteClass,
        addSubject,
        updateSubject,
        deleteSubject,
        saveResults,
        approveResult,
        rejectResult,
        fetchPendingResults,
        fetchData,
        fetchStatistics,
        fetchCurrentUser,
        notify,
      }}
    >
      {children}
      
      {/* Toast System UI */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-soft-xl border bg-white animate-in slide-in-from-top-full duration-300
            ${n.type === 'success' ? 'border-emerald-100 text-emerald-800' : 
              n.type === 'error' ? 'border-red-100 text-red-800' : 'border-blue-100 text-blue-800'}`}
          >
            <div className="flex items-center gap-3">
              {n.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />} 
              {n.type === 'error' && <XCircleIcon className="w-5 h-5 text-red-500" />} 
              {n.type === 'info' && <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />} 
              <span className="font-black text-sm">{n.message}</span>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="p-1 hover:bg-slate-100 rounded-full">
              <XMarkIcon className="w-4 h-4 opacity-50" />
            </button>
          </div>
        ))}
      </div>
    </SchoolContext.Provider>
  );
};

export const useSchoolContext = () => {
  const context = useContext(SchoolContext);
  if (!context) throw new Error('useSchoolContext error');
  return context;
};
