import React, { useState } from 'react';
import { PlusIcon, AcademicCapIcon, UsersIcon, AcademicCapIcon as GraduationCapIcon, PencilIcon, TrashIcon, EyeIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useSchoolContext } from '../context/SchoolContext';
import { Classroom } from '../types';
import Input from '../components/Input';

const Classes: React.FC = () => {
  const { classes, students, addClass, updateClass, deleteClass } = useSchoolContext();
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClassForView, setSelectedClassForView] = useState<Classroom | null>(null);
  
  // Toggle states for collapsible sections (default all open)
  const [openLevels, setOpenLevels] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: true
  });

  const [formData, setFormData] = useState<Partial<Classroom>>({
    name: '',
    level: 1,
  });

  const toggleLevel = (level: number) => {
    setOpenLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  const resetForm = (defaultLevel: number = 1) => {
    setFormData({ name: '', level: defaultLevel });
    setEditingId(null);
  };

  const openAddModal = (level?: number) => {
    resetForm(level || 1);
    setShowModal(true);
  };

  const openEditModal = (cls: Classroom) => {
    setFormData(cls);
    setEditingId(cls.id);
    setShowModal(true);
  };

  const openStudentsModal = (cls: Classroom) => {
    setSelectedClassForView(cls);
    setShowStudentsModal(true);
  };

  const handleDelete = (id: string) => {
    const count = students.filter(s => s.classId === id).length;
    if (count > 0) {
      if (!window.confirm(`هذا القسم يحتوي على ${count} تلميذ. هل أنت متأكد من حذفه؟`)) return;
    } else {
      if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    }
    deleteClass(id);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      alert('يرجى إدخال اسم القسم');
      return;
    }

    if (editingId) {
      updateClass({ ...formData, id: editingId, studentCount: 0 } as Classroom);
    } else {
      addClass(formData as Omit<Classroom, 'id' | 'studentCount'>);
    }
    setShowModal(false);
    resetForm();
  };

  // Helper to count students per class dynamically
  const getStudentCount = (classId: string) => {
    return students.filter(s => s.classId === classId).length;
  };

  // Get students for the selected class modal
  const getClassStudents = () => {
    if (!selectedClassForView) return [];
    return students.filter(s => s.classId === selectedClassForView.id);
  };

  // Group classes by level
  const levels = [1, 2, 3, 4, 5, 6];
  
  const getLevelName = (lvl: number) => {
    switch(lvl) {
      case 1: return "السنة الأولى ابتدائي";
      case 2: return "السنة الثانية ابتدائي";
      case 3: return "السنة الثالثة ابتدائي";
      case 4: return "السنة الرابعة ابتدائي";
      case 5: return "السنة الخامسة ابتدائي";
      case 6: return "السنة السادسة ابتدائي";
      default: return `المستوى ${lvl}`;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <AcademicCapIcon className="w-8 h-8 text-primary" />
             الهيكلة التربوية
           </h2>
           <p className="text-gray-500 mt-1">توزيع الأفواج والأقسام حسب المستويات الدراسية</p>
        </div>
        <button 
          onClick={() => openAddModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-bold">إضافة قسم (عام)</span>
        </button>
      </div>

      <div className="space-y-8">
        {levels.map((level) => {
          const levelClasses = classes.filter(c => c.level === level);
          const isOpen = openLevels[level];

          return (
            <div key={level} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Level Header */}
              <div 
                className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
                onClick={() => toggleLevel(level)}
              >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${levelClasses.length > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                      <GraduationCapIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-gray-800">{getLevelName(level)}</h3>
                      <p className="text-sm text-gray-500">{levelClasses.length} أفواج</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openAddModal(level); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-primary rounded-lg text-sm font-bold hover:bg-blue-50 transition"
                  >
                    <PlusIcon className="w-4 h-4" />
                    إضافة فوج
                  </button>
                  {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Level Body (Grid of Classes) */}
              {isOpen && (
                <div className="p-6 bg-white">
                  {levelClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {levelClasses.map(cls => {
                        const count = getStudentCount(cls.id);
                        return (
                          <div key={cls.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-md transition group relative bg-gray-50/50">
                             <div className="flex justify-between items-start mb-3">
                                <h4 
                                  className="font-bold text-lg text-gray-800 cursor-pointer hover:text-primary"
                                  onClick={() => openStudentsModal(cls)}
                                >
                                  {cls.name}
                                </h4>
                                <div className="flex gap-1">
                                  <button onClick={() => openEditModal(cls)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><PencilIcon className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete(cls.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                             </div>
                             
                             <div 
                               className="flex items-center justify-between text-sm text-gray-600 cursor-pointer"
                               onClick={() => openStudentsModal(cls)}
                             >
                               <div className="flex items-center gap-1.5">
                                 <UsersIcon className="w-4 h-4 text-gray-400" />
                                 <span>{count} تلميذ</span>
                               </div>
                               <EyeIcon className="w-4 h-4 text-gray-300 group-hover:text-primary" />
                             </div>

                             {/* Progress Bar */}
                             <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${Math.min((count / 30) * 100, 100)}%` }}></div>
                             </div>
                          </div>
                        );
                      })}
                      
                      {/* Quick Add Button inside grid */}
                      <button 
                        onClick={() => openAddModal(level)}
                        className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-blue-50 transition min-h-[100px]"
                      >
                        <PlusIcon className="w-6 h-6 mb-1" />
                        <span className="text-sm font-medium">فوج جديد</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                      <AcademicCapIcon className="w-12 h-12 mb-2 opacity-20" />
                      <p className="mb-4">لا توجد أقسام مسجلة في هذا المستوى</p>
                      <button 
                        onClick={() => openAddModal(level)}
                        className="text-primary font-bold hover:underline"
                      >
                        + إضافة أول قسم للسنة {level}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="text-xl font-bold text-gray-800">{editingId ? 'تعديل قسم' : 'إضافة قسم جديد'}</h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition">
                 <XMarkIcon className="w-6 h-6" />
               </button>
             </div>
             <div className="p-6 space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                   <p className="text-sm text-blue-800 font-medium">
                     أنت تقوم بالإضافة في: <span className="font-bold">{getLevelName(formData.level || 1)}</span>
                   </p>
                </div>

                <Input 
                  label="اسم الفوج" 
                  placeholder="مثال: أ ، ب ، ج ، عمر بن الخطاب..." 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  autoFocus
                />
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">تغيير المستوى (اختياري)</label>
                  <select 
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                     value={formData.level}
                     onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
                  >
                    {[1, 2, 3, 4, 5, 6].map(l => (
                      <option key={l} value={l}>{getLevelName(l)}</option>
                    ))}
                  </select>
                </div>
             </div>
             <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
               <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition">إلغاء</button>
               <button onClick={handleSubmit} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition font-bold shadow-lg">
                 {editingId ? 'حفظ التعديلات' : 'إضافة'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* View Students Modal */}
      {showStudentsModal && selectedClassForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
               <div>
                 <h3 className="text-xl font-bold text-gray-800">{selectedClassForView.name}</h3>
                 <p className="text-sm text-gray-500 mt-1">المستوى: {getLevelName(selectedClassForView.level)} | العدد: {getClassStudents().length}</p>
               </div>
               <button onClick={() => setShowStudentsModal(false)} className="text-gray-400 hover:text-red-500 transition bg-white p-2 rounded-full shadow-sm">
                 <XMarkIcon className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-0 overflow-y-auto flex-1">
                {getClassStudents().length > 0 ? (
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">الاسم الكامل</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">تاريخ الميلاد</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">الجنس</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">رقم الولي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getClassStudents().map((s, idx) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-500 text-sm">{idx + 1}</td>
                          <td className="px-6 py-4 font-medium text-gray-800">{s.fullName}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{s.birthDate}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{s.gender === 'M' ? 'ذكر' : 'أنثى'}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{s.parentPhone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
                    <UsersIcon className="w-16 h-16 mb-4 opacity-20" />
                    <p>لا يوجد تلاميذ مسجلين في هذا الفوج.</p>
                  </div>
                )}
             </div>
             
             <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
               <button 
                 onClick={() => setShowStudentsModal(false)} 
                 className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
               >
                 إغلاق
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;