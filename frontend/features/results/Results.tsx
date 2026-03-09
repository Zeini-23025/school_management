import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DocumentCheckIcon, ArrowDownOnSquareIcon, MagnifyingGlassIcon, InformationCircleIcon, ChevronDownIcon, PlusCircleIcon, ArrowUpTrayIcon, PrinterIcon, TableCellsIcon, ArrowDownTrayIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { Result, Classroom, getSubjectDisplayName } from '../../types';
import { useSchoolContext } from '../../context/SchoolContext';
import Input from '../../components/Input';
import * as XLSX from 'xlsx';

interface ResultEntry {
  studentId: string;
  score: string;
  comment?: string;
}

const Results: React.FC = () => {
  const { students, classes, subjects, results, saveResults, fetchData, t, language, notify, currentUser } = useSchoolContext();
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  // En fondamental : uniquement Examen. Admin et Enseignant ne voient pas le choix Test/Examen.
  const examOnly = isTeacher || isAdmin;

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<1 | 2 | 3>(1);
  const [evaluationType, setEvaluationType] = useState<'test' | 'exam'>(examOnly ? 'exam' : 'test');
  const [searchTerm, setSearchTerm] = useState('');
  const [marks, setMarks] = useState<ResultEntry[]>([]);
  const isUserEditingRef = useRef(false); // Track if user is actively editing

  // Get current class object
  const currentClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Get subjects for the current class level
  const levelSubjects = useMemo(() => {
    if (!currentClass) return [];
    return subjects.filter(s => s.level === currentClass.level).sort((a, b) => a.name.localeCompare(b.name));
  }, [currentClass, subjects]);

  // Get students for the current class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter(s => s.classId === selectedClassId).sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [students, selectedClassId]);

  // Create a Map for O(1) lookup of results (toutes les notes: en attente, approuvées, refusées)
  const resultsMap = useMemo(() => {
    const map = new Map<string, Result>();
    results.forEach(result => {
      const key = `${String(result.studentId)}-${String(result.subjectId)}-${result.semester}-${result.type}`;
      map.set(key, result);
    });
    return map;
  }, [results]);

  // Create a Map for O(1) lookup of marks by studentId
  const marksMap = useMemo(() => {
    const map = new Map<string, string>();
    marks.forEach(mark => {
      map.set(mark.studentId, mark.score);
    });
    return map;
  }, [marks]);

  // Create a Map for comments by studentId
  const commentsMap = useMemo(() => {
    const map = new Map<string, string>();
    marks.forEach(mark => {
      if (mark.comment) {
        map.set(mark.studentId, mark.comment);
      }
    });
    return map;
  }, [marks]);

  // Enseignant et Admin : uniquement Examen (pas de choix Test/Examen en fondamental)
  useEffect(() => {
    if (examOnly) setEvaluationType('exam');
  }, [examOnly]);

  // Rafraîchir les données à l’ouverture de la page (pour afficher les notes approuvées par l’admin)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    isUserEditingRef.current = false;
    fetchData();
    notify(t('data_refreshed') || 'تم تحديث البيانات', 'success');
  }, [fetchData, notify, t]);

  // Initialize: Set first class when classes are loaded
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // When class changes: Reset subject and update marks
  useEffect(() => {
    if (!selectedClassId || levelSubjects.length === 0) {
      setSelectedSubjectId('');
      setMarks([]);
      return;
    }

    // Check if current subject is still valid for new class
    const isCurrentSubjectValid = levelSubjects.some(s => s.id === selectedSubjectId);
    
    if (!isCurrentSubjectValid) {
      // Set first subject for the new class
      const firstSubject = levelSubjects[0];
      if (firstSubject) {
        setSelectedSubjectId(firstSubject.id);
      } else {
        setSelectedSubjectId('');
        setMarks([]);
      }
    }
  }, [selectedClassId, levelSubjects, selectedSubjectId]);

  // When subject, semester, or evaluation type changes: Update marks
  useEffect(() => {
    console.log('🟢 useEffect triggered - Loading marks from results:', {
      selectedClassId,
      selectedSubjectId,
      classStudentsLength: classStudents.length,
      resultsMapSize: resultsMap.size,
      isUserEditing: isUserEditingRef.current
    });
    
    // Don't reload if user is actively editing
    if (isUserEditingRef.current) {
      console.log('⏸️ User is editing, skipping reload');
      return;
    }
    
    if (!selectedClassId || !selectedSubjectId || classStudents.length === 0) {
      console.log('⚠️ Conditions not met, clearing marks');
      setMarks([]);
      return;
    }

    const newMarks: ResultEntry[] = classStudents.map(student => {
      const key = `${String(student.id)}-${String(selectedSubjectId)}-${selectedSemester}-${evaluationType}`;
      const existingResult = resultsMap.get(key);
      const score = existingResult ? existingResult.score.toString() : '';
      console.log(`📋 Student ${student.id}:`, { key, existingResult: existingResult ? { score: existingResult.score } : null, finalScore: score });
      return {
        studentId: student.id,
        score: score,
        comment: existingResult?.comment || ''
      };
    });

    console.log('📝 Setting marks from results:', newMarks);
    setMarks(newMarks);
  }, [selectedClassId, selectedSubjectId, selectedSemester, evaluationType, classStudents, resultsMap]);

  // Filter students by search term
  const filteredClassStudents = useMemo(() => {
    if (!searchTerm.trim()) return classStudents;
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return classStudents.filter(s => 
      s.fullName.toLowerCase().includes(lowerSearchTerm)
    );
  }, [classStudents, searchTerm]);

  // Handle class change
  const handleClassChange = useCallback((newClassId: string) => {
    setSelectedClassId(newClassId);
    setSearchTerm(''); // Reset search when class changes
  }, []);

  // Handle subject change
  const handleSubjectChange = useCallback((newSubjectId: string) => {
    setSelectedSubjectId(newSubjectId);
  }, []);

  // Handle score change
  const handleScoreChange = useCallback((studentId: string, val: string) => {
    console.log('🔵 [features/results] handleScoreChange called:', { studentId, val, selectedSubjectId });
    
    if (val === '' || val === '-') {
      // Allow empty value
      setMarks(prev => {
        const existing = prev.find(p => p.studentId === studentId);
        if (existing) {
          return prev.map(p => p.studentId === studentId ? { ...p, score: '' } : p);
        }
        return prev;
      });
      return;
    }
    
    const num = parseFloat(val);
    if (isNaN(num)) {
      console.log('❌ [features/results] Invalid number:', val);
      return; // Invalid number
    }
    
    // Get the selected subject's totalPoints - use subjects directly to ensure we find it
    const selectedSubject = selectedSubjectId 
      ? subjects.find(s => String(s.id) === String(selectedSubjectId))
      : null;
    const maxPoints = selectedSubject?.totalPoints || 20;
    
    console.log('📊 [features/results] Subject Info:', {
      selectedSubjectId,
      selectedSubject: selectedSubject ? { id: selectedSubject.id, name: selectedSubject.name, totalPoints: selectedSubject.totalPoints } : null,
      maxPoints,
      allSubjects: subjects.map(s => ({ id: s.id, name: s.name, totalPoints: s.totalPoints }))
    });
    
    // Debug: log to console (can be removed later)
    if (selectedSubjectId && !selectedSubject) {
      console.warn('⚠️ [features/results] Subject not found:', selectedSubjectId, 'Available subjects:', subjects.map(s => ({ id: s.id, name: s.name, totalPoints: s.totalPoints })));
    }
    
    // Allow values between 0 and maxPoints (inclusive)
    if (num < 0) {
      console.log('❌ [features/results] Value < 0:', num);
      return;
    }
    if (num > maxPoints) {
      console.log('❌ [features/results] Value > maxPoints:', { num, maxPoints, willReject: true });
      // Don't allow values exceeding maxPoints - just return without updating
      return;
    }
    
    console.log('✅ [features/results] Value accepted, updating marks:', { num, maxPoints });
    
    // Mark that user is editing
    isUserEditingRef.current = true;
    
    setMarks(prev => {
      const existing = prev.find(p => p.studentId === studentId);
      if (existing) {
        const updated = prev.map(p => p.studentId === studentId ? { ...p, score: val } : p);
        console.log('📝 [features/results] Updated marks:', updated);
        return updated;
      }
      const newMarks = [...prev, { studentId, score: val, comment: '' }];
      console.log('📝 [features/results] Added new mark:', newMarks);
      return newMarks;
    });
    
    // Reset editing flag after a short delay
    setTimeout(() => {
      isUserEditingRef.current = false;
      console.log('🔄 Reset editing flag');
    }, 1000);
  }, [selectedSubjectId, subjects]);

  // Handle comment change
  const handleCommentChange = useCallback((studentId: string, comment: string) => {
    setMarks(prev => {
      const existing = prev.find(p => p.studentId === studentId);
      if (existing) {
        return prev.map(p => p.studentId === studentId ? { ...p, comment } : p);
      }
      return [...prev, { studentId, score: '', comment }];
    });
  }, []);

  // Handle save individual result
  const handleSaveIndividualResult = useCallback(async (studentId: string) => {
    if (!selectedSubjectId) {
      notify(t('fill_all_fields'), 'error');
      return;
    }

    const studentMark = marks.find(m => m.studentId === studentId);
    if (!studentMark || studentMark.score === '' || studentMark.score.trim() === '') {
      notify(t('enter_score_first'), 'error');
      return;
    }

    const student = students.find(s => s.id === studentId);
    const subject = subjects.find(s => s.id === selectedSubjectId);
    
    const newResult: Result = {
      studentId: studentId,
      subjectId: selectedSubjectId,
      score: parseFloat(studentMark.score),
      semester: selectedSemester,
      type: evaluationType,
      comment: studentMark.comment || undefined
    };

    const activityMessage = `تم حفظ علامة ${student?.fullName || 'طالب'} في مادة ${subject?.name || 'مادة'} (${evaluationType === 'test' ? 'اختبار' : 'امتحان'})`;

    try {
      await saveResults([newResult], activityMessage);
      notify(t('result_saved_successfully'), 'success');
    } catch (error) {
      console.error('Error saving individual result:', error);
      notify(t('error_saving_result'), 'error');
    }
  }, [marks, selectedSubjectId, selectedSemester, evaluationType, saveResults, notify, t, students, subjects]);

  // Handle save results
  const handleSaveResults = useCallback(async () => {
    if (!selectedSubjectId) {
      notify(t('fill_all_fields'), 'error');
      return;
    }

    const newResults: Result[] = marks
      .filter(m => m.score !== '' && m.score.trim() !== '')
      .map(m => {
        const key = `${String(m.studentId)}-${String(selectedSubjectId)}-${selectedSemester}-${evaluationType}`;
        const existing = resultsMap.get(key);
        const isAdmin = currentUser?.role === 'admin';
        return {
          studentId: m.studentId,
          subjectId: selectedSubjectId,
          score: parseFloat(m.score),
          semester: selectedSemester,
          type: evaluationType,
          comment: m.comment || undefined,
          status: (isAdmin && existing?.status === 'approved') ? 'approved' : (existing?.status || 'pending')
        };
      });

    if (newResults.length === 0) {
      notify(t('enter_one_score_min'), 'info');
      return;
    }

    try {
      await saveResults(newResults);
      // Marks will be updated automatically via useEffect when results change
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }, [marks, selectedSubjectId, selectedSemester, evaluationType, saveResults, notify, t, resultsMap, currentUser]);

  const currentSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  // Handle Excel Download Template
  const handleDownloadTemplate = useCallback((type: 'single' | 'all', withRandomData: boolean = false) => {
    if (!selectedClassId) {
      notify(t('select_class_first'), 'error');
      return;
    }

    const selectedId = String(selectedClassId);
    const currentClass = classes.find(c => String(c.id) === selectedId);
    const studentsInClass = classStudents;

    if (studentsInClass.length === 0) {
      notify(t('no_students_in_class'), 'error');
      return;
    }

    if (type === 'single' && !selectedSubjectId) {
      notify(t('select_subject_first'), 'error');
      return;
    }

    if (type === 'all' && levelSubjects.length === 0) {
      notify(t('no_subjects_for_level'), 'error');
      return;
    }

    // Prepare Data (NNI au lieu de id)
    const data = studentsInClass.map(s => {
      const row: any = {
        'NNI': s.nni ?? '',
        'اسم_التلميذ': s.fullName,
      };

      if (type === 'single') {
        const currentSubject = subjects.find(sub => String(sub.id) === String(selectedSubjectId));
        if (!currentSubject) return row;
        
        let scoreVal = '';
        if (withRandomData) {
          scoreVal = (Math.random() * (19 - 8) + 8).toFixed(1);
        } else {
          const existing = results.find(
            r => String(r.studentId) === String(s.id) && 
                 String(r.subjectId) === String(selectedSubjectId) && 
                 r.semester === selectedSemester && 
                 r.type === evaluationType
          );
          scoreVal = existing ? existing.score.toString() : '';
        }
        row['النقطة'] = scoreVal;
      } else {
        levelSubjects.forEach(subj => {
          let scoreVal = '';
          if (withRandomData) {
            scoreVal = (Math.random() * (19 - 8) + 8).toFixed(1);
          } else {
            const examRes = results.find(
              r => String(r.studentId) === String(s.id) && 
                   String(r.subjectId) === String(subj.id) && 
                   r.semester === selectedSemester && 
                   r.type === 'exam'
            );
            const testRes = results.find(
              r => String(r.studentId) === String(s.id) && 
                   String(r.subjectId) === String(subj.id) && 
                   r.semester === selectedSemester && 
                   r.type === 'test'
            );
            scoreVal = examRes ? examRes.score.toString() : (testRes ? testRes.score.toString() : '');
          }
          row[subj.name] = scoreVal;
        });
      }

      return row;
    });

    // Generate Worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths (NNI: 10 chiffres, nom: 30)
    const wscols = [{ wch: 12 }, { wch: 30 }];
    if (type === 'single') {
      wscols.push({ wch: 10 });
    } else {
      levelSubjects.forEach(() => wscols.push({ wch: 15 }));
    }
    ws['!cols'] = wscols;

    // Generate Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "النقاط");

    // Save File
    const prefix = withRandomData ? 'تجريبي_' : 'كشف_';
    const typeStr = type === 'all' ? 'شامل_' : `${subjects.find(s => String(s.id) === String(selectedSubjectId))?.name}_`;
    const fileName = `${prefix}${currentClass?.name}_${typeStr}ف${selectedSemester}.xlsx`.replace(/\s+/g, '_');
    XLSX.writeFile(wb, fileName);
    notify(t('file_loaded_success'), 'success');
  }, [selectedClassId, selectedSubjectId, selectedSemester, evaluationType, classes, classStudents, levelSubjects, subjects, results, notify]);

  // Handle Excel File Upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const newResultsToSave: Result[] = [];
      let updatedStudentsCount = 0;

      const invalidStudents: string[] = []; // تلاميذ غير موجودين في القسم

      data.forEach(row => {
        const nniVal = (row['NNI'] ?? row['رقم_التعريف'])?.toString()?.trim();
        const studentName = row['اسم_التلميذ']?.toString();
        
        if (!nniVal) return;

        // Trouver l'élève par NNI ou par id (rétrocompatibilité)
        const student = classStudents.find(s => (s.nni && String(s.nni) === nniVal) || String(s.id) === nniVal);
        if (!student) {
          const name = studentName || 'غير معروف';
          invalidStudents.push(`${name} (NNI: ${nniVal})`);
          return;
        }
        const studentId = student.id;

        // التحقق 2 (اختياري): التحقق من تطابق الاسم (تحذير فقط)
        if (studentName && student.fullName !== studentName) {
          console.warn(`تحذير: اسم التلميذ لا يطابق تماماً - ID: ${studentId}, Excel: ${studentName}, DB: ${student.fullName}`);
          // نستخدم ID فقط (أكثر دقة)
        }

        let hasUpdate = false;

        // Check for 'النقطة' (Single Subject Mode)
        if (row['النقطة'] !== undefined && selectedSubjectId) {
          const val = parseFloat(row['النقطة']);
          const selectedSubject = subjects.find(s => String(s.id) === String(selectedSubjectId));
          const maxPoints = selectedSubject?.totalPoints || 20;
          if (!isNaN(val) && val >= 0 && val <= maxPoints) {
            newResultsToSave.push({
              studentId: String(studentId),
              subjectId: String(selectedSubjectId),
              score: val,
              semester: selectedSemester,
              type: evaluationType
            });
            hasUpdate = true;
          }
        }

        // Check for specific subject names (All Subjects Mode)
        levelSubjects.forEach(subj => {
          if (row[subj.name] !== undefined) {
            const val = parseFloat(row[subj.name]);
            if (!isNaN(val) && val >= 0 && val <= subj.totalPoints) {
              newResultsToSave.push({
                studentId: String(studentId),
                subjectId: String(subj.id),
                score: val,
                semester: selectedSemester,
                type: evaluationType
              });
              hasUpdate = true;
            }
          }
        });

        if (hasUpdate) updatedStudentsCount++;
      });

      if (newResultsToSave.length > 0) {
        saveResults(newResultsToSave);
        let message = `تم استيراد النقاط بنجاح لـ ${updatedStudentsCount} تلميذ`;
        if (invalidStudents.length > 0) {
          message += `\n\n⚠️ تم تجاهل ${invalidStudents.length} تلميذ (غير موجودين في القسم المحدد):\n${invalidStudents.slice(0, 5).join('\n')}${invalidStudents.length > 5 ? '\n...' : ''}`;
        }
        notify(message, invalidStudents.length > 0 ? 'info' : 'success');
      } else {
        let errorMessage = 'لم يتم العثور على أعمدة نقاط صالحة في الملف';
        if (invalidStudents.length > 0) {
          errorMessage += `\n\n⚠️ التلاميذ التالية غير موجودين في القسم المحدد:\n${invalidStudents.slice(0, 5).join('\n')}${invalidStudents.length > 5 ? '\n...' : ''}`;
        }
        notify(errorMessage, 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  }, [selectedSubjectId, selectedSemester, evaluationType, levelSubjects, saveResults, notify, classStudents, subjects]);

  // Handle Print Reports
  const handlePrint = useCallback(() => {
    if (!selectedClassId) {
      notify('يرجى اختيار القسم أولاً', 'error');
      return;
    }

    const selectedId = String(selectedClassId);
    const selectedClass = classes.find(c => String(c.id) === selectedId);
    const studentsInClass = classStudents;
    
    if (studentsInClass.length === 0) {
      notify('لا يوجد تلاميذ في هذا القسم', 'error');
      return;
    }

    if (levelSubjects.length === 0) {
      notify('لا توجد مواد لهذا المستوى', 'error');
      return;
    }

    // Calculate Averages and Ranks
    const studentPerformance = studentsInClass.map(student => {
      const studentIdStr = String(student.id);
      let normalizedScores: number[] = [];
      let totalScore = 0;
      levelSubjects.forEach(subj => {
        const subjIdStr = String(subj.id);
        const testRes = results.find(
          r => String(r.studentId) === studentIdStr && 
               String(r.subjectId) === subjIdStr && 
               r.semester === selectedSemester &&
               r.type === 'test'
        );
        const examRes = results.find(
          r => String(r.studentId) === studentIdStr && 
               String(r.subjectId) === subjIdStr && 
               r.semester === selectedSemester &&
               r.type === 'exam'
        );
        
        let subjScore = null;
        if (testRes && examRes) {
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
      const average = normalizedScores.length > 0 ? totalScore / normalizedScores.length : 0;
      return { studentId: student.id, average };
    });

    studentPerformance.sort((a, b) => b.average - a.average);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const semesterName = selectedSemester === 1 ? 'الأول' : selectedSemester === 2 ? 'الثاني' : 'الثالث';
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <title>كشوف النقاط - ${selectedClass?.name} - الفصل ${semesterName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body { font-family: 'Cairo', sans-serif; padding: 20px; -webkit-print-color-adjust: exact; }
          .report-card { border: 2px solid #000; padding: 20px; margin-bottom: 40px; page-break-after: always; height: 95vh; box-sizing: border-box; position: relative; }
          .report-card:last-child { page-break-after: auto; }
          .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
          .header-right { text-align: center; width: 30%; }
          .header-center { text-align: center; width: 40%; align-self: center; }
          .header-left { text-align: center; width: 30%; }
          .seal-img { width: 80px; height: auto; margin-top: 5px; }
          .student-info { margin-bottom: 20px; display: flex; justify-content: space-between; border: 1px solid #ddd; padding: 10px; border-radius: 8px; background: #f9fafb; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 14px; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .footer { margin-top: 20px; display: flex; justify-content: space-between; font-weight: bold; }
          .status-box { border: 2px solid #000; padding: 10px 20px; border-radius: 8px; text-align: center; min-width: 150px; }
          .signatures { margin-top: 60px; display: flex; justify-content: space-around; }
          @media print {
            .report-card { page-break-after: always; }
            .report-card:last-child { page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        ${studentsInClass.map(student => {
          let normalizedScores: number[] = [];
          let totalScore = 0;
          
          const subjectRows = levelSubjects.map(subj => {
            const testRes = results.find(
              r => String(r.studentId) === String(student.id) && 
                   String(r.subjectId) === String(subj.id) && 
                   r.semester === selectedSemester &&
                   r.type === 'test'
            );
            const examRes = results.find(
              r => String(r.studentId) === String(student.id) && 
                   String(r.subjectId) === String(subj.id) && 
                   r.semester === selectedSemester &&
                   r.type === 'exam'
            );
            
            let subjScore = null;
            if (testRes && examRes) {
              subjScore = (testRes.score + examRes.score) / 2;
            } else if (examRes) {
              subjScore = examRes.score;
            } else if (testRes) {
              subjScore = testRes.score;
            }
            
            // Convert score to normalized scale (out of 20) based on totalPoints
            let normalizedScore = null;
            if (subjScore !== null && subj.totalPoints > 0) {
              normalizedScore = (subjScore / subj.totalPoints) * 20;
              normalizedScores.push(normalizedScore);
              totalScore += normalizedScore;
            }
            
            const scoreDisplay = examRes && testRes 
              ? `اختبار: ${testRes.score} / امتحان: ${examRes.score}`
              : (subjScore !== null ? `${subjScore.toFixed(2)} / ${subj.totalPoints}` : '-');
            
            return `
              <tr>
                <td style="text-align: right; padding-right: 15px;">${getSubjectDisplayName(subj, language)}</td>
                <td>${subj.totalPoints}</td>
                <td style="font-weight: bold;">${scoreDisplay}</td>
                <td style="font-weight: bold;">${normalizedScore !== null ? normalizedScore.toFixed(2) : '-'}</td>
              </tr>
            `;
          }).join('');
          
          const average = normalizedScores.length > 0 ? (totalScore / normalizedScores.length).toFixed(2) : '0.00';
          const avgNum = parseFloat(average);
          const isPassing = avgNum >= 10;
          const rankIndex = studentPerformance.findIndex(p => String(p.studentId) === String(student.id));
          const rank = rankIndex !== -1 ? rankIndex + 1 : '-';

          return `
            <div class="report-card">
              <div class="header-container">
                <div class="header-right">
                  <h4 style="margin:0; font-weight:bold;">الجمهورية الإسلامية الموريتانية</h4>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Seal_of_Mauritania.svg/200px-Seal_of_Mauritania.svg.png" class="seal-img" alt="شعار الدولة" />
                </div>
                <div class="header-center">
                  <h1 style="margin:0; font-size: 24px;">كشف نقاط الفصل ${semesterName}</h1>
                  <p style="margin:5px 0 0 0;">السنة الدراسية: ${currentYear} / ${nextYear}</p>
                </div>
                <div class="header-left">
                  <h4 style="margin:0; font-weight:bold;">شرف - إخاء - عدل</h4>
                  <h5 style="margin:10px 0 0 0; font-weight:bold;">وزارة التعليم العالي<br/>والبحث العلمي</h5>
                </div>
              </div>
              <div class="student-info">
                <div style="text-align: right;">
                   <p style="margin: 5px 0;"><strong>الاسم واللقب:</strong> ${student.fullName}</p>
                   <p style="margin: 5px 0;"><strong>تاريخ الميلاد:</strong> ${student.birthDate}</p>
                </div>
                <div style="text-align: left;">
                   <p style="margin: 5px 0;"><strong>القسم:</strong> ${selectedClass?.name || ''}</p>
                   <p style="margin: 5px 0;"><strong>الرقم التعريفي:</strong> ${student.id}</p>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 40%;">المادة</th>
                    <th style="width: 15%;">المعامل</th>
                    <th style="width: 20%;">النقطة / 20</th>
                    <th style="width: 25%;">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  ${subjectRows}
                </tbody>
                <tfoot>
                  <tr style="background-color: #f3f4f6;">
                    <th colspan="3" style="text-align: left; padding-left: 20px;">المجموع العام</th>
                    <th>${totalScore.toFixed(2)}</th>
                  </tr>
                </tfoot>
              </table>
              <div class="footer">
                <div class="status-box">
                  <div>المعدل الفصلي</div>
                  <div style="font-size: 1.5em; color: ${isPassing ? 'green' : 'red'}; margin-top: 5px;">${average} / 20</div>
                </div>
                <div class="status-box">
                  <div>القرار</div>
                  <div style="font-size: 1.2em; margin-top: 5px;">${isPassing ? 'ناجح' : 'راسب'}</div>
                </div>
                <div class="status-box">
                  <div>الرتبة</div>
                  <div style="font-size: 1.5em; margin-top: 5px;">${rank}</div>
                </div>
              </div>
              <div class="signatures">
                 <div><strong>توقيع الولي:</strong></div>
                 <div><strong>توقيع وختم المدير:</strong></div>
              </div>
            </div>
          `;
        }).join('')}
        <script>
          window.onload = () => { setTimeout(() => window.print(), 500); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, [selectedClassId, selectedSemester, classes, classStudents, levelSubjects, subjects, results, notify]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
              <DocumentCheckIcon className="w-8 h-8" />
            </div>
            {t('results_management')}
          </h2>
          <p className="text-slate-500 font-medium mt-1">رصد درجات التلاميذ حسب المواد المعتمدة للمستوى الدراسي</p>
          {isAdmin && (
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mt-3 text-sm font-medium inline-flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('results_confirm_hint')}{' '}
              <a href="#/approve-results" className="font-bold text-primary-600 hover:underline">{t('results_confirm_link')}</a>
            </p>
          )}
        </div>
        
        {/* Action Buttons - Top Right */}
        <div className="flex flex-wrap gap-3 items-center">
          <button 
            onClick={() => handleDownloadTemplate('all', false)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
            disabled={!selectedClassId || levelSubjects.length === 0}
            title="تحميل نموذج Excel"
          >
            <TableCellsIcon className="w-4 h-4" />
            <span>تحميل Excel</span>
          </button>
          <label className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-md cursor-pointer text-sm font-bold">
            <ArrowUpTrayIcon className="w-4 h-4" />
            <span>رفع Excel</span>
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
            disabled={!selectedClassId || classStudents.length === 0}
            title="طباعة كشوف النقاط"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>طباعة</span>
          </button>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner w-full md:w-auto">
          {examOnly ? (
            <span className="px-8 py-3 rounded-xl text-sm font-black bg-white text-orange-600 shadow-soft">
              {t('exam')}
            </span>
          ) : (
            <>
              <button 
                onClick={() => setEvaluationType('test')} 
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-black transition-all ${
                  evaluationType === 'test' 
                    ? 'bg-white text-primary-600 shadow-soft' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('test')}
              </button>
              <button 
                onClick={() => setEvaluationType('exam')} 
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-black transition-all ${
                  evaluationType === 'exam' 
                    ? 'bg-white text-orange-600 shadow-soft' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('exam')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-soft border border-slate-100 space-y-6 sticky top-24">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b border-slate-50 pb-4">
              إعدادات الرصد
            </h4>
             
            <div className="space-y-4">
              {/* Class Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {t('class')}
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold outline-none appearance-none cursor-pointer transition-all" 
                    value={selectedClassId} 
                    onChange={(e) => handleClassChange(e.target.value)}
                  >
                    {classes.length === 0 ? (
                      <option value="">لا توجد أقسام</option>
                    ) : (
                      classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDownIcon className="absolute left-4 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Semester Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {t('semester')}
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold outline-none appearance-none cursor-pointer transition-all" 
                    value={selectedSemester} 
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value) as 1 | 2 | 3)}
                  >
                    <option value={1}>{t('semester_1')}</option>
                    <option value={2}>{t('semester_2')}</option>
                    <option value={3}>{t('semester_3')}</option>
                  </select>
                  <ChevronDownIcon className="absolute left-4 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Subject Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {t('subject')}
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold outline-none appearance-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                    value={selectedSubjectId} 
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    disabled={!selectedClassId || levelSubjects.length === 0}
                  >
                    {!selectedClassId ? (
                      <option value="">اختر القسم أولاً</option>
                    ) : levelSubjects.length === 0 ? (
                      <option value="">لا توجد مواد لهذا المستوى</option>
                    ) : (
                      levelSubjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {getSubjectDisplayName(s, language)} ({t('total_points')} {s.totalPoints})
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDownIcon className="absolute left-4 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-all"
                title={t('refresh_data') || 'Rafraîchir pour afficher les notes approuvées'}
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>{t('refresh_data') || 'Rafraîchir'}</span>
              </button>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-3">
              <InformationCircleIcon className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-primary-700 leading-relaxed font-bold">
                المواد المعروضة مرتبطة بالمستوى الدراسي للفوج. أي مادة تضيفها في المستوى ستظهر لجميع أفواج السنة .
              </p>
            </div>

            {/* Current Selection Info */}
            {currentClass && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  المعلومات الحالية
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-700 font-bold">
                    <span className="text-slate-400">القسم:</span> {currentClass.name}
                  </p>
                  <p className="text-slate-700 font-bold">
                    <span className="text-slate-400">المستوى:</span> {currentClass.level}
                  </p>
                  <p className="text-slate-700 font-bold">
                    <span className="text-slate-400">عدد التلاميذ:</span> {classStudents.length}
                  </p>
                  <p className="text-slate-700 font-bold">
                    <span className="text-slate-400">عدد المواد:</span> {levelSubjects.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Scores Table */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
              <div className="relative w-full md:w-80">
                <Input 
                  label="" 
                  placeholder="بحث عن تلميذ..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <MagnifyingGlassIcon className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-3 w-5 h-5 text-slate-300`} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
                  العدد: {filteredClassStudents.length} تلميذ
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-20 text-center">
                      #
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      {t('student')}
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">
                      العلامة
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">
                      الحالة
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                      ملاحظة
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredClassStudents.length > 0 ? (
                    filteredClassStudents.map((student, idx) => {
                      const score = marksMap.get(student.id) || '';
                      const comment = commentsMap.get(student.id) || '';
                      const numScore = parseFloat(score);
                      const isPassing = !isNaN(numScore) && numScore >= 10;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-all group">
                          <td className="px-8 py-4 text-slate-400 font-bold text-center text-sm">
                            {idx + 1}
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                                {student.fullName}
                              </span>
                              <span className="text-[10px] text-slate-300 font-medium">
                                UID: {student.id}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="relative max-w-[140px] mx-auto">
                              <div className="flex items-center gap-1">
                                {(() => {
                                  const selectedSubject = selectedSubjectId 
                                    ? subjects.find(s => String(s.id) === String(selectedSubjectId))
                                    : null;
                                  const totalPoints = selectedSubject?.totalPoints || 20;
                                  return (
                                    <>
                                      <input 
                                        type="number" 
                                        min="0" 
                                        max={totalPoints} 
                                        step="0.25" 
                                        placeholder="--" 
                                        value={score} 
                                        onChange={(e) => handleScoreChange(student.id, e.target.value)} 
                                        className={`flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-center font-black transition-all focus:ring-4 focus:outline-none text-lg shadow-inner ${
                                          evaluationType === 'test' 
                                            ? 'focus:ring-primary-500/10 focus:border-primary-500' 
                                            : 'focus:ring-orange-500/10 focus:border-orange-500'
                                        }`} 
                                      />
                                      <span className="text-slate-500 font-bold text-sm whitespace-nowrap">
                                        /{totalPoints}
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-center">
                            {(() => {
                              // البحث عن حالة النتيجة
                              const resultKey = `${String(student.id)}-${String(selectedSubjectId)}-${selectedSemester}-${evaluationType}`;
                              const existingResult = resultsMap.get(resultKey);
                              const resultStatus = existingResult?.status || (score !== '' ? 'pending' : null);
                              
                              if (!resultStatus) {
                                return (
                                  <span className="text-slate-300 text-xs font-bold italic">
                                    لا توجد
                                  </span>
                                );
                              }
                              
                              if (resultStatus === 'approved') {
                                return (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    موافق
                                  </span>
                                );
                              } else if (resultStatus === 'rejected') {
                                return (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                    <XCircleIcon className="w-3 h-3" />
                                    مرفوض
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                    <ClockIcon className="w-3 h-3" />
                                    قيد المراجعة
                                  </span>
                                );
                              }
                            })()}
                          </td>
                          <td className="px-8 py-4">
                            <input
                              type="text"
                              placeholder="ملاحظة..."
                              value={comment}
                              onChange={(e) => handleCommentChange(student.id, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                          </td>
                          <td className="px-8 py-4 text-center">
                            <button
                              onClick={() => handleSaveIndividualResult(student.id)}
                              disabled={!score || score.trim() === ''}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                                evaluationType === 'test'
                                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary-200'
                                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
                              }`}
                            >
                              <CheckCircleIcon className="w-3 h-3" />
                              حفظ
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <MagnifyingGlassIcon className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold italic">
                          {!selectedClassId 
                            ? 'يرجى اختيار قسم أولاً' 
                            : classStudents.length === 0
                            ? 'لا يوجد تلاميذ في هذا القسم'
                            : 'لا توجد نتائج مطابقة للبحث'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-10 border-t border-slate-50 flex flex-col gap-6 bg-slate-50/20">
              {/* Save Button */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span>{currentSubject ? getSubjectDisplayName(currentSubject, language) : '---'}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                  <span>عدد النقاط: {currentSubject?.totalPoints || '--'}</span>
                </div>
                 
                <button 
                  onClick={handleSaveResults} 
                  disabled={!selectedSubjectId || filteredClassStudents.length === 0 || marks.length === 0} 
                  className={`group flex items-center justify-center gap-3 px-12 py-5 text-white rounded-[24px] font-black shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed ${
                    evaluationType === 'test' 
                      ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-200' 
                      : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                  }`}
                >
                  <PlusCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>تثبيت النقاط للفصل {selectedSemester}</span>
                </button>
              </div>

              {/* Additional Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-slate-200">
                <button 
                  onClick={() => handleDownloadTemplate('all', false)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  disabled={!selectedClassId || levelSubjects.length === 0}
                >
                  <TableCellsIcon className="w-5 h-5" />
                  <span>تحميل كشف Excel شامل</span>
                </button>
                <label className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-md cursor-pointer font-bold">
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  <span>رفع ملف Excel</span>
                  <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                </label>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  disabled={!selectedClassId || classStudents.length === 0}
                >
                  <PrinterIcon className="w-5 h-5" />
                  <span>طباعة كشوف النقاط ({selectedSemester === 1 ? 'الفصل 1' : selectedSemester === 2 ? 'الفصل 2' : 'الفصل 3'})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
