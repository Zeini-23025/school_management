import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, DocumentTextIcon, XMarkIcon, ArrowUpTrayIcon, TableCellsIcon, InformationCircleIcon, MapPinIcon, PhoneIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { Student, getSubjectDisplayName } from '../../types';
import Input from '../../components/Input';
import { useSchoolContext } from '../../context/SchoolContext';
import * as XLSX from 'xlsx';

const LEVEL_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

const Students: React.FC = () => {
  const { students, classes, subjects, results, addStudent, bulkAddStudents, updateStudent, deleteStudent, addClass, t, language, currentUser } = useSchoolContext();
  const isTeacher = currentUser?.role === 'teacher';

  // Options pour le menu Classe : classes existantes ou niveaux 1–6 si aucune classe
  const classOptions = classes.length > 0
    ? classes
    : LEVEL_OPTIONS.map(level => ({ id: `level_${level}`, name: t(`level_${level}` as any), level }));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [nniFilter, setNniFilter] = useState('');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [reportSemester, setReportSemester] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '', nni: '', birthDate: '', gender: 'M', classId: '', parentPhone: '', address: '', notes: ''
  });

  const getClassName = (classId: string) => classes.find(c => c.id === classId)?.name || t('unknown');

  // Moyenne école : total max = somme des barèmes des matières du niveau (souvent 200). Chaque matière garde son barème (20, 10, 30, 40, 50...).
  // total_élève = somme des notes brutes. Moyenne sur 20 = (total_élève / total_max_du_niveau) × 20
  const calculateGeneralAverage = (studentId: string, classId: string) => {
    const currentClass = classes.find(c => c.id === classId);
    const classSubjects = subjects.filter(s => s.level === currentClass?.level);
    if (classSubjects.length === 0) return '--';

    const totalMaxNiveau = classSubjects.reduce((sum, s) => sum + (s.totalPoints || 20), 0);
    let totalEleve = 0;
    let hasAnyResult = false;

    classSubjects.forEach(subj => {
      const subjectResults = results.filter(r => r.studentId === studentId && r.subjectId === subj.id);
      if (subjectResults.length === 0) return;

      const semesters = [1, 2, 3];
      const notesSemestre: number[] = [];
      semesters.forEach(sem => {
        const semesterResults = subjectResults.filter(r => r.semester === sem);
        const testRes = semesterResults.find(r => r.type === 'test');
        const examRes = semesterResults.find(r => r.type === 'exam');
        if (testRes || examRes) {
          let noteSem = 0;
          if (testRes && examRes) {
            noteSem = (testRes.score + examRes.score) / 2;
          } else {
            noteSem = (testRes || examRes)!.score;
          }
          notesSemestre.push(noteSem);
        }
      });

      if (notesSemestre.length === 0) return;
      const noteMatiere = notesSemestre.reduce((a, b) => a + b, 0) / notesSemestre.length;
      totalEleve += noteMatiere;
      hasAnyResult = true;
    });

    if (!hasAnyResult || totalMaxNiveau <= 0) return '--';
    const moyenneSur20 = (totalEleve / totalMaxNiveau) * 20;
    return moyenneSur20.toFixed(2);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass ? student.classId === selectedClass : true;
    const matchesNni = !nniFilter.trim() || (student.nni && student.nni.toLowerCase().includes(nniFilter.trim().toLowerCase()));
    return matchesSearch && matchesClass && matchesNni;
  });

  const handleExportCSV = () => {
    const BOM = "\uFEFF"; 
    const header = `${t('full_name')},${t('nni')},${t('birth_date')},${t('gender')},${t('class')},${t('parent_phone')},${t('address')},${t('general_average')}\n`;
    const rows = filteredStudents.map(s => {
      const avg = calculateGeneralAverage(s.id, s.classId);
      return `"${s.fullName}","${s.nni || ''}","${s.birthDate}","${s.gender === 'M' ? t('male') : t('female')}","${getClassName(s.classId)}","${s.parentPhone}","${s.address}","${avg}"`;
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(BOM + header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `students_full_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) {
      alert(t('select_class_first'));
      return;
    }
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      const newStudents = data.map(row => ({
        fullName: String(row['الاسم الكامل'] || row['Full Name'] || ''),
        birthDate: String(row['تاريخ الميلاد'] || row['Birth Date'] || ''),
        gender: ((row['الجنس (M/F)'] || row['Gender'] || 'M').toString().toUpperCase() === 'F' ? 'F' : 'M') as 'M' | 'F',
        parentPhone: String(row['رقم ولي الأمر'] || row['Phone'] || ''),
        address: String(row['العنوان'] || row['Address'] || ''),
        classId: selectedClass,
        notes: ''
      })).filter(s => s.fullName !== '');

      if (newStudents.length > 0) {
        await bulkAddStudents(newStudents as any);
        alert(t('import_success', newStudents.length.toString()));
        setShowImportModal(false);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{t('students_management')}</h2>
          <p className="text-slate-500 font-medium">{isTeacher ? t('students_desc_teacher') : t('students_desc')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition font-bold shadow-sm active:scale-95">
             <ArrowDownTrayIcon className="w-4 h-4 text-primary-500" />
             <span>{t('export_csv')}</span>
           </button>
           {!isTeacher && (
             <>
               <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition font-bold shadow-sm active:scale-95">
                 <TableCellsIcon className="w-4 h-4 text-green-500" />
                 <span>{t('import_excel')}</span>
               </button>
               <button onClick={() => { setFormData({ fullName: '', nni: '', gender: 'M', classId: classes[0]?.id || '' }); setEditingId(null); setShowModal(true); }} className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 font-bold active:scale-95">
                 <PlusIcon className="w-4 h-4" />
                 <span>{t('add_student')}</span>
               </button>
             </>
           )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-soft border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input label="" placeholder={t('search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />
          <MagnifyingGlassIcon className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-3 w-5 h-5 text-slate-400`} />
        </div>
        <div className="w-full md:w-48">
          <input
            type="text"
            placeholder={t('filter_by_nni')}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-700 placeholder:text-slate-400"
            value={nniFilter}
            onChange={(e) => setNniFilter(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-700" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">{t('all_classes')}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-soft border border-slate-100">
        {/* keep search/filter area above and make table itself scrollable */}
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-wider text-[11px]">{t('full_name')}</th>
                <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-wider text-[11px]">{t('nni')}</th>
                <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-wider text-[11px]">{t('class')}</th>
                <th className="px-4 py-5 font-black text-slate-500 uppercase tracking-wider text-[11px]">{t('birth_date')}</th>
                <th className="px-4 py-5 font-black text-slate-500 uppercase tracking-wider text-[11px]">{t('parent_phone')}</th>
                <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-wider text-[11px]">{t('address')}</th>
            <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-wider text-[11px]">
              {t('general_average')}
            </th>
                <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-wider text-[11px]">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                  const generalAvg = calculateGeneralAverage(student.id, student.classId);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex flex-col">
                           <span>{student.fullName}</span>
                           <span className="text-[10px] text-slate-400 font-medium">ID: {student.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm font-medium tabular-nums">
                        {student.nni || '--'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-lg bg-primary-50 text-primary-700 text-[11px] font-black border border-primary-100">
                          {getClassName(student.classId)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-500 text-sm whitespace-nowrap">
                         <div className="flex items-center gap-2">
                           <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-300" />
                           {student.birthDate}
                         </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 text-sm">
                         <div className="flex items-center gap-2">
                           <PhoneIcon className="w-3.5 h-3.5 text-emerald-400" />
                           {student.parentPhone || '--'}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm max-w-[150px] truncate" title={student.address}>
                         <div className="flex items-center gap-2">
                           <MapPinIcon className="w-3.5 h-3.5 text-red-300" />
                           {student.address || '--'}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-sm border ${
                          generalAvg === '--' ? 'bg-slate-50 text-slate-400 border-slate-100' : 
                          Number(generalAvg) >= 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {generalAvg}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setViewingStudent(student); setShowReportModal(true); }} className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition" title={t('report_card')}><DocumentTextIcon className="w-5 h-5" /></button>
                          {!isTeacher && (
                            <>
                              <button onClick={() => { setFormData(student); setEditingId(student.id); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"><PencilIcon className="w-5 h-5" /></button>
                              <button onClick={() => { if(window.confirm(t('delete_confirm_student'))) deleteStudent(student.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><TrashIcon className="w-5 h-5" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <InformationCircleIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">{t('no_data')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: إضافة/تعديل تلميذ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] shadow-soft-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
             <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
               <div>
                  <h3 className="text-2xl font-black text-slate-800">{editingId ? t('edit_student') : t('new_student')}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">تحديث قاعدة بيانات التعليم</p>
               </div>
               <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><XMarkIcon className="w-7 h-7" /></button>
             </div>
             <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label={t('full_name')} placeholder="الاسم الرباعي" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                <Input label={t('nni')} placeholder={t('nni_placeholder')} value={formData.nni || ''} onChange={e => setFormData({...formData, nni: e.target.value})} />
                <Input label={t('birth_date')} type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('gender')}</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-slate-800" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as 'M' | 'F'})}>
                    <option value="M">{t('male')}</option>
                    <option value="F">{t('female')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('class')}</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-slate-800" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                    <option value="" disabled>{t('select_class')}</option>
                    {classOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <Input label={t('parent_phone')} placeholder="مثال: 44332211" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
                <Input label={t('address')} placeholder="الحي، الزقاق، رقم المنزل" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                <div className="md:col-span-2">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 mb-2 block">{t('notes')}</label>
                   <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-800" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="أي ملاحظات إضافية عن التلميذ..."></textarea>
                </div>
             </div>
             <div className="p-10 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
               <button onClick={() => setShowModal(false)} className="px-8 py-4 text-slate-500 hover:bg-slate-200 rounded-2xl font-black transition-all">{t('cancel')}</button>
               <button onClick={async () => { 
                 if(!formData.fullName || !formData.classId) { alert(t('fill_required')); return; } 
                 let classId = formData.classId;
                 if (classId.startsWith('level_')) {
                   const level = parseInt(classId.replace('level_', ''), 10);
                   const levelName = t(`level_${level}` as any);
                   const created = await addClass({ name: levelName, level });
                   if (!created?.id) return;
                   classId = created.id;
                 }
                 if (editingId) {
                   updateStudent({ ...formData, id: editingId, classId } as Student);
                 } else {
                   addStudent({ ...formData, classId } as any);
                 }
                 setShowModal(false); 
               }} className="px-12 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-black shadow-lg shadow-primary-200 active:scale-95">
                 {editingId ? t('save_changes') : t('add')}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Modal: استيراد Excel */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-[40px] shadow-soft-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-black">{t('import_excel')}</h3>
                <button onClick={() => setShowImportModal(false)}><XMarkIcon className="w-7 h-7 text-slate-400 hover:text-red-500 transition-all" /></button>
              </div>
              <div className="p-10 space-y-8">
                 <button onClick={() => {
                   const data = [{ 'الاسم الكامل': 'محمد أحمد محمود', 'تاريخ الميلاد': '2015-05-20', 'الجنس (M/F)': 'M', 'رقم ولي الأمر': '22113344', 'العنوان': 'نواكشوط، تفرغ زينة' }];
                   const ws = XLSX.utils.json_to_sheet(data);
                   const wb = XLSX.utils.book_new();
                   XLSX.utils.book_append_sheet(wb, ws, "Students");
                   XLSX.writeFile(wb, "Madrasati_Students_Template.xlsx");
                 }} className="w-full py-5 bg-primary-50 text-primary-700 rounded-3xl font-black border-2 border-primary-100 flex items-center justify-center gap-3 hover:bg-primary-100 transition-all">
                   <DownloadIcon className="w-6 h-6" />
                   تحميل النموذج الفارغ
                 </button>
                 
                 <div className="flex flex-col gap-2">
                   <label className="text-xs font-black text-slate-400 uppercase px-1">اختر القسم المستهدف</label>
                   <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary-500/10" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                     <option value="">-- {t('select_class')} --</option>
                     {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>

                 <label className={`cursor-pointer bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-12 flex flex-col items-center justify-center transition-all hover:bg-emerald-50 hover:border-emerald-200 ${!selectedClass ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}>
                   <ArrowUpTrayIcon className="w-12 h-12 text-emerald-500 mb-4" />
                   <span className="font-black text-slate-600">اختر ملف Excel من جهازك</span>
                   <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} disabled={!selectedClass} />
                 </label>
              </div>
           </div>
        </div>
      )}

      {/* Modal: كشف النقاط التفصيلي */}
      {showReportModal && viewingStudent && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-[48px] shadow-soft-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[28px] bg-primary-600 text-white flex items-center justify-center text-4xl font-black shadow-lg shadow-primary-200">{viewingStudent.fullName.charAt(0)}</div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-800">{viewingStudent.fullName}</h3>
                    <div className="flex gap-4 mt-1">
                       <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('class')}: {getClassName(viewingStudent.classId)}</span>
                       <span className="text-primary-500 font-bold text-xs uppercase tracking-widest">المعدل العام: {calculateGeneralAverage(viewingStudent.id, viewingStudent.classId)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowReportModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><XMarkIcon className="w-8 h-8" /></button>
              </div>
              
              <div className="px-10 pt-8 flex gap-4 overflow-x-auto pb-2">
                {[1, 2, 3].map(num => (
                  <button key={num} onClick={() => setReportSemester(num as 1 | 2 | 3)} className={`px-10 py-4 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${reportSemester === num ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {t(`semester_${num}` as any)}
                  </button>
                ))}
              </div>

              <div className="p-10 space-y-6">
                <div className="overflow-hidden border border-slate-100 rounded-[32px] shadow-sm">
                  <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} border-collapse`}>
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="py-5 px-8 text-slate-500 font-black text-xs uppercase tracking-wider">{t('subject')}</th>
                        <th className="py-5 px-8 text-center text-slate-500 font-black text-xs uppercase tracking-wider">{t('test')}</th>
                        <th className="py-5 px-8 text-center text-slate-500 font-black text-xs uppercase tracking-wider">{t('exam')}</th>
                        <th className="py-5 px-8 text-center text-slate-500 font-black text-xs uppercase tracking-wider">{t('total_points')}</th>
                        <th className="py-5 px-8 text-center text-slate-500 font-black text-xs uppercase tracking-wider">{t('average')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                       {/* Fix: Using level-based filtering to ensure consistency with the new subject model */}
                       {subjects.filter(s => s.level === classes.find(c => c.id === viewingStudent.classId)?.level).map(subject => {
                         const testRes = results.find(r => r.studentId === viewingStudent.id && r.subjectId === subject.id && r.semester === reportSemester && r.type === 'test');
                         const examRes = results.find(r => r.studentId === viewingStudent.id && r.subjectId === subject.id && r.semester === reportSemester && r.type === 'exam');
                         
                         let subjAvg = '--';
                         if (testRes && examRes) subjAvg = ((testRes.score + examRes.score) / 2).toFixed(2);
                         else if (testRes || examRes) subjAvg = (testRes || examRes)!.score.toFixed(2);

                         return (
                           <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="py-5 px-8 font-bold text-slate-700">{getSubjectDisplayName(subject, language)}</td>
                             <td className="py-5 px-8 text-center font-black text-primary-600">{testRes ? testRes.score : '--'}</td>
                             <td className="py-5 px-8 text-center font-black text-orange-500">{examRes ? examRes.score : '--'}</td>
                             <td className="py-5 px-8 text-center text-slate-400 font-bold">{subject.totalPoints}</td>
                             <td className="py-5 px-8 text-center font-black text-slate-900 bg-slate-50/30">{subjAvg}</td>
                           </tr>
                         );
                       })}
                    </tbody>
                  </table>
                </div>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default Students;