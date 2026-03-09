import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSchoolContext } from '../context/SchoolContext';
import type { TeacherAssignment } from '../types';
import { getSubjectDisplayName } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

interface AssignmentRow extends TeacherAssignment {
  classroom_name?: string;
  subject_name?: string;
  user_username?: string;
}

interface UserOption {
  id: string;
  username: string;
  fullName: string;
}

const Assignments: React.FC = () => {
  const { t, classes, subjects, fetchData, notify } = useSchoolContext();
  const { i18n } = useTranslation();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ user: '', classroom: '', subject: '' });

  const selectedClass = form.classroom ? classes.find((c) => c.id === form.classroom) : null;
  const subjectsForClass = selectedClass
    ? subjects.filter((s) => s.level === selectedClass.level)
    : [];

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/assignments/`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (e) {
      console.error(e);
      notify(t('error_occurred'), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify, t]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users/`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setUsers([]);
        if (res.status === 403) notify(t('no_teachers_hint'), 'error');
      }
    } catch (e) {
      console.error(e);
      setUsers([]);
    }
  }, [notify, t]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    if (showModal) fetchUsers();
  }, [showModal, fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user || !form.classroom || !form.subject) {
      notify(t('fill_required'), 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/assignments/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          user: form.user,
          classroom: form.classroom,
          subject: form.subject,
        }),
      });
      if (res.ok) {
        notify(t('act_class_added', 'Assignation'));
        setForm({ user: '', classroom: '', subject: '' });
        setShowModal(false);
        await fetchAssignments();
        await fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        notify(err.detail || err.error || t('error_occurred'), 'error');
      }
    } catch (e) {
      notify(t('error_occurred'), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('delete_class_confirm'))) return;
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        notify(t('act_student_deleted'), 'info');
        await fetchAssignments();
        await fetchData();
      }
    } catch (e) {
      notify(t('error_occurred'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{t('assignments_title')}</h2>
          <p className="text-slate-500 font-medium">{t('assignments_desc')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-lg font-bold"
        >
          <UserPlus className="w-4 h-4" />
          {t('assignments_add')}
        </button>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-soft border border-slate-100">
        {loading ? (
          <p className="text-slate-500">{t('loading')}</p>
        ) : assignments.length === 0 ? (
          <p className="text-slate-500">{t('no_data')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-black text-slate-600 uppercase text-xs">{t('username')}</th>
                  <th className="py-3 px-4 font-black text-slate-600 uppercase text-xs">{t('class')}</th>
                  <th className="py-3 px-4 font-black text-slate-600 uppercase text-xs">{t('subject')}</th>
                  <th className="py-3 px-4 font-black text-slate-600 uppercase text-xs w-24">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-800">{a.user_username ?? a.user}</td>
                    <td className="py-3 px-4">{a.classroom_name ?? a.classroom}</td>
                    <td className="py-3 px-4">{(i18n.language === 'ar' && a.subject_name_ar) ? a.subject_name_ar : (a.subject_name ?? a.subject)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title={t('delete_class_confirm')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[32px] shadow-soft-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">{t('assignments_add')}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('username')}</label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  value={form.user}
                  onChange={(e) => setForm({ ...form, user: e.target.value })}
                  required
                >
                  <option value="">-- {t('select_teacher')} --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName || u.username}</option>
                  ))}
                </select>
                {users.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">{t('no_teachers_hint')}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('class')}</label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  value={form.classroom}
                  onChange={(e) => setForm({ ...form, classroom: e.target.value, subject: '' })}
                  required
                >
                  <option value="">-- {t('select_class')} --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {classes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">{t('no_classes_hint')}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('subject')}</label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  disabled={!form.classroom}
                >
                  <option value="">-- {form.classroom ? t('subject') : t('select_class_first')} --</option>
                  {subjectsForClass.map((s) => (
                    <option key={s.id} value={s.id}>
                      {getSubjectDisplayName(s, i18n.language)} ({s.totalPoints} pts)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold">
                  {t('cancel')}
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-bold">
                  {t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
