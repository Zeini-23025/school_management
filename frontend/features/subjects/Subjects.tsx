
import React, { useState } from 'react';
import { 
  PlusIcon, 
  BookOpenIcon, 
  CalculatorIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingLibraryIcon, 
  ChevronLeftIcon, 
  XMarkIcon,
  PlusCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/solid';
import { useSchoolContext } from '../../context/SchoolContext';
import { Subject, getSubjectDisplayName } from '../../types';
import Input from '../../components/Input';

const Subjects: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, t, language, currentUser } = useSchoolContext();
  const isTeacher = currentUser?.role === 'teacher';
  
  // Navigation State: null means level selection, number means level (1-6)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({
    name: '',
    totalPoints: 20
  });
  
  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const levels = [1, 2, 3, 4, 5, 6];

  // Filter subjects based on selected level
  const filteredSubjects = subjects.filter(s => s.level === selectedLevel);

  const getLevelName = (lvl: number) => t(`level_${lvl}` as any);

  const handleOpenAddModal = () => {
    setFormData({ name: '', totalPoints: 20 });
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setFormData(subject);
    setEditingId(subject.id);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteSubject(deleteTarget);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async () => {
    if (selectedLevel === null || !formData.name || !formData.totalPoints) {
      alert(t('fill_all_fields'));
      return;
    }

    const subjectData = {
      name: formData.name,
      totalPoints: Number(formData.totalPoints),
      level: selectedLevel
    };

    if (editingId) {
      await updateSubject({ ...subjectData, id: editingId } as Subject);
    } else {
      await addSubject(subjectData as Omit<Subject, 'id'>);
    }
    setShowModal(false);
  };

  if (selectedLevel === null) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg">
              <BuildingLibraryIcon className="w-6 h-6" />
            </div>
            {t('subjects_management')}
          </h2>
          <p className="text-slate-500 mt-1 font-medium">إدارة المنهاج الدراسي الموحد حسب المستويات التعليمية العامة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className="bg-white p-8 rounded-[32px] shadow-soft border border-slate-100 hover:shadow-soft-xl hover:-translate-y-1 transition-all text-right group flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors flex items-center justify-center">
                  <AcademicCapIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-800">{getLevelName(lvl)}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {subjects.filter(s => s.level === lvl).length} مواد دراسية موحدة
                  </p>
                </div>
              </div>
              <ChevronLeftIcon className={`w-6 h-6 text-slate-300 group-hover:text-primary-500 transition-transform ${language === 'ar' ? '' : 'rotate-180'}`} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedLevel(null)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm active:scale-95"
          >
            <ChevronLeftIcon className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <div className="flex items-center gap-2">
               <h2 className="text-2xl font-black text-slate-800">{getLevelName(selectedLevel)}</h2>
               <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  منهاج عام ثابت
               </span>
            </div>
            <p className="text-slate-500 font-medium">إدارة المواد التي يدرسها جميع تلاميذ هذا المستوى</p>
          </div>
        </div>
        {!isTeacher && (
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 group active:scale-95 font-black"
          >
            <PlusCircleIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>إضافة مادة للمستوى</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-[24px] shadow-soft border border-slate-100 p-6 flex items-start justify-between hover:shadow-soft-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <BookOpenIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">{getSubjectDisplayName(subject, language)}</h4>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-xl w-fit border border-slate-100">
                  <CalculatorIcon className="w-3.5 h-3.5" />
                  <span>عدد النقاط: <span className="text-slate-700">{subject.totalPoints}</span></span>
                </div>
              </div>
            </div>
            {!isTeacher && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEditModal(subject)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><PencilIcon className="w-5 h-5" /></button>
                <button onClick={() => { if(window.confirm(t('delete_subject_confirm'))) deleteSubject(subject.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><TrashIcon className="w-5 h-5" /></button>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
             <BookOpenIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
             <p className="text-slate-400 font-bold italic">لا توجد مواد مضافة لهذا المستوى بعد.</p>
          </div>
        )}

        {!isTeacher && (
          <button 
            onClick={handleOpenAddModal}
            className="border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50/30 transition-all min-h-[140px] group"
          >
            <PlusIcon className="w-8 h-8 mb-2 group-hover:scale-125 transition-transform" />
            <span className="text-sm font-black tracking-wide">أضف مادة جديدة</span>
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-soft-xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-xl font-black text-slate-800">{editingId ? t('edit_subject') : 'إضافة مادة جديدة'}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">{getLevelName(selectedLevel)}</p>
               </div>
               <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                 <XMarkIcon className="w-6 h-6" />
               </button>
             </div>
             <div className="p-8 space-y-6">
                <Input label={t('subject_name')} placeholder={t('subject_placeholder')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('total_points')}</label>
                  <div className="relative">
                    <input type="number" min="1" max="100" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black text-slate-800" value={formData.totalPoints} onChange={e => setFormData({...formData, totalPoints: parseInt(e.target.value) || 20})} />
                    <CalculatorIcon className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-3.5 w-5 h-5 text-slate-400`} />
                  </div>
                </div>
             </div>
             <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
               <button onClick={() => setShowModal(false)} className="px-6 py-3 text-slate-600 hover:bg-slate-200 rounded-2xl font-bold transition-all">{t('cancel')}</button>
               <button onClick={handleSubmit} className="px-8 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-black shadow-lg shadow-primary-200 active:scale-95">
                 {editingId ? t('save_changes') : t('add')}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-soft-xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 bg-red-50/50">
              <h3 className="text-xl font-black text-red-600">{t('delete_subject_confirm')}</h3>
              <p className="text-sm text-slate-500 mt-2">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
            <div className="p-8 pt-6 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-2xl font-bold transition-all">
                {t('cancel')}
              </button>
              <button onClick={handleDeleteConfirm} className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black shadow-lg shadow-red-200 active:scale-95">
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
