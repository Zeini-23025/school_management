import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Student, getSubjectDisplayName } from '../types';
import Input from '../components/Input';
import { useSchoolContext } from '../context/SchoolContext';
import { useTranslation } from 'react-i18next';

const Students: React.FC = () => {
  const { students, classes, subjects, results, addStudent, updateStudent, deleteStudent, language } = useSchoolContext();
  const { t } = useTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [reportSemester, setReportSemester] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    birthDate: '',
    gender: 'M',
    classId: '',
    parentPhone: '',
    address: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      birthDate: '',
      gender: 'M',
      classId: classes[0]?.id || '',
      parentPhone: '',
      address: '',
      notes: ''
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (student: Student) => {
    setFormData(student);
    setEditingId(student.id);
    setShowModal(true);
  };

  const openReportModal = (student: Student) => {
    setViewingStudent(student);
    setReportSemester(1); // Default to Semester 1
    setShowReportModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('delete_confirm_student'))) {
      deleteStudent(id);
    }
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.classId) {
      alert(t('fill_required'));
      return;
    }

    if (editingId) {
      updateStudent({ ...formData, id: editingId } as Student);
    } else {
      addStudent(formData as Omit<Student, 'id'>);
    }
    setShowModal(false);
    resetForm();
  };
  
  // Filter Logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass ? student.classId === selectedClass : true;
    return matchesSearch && matchesClass;
  });

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || t('unknown');
  };

  const handleExportCSV = () => {
    // Add BOM for Excel to read Arabic correctly
    const BOM = "\uFEFF"; 
    const header = `${t('full_name')},${t('birth_date')},${t('gender')},${t('class')},${t('parent_phone')},${t('address')}\n`;
    const rows = filteredStudents.map(s => 
      `"${s.fullName}","${s.birthDate}","${s.gender === 'M' ? t('male') : t('female')}","${getClassName(s.classId)}","${s.parentPhone}","${s.address}"`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(BOM + header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "students_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculation Helper - FIXED: Use level subjects only and handle test/exam properly
  const calculateAverage = (studentId: string, semester: number = 1) => {
    // Convert studentId to string for consistency
    const studentIdStr = String(studentId);
    
    // Find the student's class
    const student = students.find(s => String(s.id) === studentIdStr);
    if (!student) return { totalScore: 0, totalCoeff: 0, average: '--' };
    
    const currentClass = classes.find(c => String(c.id) === String(student.classId));
    if (!currentClass) return { totalScore: 0, totalCoeff: 0, average: '--' };

    // Get subjects for this student's level only
    const levelSubjects = subjects.filter(s => s.level === currentClass.level);
    if (levelSubjects.length === 0) return { totalScore: 0, totalCoeff: 0, average: '--' };

    // Get results for this student and semester - FIXED: Ensure all IDs are strings
    const semesterResults = results.filter(
      r => String(r.studentId) === studentIdStr && r.semester === semester
    );

    let normalizedScores: number[] = [];
    let totalScore = 0;

    // Calculate average based on level subjects only
    levelSubjects.forEach(subj => {
      const subjIdStr = String(subj.id);
      
      // Find both test and exam results - FIXED: Ensure consistent string comparison
      const testRes = semesterResults.find(
        r => String(r.subjectId) === subjIdStr && r.type === 'test'
      );
      const examRes = semesterResults.find(
        r => String(r.subjectId) === subjIdStr && r.type === 'exam'
      );

      // Calculate subject score: average if both exist, otherwise use available one
      let subjScore = null;
      if (testRes && examRes) {
        // If both exist, use average of both
        subjScore = (testRes.score + examRes.score) / 2;
      } else if (examRes) {
        subjScore = examRes.score;
      } else if (testRes) {
        subjScore = testRes.score;
      }

      // Convert score to normalized scale (out of 20) based on totalPoints
      if (subjScore !== null && subj.totalPoints > 0) {
        const normalizedScore = (subjScore / subj.totalPoints) * 20;
        normalizedScores.push(normalizedScore);
        totalScore += normalizedScore;
      }
    });

    // Return '--' if no results found, otherwise calculate average
    const average = normalizedScores.length > 0 
      ? (totalScore / normalizedScores.length).toFixed(2) 
      : '--';

    return {
      totalScore: totalScore,
      totalCoeff: normalizedScores.length,
      average
    };
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{t('students_management')}</h2>
        <div className="flex gap-2">
           <button 
             onClick={handleExportCSV}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
           >
             <ArrowDownTrayIcon className="w-4 h-4" />
             <span>{t('export_csv')}</span>
           </button>
           <button 
             onClick={openAddModal}
             className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-sky-600 transition shadow-sm"
           >
             <PlusIcon className="w-4 h-4" />
             <span>{t('add_student')}</span>
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input 
             label="" 
             placeholder={t('search_placeholder')} 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        </div>
        <div className="w-full md:w-64">
           <select 
             className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
             value={selectedClass}
             onChange={(e) => setSelectedClass(e.target.value)}
           >
             <option value="">{t('all_classes')}</option>
             {classes.map(c => (
               <option key={c.id} value={c.id}>{c.name}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">{t('full_name')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600">{t('birth_date')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600">{t('gender')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600">{t('class')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600">{t('average_sem1')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const { average } = calculateAverage(student.id, 1); // Default to Semester 1 in table
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800 cursor-pointer hover:text-primary" onClick={() => openReportModal(student)}>{student.fullName}</td>
                      <td className="px-6 py-4 text-gray-600">{student.birthDate}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.gender === 'M' ? t('male') : t('female')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                          {getClassName(student.classId)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         {average !== '--' ? (
                           <span className={`font-bold ${Number(average) >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                             {average}
                           </span>
                         ) : (
                           <span className="text-gray-400">--</span>
                         )}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button 
                           onClick={() => openReportModal(student)}
                           className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition"
                           title={t('report_card')}
                         >
                           <DocumentTextIcon className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => openEditModal(student)}
                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                         >
                           <PencilIcon className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleDelete(student.id)}
                           className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                         >
                           <TrashIcon className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {t('no_data')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Card Modal */}
      {showReportModal && viewingStudent && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                    {viewingStudent.fullName.charAt(0)}
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-gray-800">{viewingStudent.fullName}</h3>
                     <p className="text-gray-500 text-sm">
                       {t('class')}: {getClassName(viewingStudent.classId)}
                     {(() => {
                       const { average } = calculateAverage(viewingStudent.id, reportSemester);
                       return average !== '--' ? (
                         <p className="text-primary text-sm font-semibold mt-1">
                           {t('general_average')}: {average} / 20
                         </p>
                       ) : null;
                     })()}
                  </div>
                </div>
                <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-red-500">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Semester Tabs */}
              <div className="px-6 pt-4 flex gap-2">
                {[1, 2, 3].map(sem => (
                    <button
                    key={sem}
                    onClick={() => setReportSemester(sem as 1 | 2 | 3)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-bold transition-all
                      ${reportSemester === sem 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                    >
                    {t('semester_results', sem.toString())}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                  {t('semester_results', reportSemester.toString())}
                </h4>
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 text-gray-600 font-semibold">{t('subject')}</th>
                      <th className="py-3 text-gray-600 font-semibold">{t('total_points')}</th>
                      <th className="py-3 text-gray-600 font-semibold">{t('score_20')}</th>
                      <th className="py-3 text-gray-600 font-semibold">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {(() => {
                       // Get subjects for this student's level only
                       const currentClass = classes.find(c => String(c.id) === String(viewingStudent.classId));
                       const levelSubjects = currentClass 
                         ? subjects.filter(s => s.level === currentClass.level)
                         : subjects;
                       
                       const semesterResults = results.filter(
                         r => String(r.studentId) === String(viewingStudent.id) && r.semester === reportSemester
                       );
                       
                       return levelSubjects.map(subject => {
                         // Find both test and exam results
                         const testRes = semesterResults.find(
                           r => String(r.subjectId) === String(subject.id) && r.type === 'test'
                         );
                         const examRes = semesterResults.find(
                           r => String(r.subjectId) === String(subject.id) && r.type === 'exam'
                         );
                         
                         // Calculate subject score: average if both exist, otherwise use available one
                         let subjScore = null;
                         let scoreDisplay = '-';
                         if (testRes && examRes) {
                           subjScore = (testRes.score + examRes.score) / 2;
                           scoreDisplay = `${subjScore.toFixed(2)} (اختبار: ${testRes.score} / امتحان: ${examRes.score})`;
                         } else if (examRes) {
                           subjScore = examRes.score;
                           scoreDisplay = `${subjScore} (امتحان)`;
                         } else if (testRes) {
                           subjScore = testRes.score;
                           scoreDisplay = `${subjScore} (اختبار)`;
                         }
                         
                         const total = subjScore !== null ? subjScore * subject.coefficient : 0;
                         return (
                           <tr key={subject.id}>
                             <td className="py-3 font-medium text-gray-800">{getSubjectDisplayName(subject, language)}</td>
                             <td className="py-3 text-gray-500">{subject.coefficient}</td>
                             <td className="py-3">
                               <span className={`${subjScore !== null && subjScore < 10 ? 'text-red-500' : 'text-gray-800'}`}>
                                 {scoreDisplay}
                               </span>
                             </td>
                             <td className="py-3 font-medium text-gray-700">{subjScore !== null ? total.toFixed(2) : '-'}</td>
                           </tr>
                         );
                       });
                     })()}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-100">
                    {(() => {
                      const { totalScore, totalCoeff, average } = calculateAverage(viewingStudent.id, reportSemester);
                      const avgNum = parseFloat(average as string);
                      return (
                        <>
                          <tr>
                            <td colSpan={2} className="py-4 font-bold text-gray-800">{t('total_general')}</td>
                            <td className="py-4"></td>
                            <td className="py-4 font-bold text-gray-800">{totalScore} / {totalCoeff * 20}</td>
                          </tr>
                          <tr className={`${avgNum >= 10 ? 'bg-green-50' : 'bg-red-50'}`}>
                            <td colSpan={2} className="py-4 font-bold text-gray-900 pr-4 rounded-r-lg">
                              {t('semester_average')}
                            </td>
                            <td colSpan={2} className={`py-4 font-bold text-xl pl-4 rounded-l-lg text-left ${avgNum >= 10 ? 'text-green-700' : 'text-red-600'}`}>
                              {average} / 20
                            </td>
                          </tr>
                        </>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
           </div>
         </div>
      )}

      {/* Modal for Adding/Editing Student */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 className="text-xl font-bold">
                 {editingId ? t('edit_student') : t('new_student')}
               </h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">x</button>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label={t('full_name')} 
                  placeholder={t('full_name')}
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
                <Input 
                  label={t('birth_date')} 
                  type="date" 
                  value={formData.birthDate}
                  onChange={e => setFormData({...formData, birthDate: e.target.value})}
                />
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">{t('gender')}</label>
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value as 'M' | 'F'})}
                  >
                    <option value="M">{t('male')}</option>
                    <option value="F">{t('female')}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">{t('class')}</label>
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                    value={formData.classId}
                    onChange={e => setFormData({...formData, classId: e.target.value})}
                  >
                     <option value="" disabled>{t('select_class')}</option>
                     {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <Input 
                  label={t('parent_phone')} 
                  placeholder="055..." 
                  value={formData.parentPhone}
                  onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                />
                <Input 
                  label={t('address')} 
                  placeholder={t('address')} 
                  className="md:col-span-2" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
                <div className="md:col-span-2">
                   <label className="text-sm font-medium text-gray-700">{t('notes')}</label>
                   <textarea 
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 mt-1" 
                     rows={3}
                     value={formData.notes || ''}
                     onChange={e => setFormData({...formData, notes: e.target.value})}
                   ></textarea>
                </div>
             </div>
             <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  {t('cancel')}
                </button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-sky-600">
                 {editingId ? t('save_changes') : t('add')}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;