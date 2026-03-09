import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowDownOnSquareIcon, TableCellsIcon, ArrowUpTrayIcon, PrinterIcon, ArrowDownTrayIcon, SparklesIcon, Squares2X2Icon, Squares3X3Icon, ListBulletIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Result, getSubjectDisplayName } from '../types';
import { useSchoolContext } from '../context/SchoolContext';
import * as XLSX from 'xlsx';

interface ResultEntry {
  studentId: string;
  score: string;
}

const Results: React.FC = () => {
  const { students, classes, subjects, results, saveResults, currentUser, language } = useSchoolContext();

  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<1 | 2 | 3>(1);
  // Add evaluationType state to satisfy Result interface requirement
  const [evaluationType, setEvaluationType] = useState<'test' | 'exam'>('test');
  
  // Single Mode State
  const [marks, setMarks] = useState<ResultEntry[]>([]);
  const isUserEditingRef = useRef(false); // Track if user is actively editing
  
  // Grid Mode State: { studentId: { subjectId: score } }
  const [gridMarks, setGridMarks] = useState<Record<string, Record<string, string>>>({});

  // Get current class - useMemo for performance
  // FIXED: Convert both to string for comparison to handle int/string mismatch
  const currentClass = useMemo(() => {
    if (!selectedClassId) return null;
    const selectedId = String(selectedClassId);
    return classes.find(c => String(c.id) === selectedId) || null;
  }, [classes, selectedClassId]);
  
  // Get subjects for current class level - useMemo for performance
  const levelSubjects = useMemo(() => {
    if (!currentClass) return [];
    return subjects.filter(s => s.level === currentClass.level).sort((a, b) => a.name.localeCompare(b.name));
  }, [currentClass, subjects]);

  // Get students for current class - useMemo for performance
  // FIXED: Convert both to string for comparison to handle int/string mismatch
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedId = String(selectedClassId);
    return students
      .filter(s => String(s.classId) === selectedId)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [students, selectedClassId]);

  // Initialize selection when data is available
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      // Ensure id is string
      setSelectedClassId(String(classes[0].id));
    }
  }, [classes, selectedClassId]);

  // Reset subject when class changes - FIXED: proper dependency handling
  useEffect(() => {
    // If no class selected, clear everything
    if (!selectedClassId) {
      if (selectedSubjectId) setSelectedSubjectId('');
      setMarks([]);
      setGridMarks({});
      return;
    }

    // Wait for levelSubjects to be calculated
    if (!currentClass) {
      return; // Still loading
    }

    // If no subjects for this level, clear subject selection
    if (levelSubjects.length === 0) {
      if (selectedSubjectId) setSelectedSubjectId('');
      setMarks([]);
      setGridMarks({});
      return;
    }

    // Check if current subject is valid for new class
    // FIXED: Convert to string for comparison
    const selectedSubjectIdStr = selectedSubjectId ? String(selectedSubjectId) : '';
    const isCurrentSubjectValid = selectedSubjectIdStr && 
      levelSubjects.some(s => String(s.id) === selectedSubjectIdStr);
    
    // If current subject is not valid, set first subject
    if (!isCurrentSubjectValid && levelSubjects.length > 0) {
      setSelectedSubjectId(String(levelSubjects[0].id));
    }
  }, [selectedClassId, currentClass, levelSubjects, selectedSubjectId]);

  // Load existing results for SINGLE mode
  // FIXED: Convert IDs to strings for comparison
  useEffect(() => {
    console.log('🟢 [pages/Results] useEffect triggered - Loading marks from results:', {
      selectedClassId,
      selectedSubjectId,
      viewMode,
      classStudentsLength: classStudents.length,
      resultsLength: results.length,
      isUserEditing: isUserEditingRef.current
    });
    
    // Don't reload if user is actively editing
    if (isUserEditingRef.current) {
      console.log('⏸️ [pages/Results] User is editing, skipping reload');
      return;
    }
    
    if (selectedClassId && selectedSubjectId && viewMode === 'single' && classStudents.length > 0) {
      const subjectIdStr = String(selectedSubjectId);
      const newMarks = classStudents.map(student => {
        const studentIdStr = String(student.id);
        const existingResult = results.find(
          r => String(r.studentId) === studentIdStr && 
               String(r.subjectId) === subjectIdStr && 
               r.semester === selectedSemester &&
               r.type === evaluationType
        );
        const score = existingResult ? existingResult.score.toString() : '';
        console.log(`📋 [pages/Results] Student ${studentIdStr}:`, { existingResult: existingResult ? { score: existingResult.score } : null, finalScore: score });
        return {
          studentId: studentIdStr,
          score: score
        };
      });
      console.log('📝 [pages/Results] Setting marks from results:', newMarks);
      setMarks(newMarks);
    } else if (viewMode === 'single') {
      console.log('⚠️ [pages/Results] Conditions not met, clearing marks');
      setMarks([]);
    }
  }, [selectedClassId, selectedSubjectId, selectedSemester, evaluationType, classStudents, results, viewMode]);

  // Load existing results for GRID mode
  // FIXED: Convert IDs to strings for comparison
  useEffect(() => {
    if (selectedClassId && viewMode === 'grid' && classStudents.length > 0 && levelSubjects.length > 0) {
      const initialGrid: Record<string, Record<string, string>> = {};
      
      classStudents.forEach(s => {
        const studentIdStr = String(s.id);
        initialGrid[studentIdStr] = {};
        levelSubjects.forEach(subj => {
          const subjectIdStr = String(subj.id);
          const res = results.find(
            r => String(r.studentId) === studentIdStr && 
                 String(r.subjectId) === subjectIdStr && 
                 r.semester === selectedSemester && 
                 r.type === evaluationType
          );
          initialGrid[studentIdStr][subjectIdStr] = res ? res.score.toString() : '';
        });
      });
      setGridMarks(initialGrid);
    } else if (viewMode === 'grid') {
      setGridMarks({});
    }
  }, [selectedClassId, selectedSemester, evaluationType, classStudents, results, levelSubjects, viewMode]);

  // --- Handlers for Single Mode ---
  const handleScoreChange = (studentId: string, val: string) => {
    console.log('🔵 [pages/Results] handleScoreChange called:', { studentId, val, selectedSubjectId });
    
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
      console.log('❌ [pages/Results] Invalid number:', val);
      return; // Invalid number
    }
    
    // Get the selected subject's totalPoints - use subjects directly to ensure we find it
    const selectedSubject = selectedSubjectId 
      ? subjects.find(s => String(s.id) === String(selectedSubjectId))
      : null;
    const maxPoints = selectedSubject?.totalPoints || 20;
    
    console.log('📊 [pages/Results] Subject Info:', {
      selectedSubjectId,
      selectedSubject: selectedSubject ? { id: selectedSubject.id, name: selectedSubject.name, totalPoints: selectedSubject.totalPoints } : null,
      maxPoints,
      allSubjects: subjects.map(s => ({ id: s.id, name: s.name, totalPoints: s.totalPoints }))
    });
    
    // Debug: log to console (can be removed later)
    if (selectedSubjectId && !selectedSubject) {
      console.warn('⚠️ [pages/Results] Subject not found:', selectedSubjectId, 'Available subjects:', subjects.map(s => ({ id: s.id, name: s.name, totalPoints: s.totalPoints })));
    }
    
    // Allow values between 0 and maxPoints (inclusive)
    if (num < 0) {
      console.log('❌ [pages/Results] Value < 0:', num);
      return;
    }
    if (num > maxPoints) {
      console.log('❌ [pages/Results] Value > maxPoints:', { num, maxPoints, willReject: true });
      // Don't allow values exceeding maxPoints - just return without updating
      return;
    }

    console.log('✅ [pages/Results] Value accepted, updating marks:', { num, maxPoints });
    
    // Mark that user is editing
    isUserEditingRef.current = true;
    
    setMarks(prev => {
      const existing = prev.find(p => p.studentId === studentId);
      if (existing) {
        const updated = prev.map(p => p.studentId === studentId ? { ...p, score: val } : p);
        console.log('📝 [pages/Results] Updated marks:', updated);
        return updated;
      }
      const newMarks = [...prev, { studentId, score: val }];
      console.log('📝 [pages/Results] Added new mark:', newMarks);
      return newMarks;
    });
    
    // Reset editing flag after a short delay
    setTimeout(() => {
      isUserEditingRef.current = false;
      console.log('🔄 [pages/Results] Reset editing flag');
    }, 1000);
  };

  const getScore = (studentId: string) => {
    return marks.find(m => m.studentId === studentId)?.score || '';
  };

  // Get result status for a student
  const getResultStatus = (studentId: string): Result | null => {
    if (!selectedSubjectId) return null;
    const studentIdStr = String(studentId);
    const subjectIdStr = String(selectedSubjectId);
    return results.find(
      r => String(r.studentId) === studentIdStr && 
           String(r.subjectId) === subjectIdStr && 
           r.semester === selectedSemester &&
           r.type === evaluationType
    ) || null;
  };

  // Get status badge component
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3" />
            معتمد
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3" />
            مرفوض
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3" />
            قيد المراجعة
          </span>
        );
      default:
        return <span className="text-xs text-gray-400">-</span>;
    }
  };

  const handleSaveSingle = () => {
    if (!selectedSubjectId) return;

    // Added 'type' property to resolve TS error
    // FIXED: Ensure all IDs are strings
    const newResults: Result[] = marks
      .filter(m => m.score !== '' && m.score.trim() !== '')
      .map(m => ({
        studentId: String(m.studentId),
        subjectId: String(selectedSubjectId),
        score: parseFloat(m.score),
        semester: selectedSemester,
        type: evaluationType
      }));

    saveResults(newResults);
    const subj = subjects.find(s => String(s.id) === String(selectedSubjectId));
    const subjectName = subj ? getSubjectDisplayName(subj, language) : 'غير معروف';
    const message = currentUser?.role === 'admin' 
      ? `تم حفظ نقاط مادة: ${subjectName} (الفصل ${selectedSemester}) بنجاح.`
      : `تم حفظ نقاط مادة: ${subjectName} (الفصل ${selectedSemester}) بنجاح. النتائج الآن قيد المراجعة من قبل الإدارة.`;
    alert(message);
  };

  // --- Handlers for Grid Mode ---
  const handleGridScoreChange = (studentId: string, subjectId: string, val: string) => {
    const num = parseFloat(val);
    // Get the subject's totalPoints
    const subject = levelSubjects.find(s => String(s.id) === String(subjectId));
    const maxPoints = subject?.totalPoints || 20;
    if (val !== '' && (num < 0 || num > maxPoints)) return;

    setGridMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: val
      }
    }));
  };

  const handleSaveGrid = () => {
    const newResults: Result[] = [];
    
    Object.keys(gridMarks).forEach(studentId => {
      Object.keys(gridMarks[studentId]).forEach(subjectId => {
        const val = gridMarks[studentId][subjectId];
        if (val !== '' && val.trim() !== '') {
          // Added 'type' property to resolve TS error
          // FIXED: Ensure all IDs are strings
          newResults.push({
            studentId: String(studentId),
            subjectId: String(subjectId),
            score: parseFloat(val),
            semester: selectedSemester,
            type: evaluationType
          });
        }
      });
    });

    saveResults(newResults);
    const message = currentUser?.role === 'admin'
      ? `تم حفظ جميع النقاط للفصل ${selectedSemester} بنجاح.`
      : `تم حفظ جميع النقاط للفصل ${selectedSemester} بنجاح. النتائج الآن قيد المراجعة من قبل الإدارة.`;
    alert(message);
  };

  // Helper to calculate student average in grid view
  // FIXED: Convert IDs to strings for lookup
  const calculateStudentAverage = (studentId: string) => {
    const studentIdStr = String(studentId);
    const studentScores = gridMarks[studentIdStr] || {};
    let normalizedScores: number[] = [];
    let totalScore = 0;

    levelSubjects.forEach(subj => {
      const subjectIdStr = String(subj.id);
      const val = parseFloat(studentScores[subjectIdStr]);
      if (!isNaN(val) && subj.totalPoints > 0) {
        // Convert score to normalized scale (out of 20) based on totalPoints
        const normalizedScore = (val / subj.totalPoints) * 20;
        normalizedScores.push(normalizedScore);
        totalScore += normalizedScore;
      }
    });

    return normalizedScores.length > 0 ? (totalScore / normalizedScores.length).toFixed(2) : '-';
  };


  // --- Excel Logic ---

  const handleDownloadTemplate = (type: 'single' | 'all', withRandomData: boolean = false) => {
    if (!selectedClassId) {
      alert('يرجى اختيار القسم أولاً');
      return;
    }

    // FIXED: Convert to string for comparison
    const selectedId = String(selectedClassId);
    const currentClass = classes.find(c => String(c.id) === selectedId);
    const studentsInClass = classStudents; // Use already filtered classStudents

    if (studentsInClass.length === 0) {
      alert('لا يوجد تلاميذ في هذا القسم');
      return;
    }

    // FIXED: Use levelSubjects instead of subjects for 'all' type
    if (type === 'single' && !selectedSubjectId) {
      alert('يرجى اختيار المادة أولاً');
      return;
    }

    if (type === 'all' && levelSubjects.length === 0) {
      alert('لا توجد مواد لهذا المستوى');
      return;
    }

    // Prepare Data
    const data = studentsInClass.map(s => {
      const row: any = {
        'رقم_التعريف': s.id,
        'اسم_التلميذ': s.fullName,
      };

      if (type === 'single') {
        const currentSubject = subjects.find(sub => String(sub.id) === String(selectedSubjectId));
        if (!currentSubject) return row;
        
        let scoreVal = '';
        if (withRandomData) {
          scoreVal = (Math.random() * (19 - 8) + 8).toFixed(1);
        } else {
           // FIXED: Use 'type' instead of 'evaluationType'
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
        // FIXED: Use levelSubjects
        levelSubjects.forEach(subj => {
          let scoreVal = '';
          if (withRandomData) {
            scoreVal = (Math.random() * (19 - 8) + 8).toFixed(1);
          } else {
             // FIXED: Use 'type' instead of 'evaluationType'
             // Try to find exam first, then test
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
    
    // Set column widths
    const wscols = [{ wch: 15 }, { wch: 30 }];
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      data.forEach(row => {
        const studentId = row['رقم_التعريف']?.toString();
        if (!studentId) return;

        let hasUpdate = false;

        // Check for 'النقطة' (Single Subject Mode)
        if (row['النقطة'] !== undefined && selectedSubjectId) {
           const val = parseFloat(row['النقطة']);
           if (!isNaN(val) && val >= 0 && val <= 20) {
              // Added 'type' property to resolve TS error
              // FIXED: Ensure all IDs are strings
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
        // FIXED: Use levelSubjects instead of subjects
        levelSubjects.forEach(subj => {
           if (row[subj.name] !== undefined) {
             const val = parseFloat(row[subj.name]);
             if (!isNaN(val) && val >= 0 && val <= 20) {
                // Added 'type' property to resolve TS error
                // FIXED: Ensure all IDs are strings
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
         alert(`تم استيراد النقاط بنجاح لـ ${updatedStudentsCount} تلميذ.`);
         setActiveTab('manual'); 
         // Force refresh if needed, usually Context update handles it
      } else {
         alert('لم يتم العثور على أعمدة نقاط صالحة في الملف.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handlePrint = () => {
    if (!selectedClassId) {
      alert('يرجى اختيار القسم أولاً');
      return;
    }

    // FIXED: Convert to string for comparison
    const selectedId = String(selectedClassId);
    const selectedClass = classes.find(c => String(c.id) === selectedId);
    const studentsInClass = classStudents; // Use already filtered classStudents
    
    if (studentsInClass.length === 0) {
      alert('لا يوجد تلاميذ في هذا القسم');
      return;
    }

    if (levelSubjects.length === 0) {
      alert('لا توجد مواد لهذا المستوى');
      return;
    }

    // FIXED: Use levelSubjects instead of subjects
    // 1. Calculate Averages and Ranks first (Based on Selected Semester)
    const studentPerformance = studentsInClass.map(student => {
      const studentIdStr = String(student.id);
      let normalizedScores: number[] = [];
      let totalScore = 0;
      levelSubjects.forEach(subj => {
        const subjIdStr = String(subj.id);
        // Find results for both test and exam, use the higher score or average
        // FIXED: Ensure consistent string comparison
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
          
          // FIXED: Use levelSubjects instead of subjects
          const subjectRows = levelSubjects.map(subj => {
             // Find both test and exam results
             // FIXED: Use 'type' instead of 'evaluationType'
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
             let normalizedScore = null;
             if (subjScore !== null && subj.totalPoints > 0) {
               normalizedScore = (subjScore / subj.totalPoints) * 20;
               normalizedScores.push(normalizedScore);
               totalScore += normalizedScore;
             }
             
             // Show both test and exam if both exist
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
  };

  return (
      <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        {currentUser?.role === 'teacher' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">ملاحظة مهمة للمعلمين</p>
                <p className="text-sm text-yellow-700 mt-1">
                  عند حفظ النتائج، ستكون في حالة "قيد المراجعة" حتى يتم اعتمادها من قبل الإدارة. 
                  لا يمكن تعديل النتائج المعتمدة إلا من قبل الإدارة.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">إدارة النتائج</h2>
            <p className="text-gray-500 mt-1">إدخال العلامات، حساب المعدلات، واستخراج الكشوفات</p>
          </div>
          {/* Quick Actions - Always Visible */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md text-sm font-medium"
              title="رفع ملف Excel"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>رفع Excel</span>
            </button>
            <button 
              onClick={() => handleDownloadTemplate('all', false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              disabled={!selectedClassId || levelSubjects.length === 0}
              title="تحميل نموذج Excel لجميع المواد"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تحميل Excel</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              disabled={!selectedClassId || classStudents.length === 0}
              title="طباعة كشوف النقاط"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('manual')}
          className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          إدخال يدوي / عرض شامل
        </button>
        <button 
          onClick={() => setActiveTab('upload')}
          className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          رفع ملف Excel
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           {/* Controls */}
           <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">القسم</label>
                    <select 
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 bg-white text-gray-900"
                      value={selectedClassId}
                      onChange={(e) => {
                        const newClassId = String(e.target.value);
                        setSelectedClassId(newClassId);
                        // Subject will be reset automatically by useEffect
                      }}
                    >
                      {classes.length === 0 ? (
                        <option value="">لا توجد أقسام</option>
                      ) : (
                        classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                      )}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">الفصل الدراسي</label>
                    <select 
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 bg-white text-gray-900"
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(parseInt(e.target.value) as 1 | 2 | 3)}
                    >
                      <option value={1}>الفصل الأول</option>
                      <option value={2}>الفصل الثاني</option>
                      <option value={3}>الفصل الثالث</option>
                    </select>
                  </div>
                  
                  {/* Evaluation Type Switcher */}
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setEvaluationType('test')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${evaluationType === 'test' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                    >
                      اختبار
                    </button>
                    <button 
                      onClick={() => setEvaluationType('exam')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${evaluationType === 'exam' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                    >
                      امتحان
                    </button>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('single')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'single' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <ListBulletIcon className="w-4 h-4" />
                      مادة بمادة
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Squares3X3Icon className="w-4 h-4" />
                      عرض شامل
                    </button>
                  </div>
              </div>

              {viewMode === 'single' && (
                 <div className="flex gap-4 items-end">
                   <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">المادة</label>
                    <select 
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      value={selectedSubjectId || ''}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      disabled={!selectedClassId || levelSubjects.length === 0}
                    >
                      {!selectedClassId ? (
                        <option value="">اختر القسم أولاً</option>
                      ) : levelSubjects.length === 0 ? (
                        <option value="">لا توجد مواد لهذا المستوى</option>
                      ) : (
                        levelSubjects.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} (عدد النقاط: {s.totalPoints})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <button 
                    onClick={handleSaveSingle}
                    className="w-48 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ArrowDownOnSquareIcon className="w-5 h-5" />
                    <span>حفظ النقاط</span>
                  </button>
                 </div>
              )}
              
              {viewMode === 'grid' && (
                 <div className="flex justify-end">
                   <button 
                    onClick={handleSaveGrid}
                    className="w-48 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ArrowDownOnSquareIcon className="w-5 h-5" />
                    <span>حفظ جميع النقاط</span>
                  </button>
                 </div>
              )}
           </div>

           {/* Tables */}
           <div className="overflow-x-auto border rounded-lg bg-white relative">
             {viewMode === 'single' ? (
                 <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b">
                       <tr>
                         <th className="px-6 py-4 text-gray-600 font-semibold w-20">#</th>
                         <th className="px-6 py-4 text-gray-600 font-semibold">التلميذ</th>
                         <th className="px-6 py-4 text-gray-600 font-semibold w-48">{evaluationType === 'test' ? 'نقطة الاختبار' : 'نقطة الامتحان'}</th>
                         <th className="px-6 py-4 text-gray-600 font-semibold">الحالة</th>
                         <th className="px-6 py-4 text-gray-600 font-semibold">الملاحظة</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {classStudents.length > 0 ? (
                         classStudents.map((student, idx) => (
                           <tr key={student.id} className="hover:bg-gray-50">
                             <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                             <td className="px-6 py-3 font-medium text-gray-800">{student.fullName}</td>
                             <td className="px-6 py-3">
                               {(() => {
                                 const selectedSubject = selectedSubjectId 
                                   ? subjects.find(s => String(s.id) === String(selectedSubjectId))
                                   : null;
                                 const totalPoints = selectedSubject?.totalPoints || 20;
                                 return (
                                   <div className="flex items-center gap-1">
                                     <input 
                                       type="number" 
                                       min="0" 
                                       max={totalPoints}
                                       step="0.25"
                                       value={getScore(String(student.id))}
                                       onChange={(e) => handleScoreChange(String(student.id), e.target.value)}
                                       className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 text-center font-bold text-gray-900 bg-white"
                                       placeholder="-"
                                       disabled={getResultStatus(String(student.id))?.status === 'approved' && currentUser?.role !== 'admin'}
                                     />
                                     <span className="text-gray-500 font-bold text-sm whitespace-nowrap">
                                       /{totalPoints}
                                     </span>
                                   </div>
                                 );
                               })()}
                             </td>
                             <td className="px-6 py-3">
                               {getStatusBadge(getResultStatus(String(student.id))?.status)}
                             </td>
                             <td className="px-6 py-3">
                                <span className={`text-sm font-medium ${parseFloat(getScore(String(student.id)) || '0') >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                                   {getScore(String(student.id)) ? (parseFloat(getScore(String(student.id))!) >= 10 ? 'ناجح' : 'راسب') : '-'}
                                </span>
                             </td>
                           </tr>
                         ))
                       ) : (
                         <tr>
                           <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                             {!selectedClassId ? 'يرجى اختيار قسم أولاً' : 'لا يوجد تلاميذ في هذا القسم'}
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
             ) : (
                <div className="overflow-x-auto">
                 <table className="w-full text-right min-w-[800px]">
                    <thead className="bg-gray-50 border-b">
                       <tr>
                         <th className="px-4 py-4 text-gray-600 font-semibold w-16 sticky right-0 bg-gray-50 z-10 border-l">#</th>
                         <th className="px-4 py-4 text-gray-600 font-semibold min-w-[200px] sticky right-16 bg-gray-50 z-10 border-l shadow-sm">التلميذ</th>
                         {levelSubjects.length > 0 ? levelSubjects.map(subj => (
                            <th key={subj.id} className="px-2 py-4 text-gray-600 font-semibold text-center min-w-[100px]">
                               {getSubjectDisplayName(subj, language)}
                               <div className="text-xs font-normal text-gray-400">({subj.totalPoints})</div>
                            </th>
                         )) : (
                            <th colSpan={1} className="px-2 py-4 text-gray-400 font-semibold text-center">
                              لا توجد مواد لهذا المستوى
                            </th>
                         )}
                         <th className="px-4 py-4 text-gray-600 font-semibold min-w-[100px] sticky left-0 bg-gray-50 z-10 border-r">المعدل</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {classStudents.length > 0 ? classStudents.map((student, idx) => (
                         <tr key={student.id} className="hover:bg-gray-50">
                           <td className="px-4 py-3 text-gray-500 sticky right-0 bg-white z-10 border-l group-hover:bg-gray-50">{idx + 1}</td>
                           <td className="px-4 py-3 font-medium text-gray-800 sticky right-16 bg-white z-10 border-l shadow-sm group-hover:bg-gray-50">{student.fullName}</td>
                           {levelSubjects.length > 0 ? levelSubjects.map(subj => {
                             const studentIdStr = String(student.id);
                             const subjectIdStr = String(subj.id);
                             return (
                               <td key={subjectIdStr} className="px-2 py-3 text-center">
                                 <input 
                                   type="number" 
                                   min="0" 
                                   max={subj.totalPoints || 20}
                                   step="0.25"
                                   value={gridMarks[studentIdStr]?.[subjectIdStr] || ''}
                                   onChange={(e) => handleGridScoreChange(studentIdStr, subjectIdStr, e.target.value)}
                                   className="w-16 px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary text-center text-sm"
                                   placeholder="-"
                                 />
                               </td>
                             );
                           }) : (
                             <td colSpan={levelSubjects.length || 1} className="px-2 py-3 text-center text-gray-400">
                               لا توجد مواد
                             </td>
                           )}
                           <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r text-center font-bold text-gray-700 group-hover:bg-gray-50">
                             {calculateStudentAverage(String(student.id))}
                           </td>
                         </tr>
                       )) : (
                         <tr>
                           <td colSpan={levelSubjects.length + 3} className="px-4 py-8 text-center text-gray-400">
                             لا يوجد تلاميذ في هذا القسم
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
                </div>
             )}

             {classStudents.length === 0 && (
                <div className="p-12 text-center text-gray-500">لا يوجد تلاميذ في هذا القسم</div>
             )}
           </div>

           {/* تم الإبقاء على أزرار التحميل / الرفع / الطباعة في الهيدر فقط لتفادي التكرار */}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            {/* Selection for Template */}
             <div className="mb-8 w-full max-w-3xl bg-blue-50 p-6 rounded-lg border border-blue-100">
               <h4 className="text-blue-800 font-bold mb-4 flex items-center gap-2 justify-center">
                 <ArrowDownTrayIcon className="w-5 h-5" />
                 خطوة 1: تحميل نموذج Excel
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-blue-600 block mb-1">القسم</label>
                    <select 
                      className="w-full p-2.5 border border-blue-200 rounded-lg text-sm"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-blue-600 block mb-1">المادة (في حال النموذج الفردي)</label>
                    <select 
                      className="w-full p-2.5 border border-blue-200 rounded-lg text-sm"
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                    >
                      {subjects.map(s => <option key={s.id} value={s.id}>{getSubjectDisplayName(s, language)}</option>)}
                    </select>
                  </div>
               </div>
               
               <div className="flex flex-wrap justify-center gap-3">
                 <button 
                   onClick={() => handleDownloadTemplate('single', false)}
                   className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition flex items-center gap-2 text-sm font-medium"
                 >
                   <FileSpreadsheet className="w-4 h-4" />
                   نموذج مادة واحدة
                 </button>
                 <button 
                   onClick={() => handleDownloadTemplate('all', false)}
                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium shadow-md"
                 >
                   <Squares2X2Icon className="w-4 h-4" />
                   نموذج شامل (جميع المواد)
                 </button>
                 <button 
                   onClick={() => handleDownloadTemplate('all', true)}
                   className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 text-sm font-medium shadow-md"
                 >
                   <SparklesIcon className="w-4 h-4" />
                   ملف تجريبي شامل (نقاط عشوائية)
                 </button>
               </div>
               <p className="text-xs text-blue-600 mt-3">اختر "نموذج شامل" للحصول على ملف يحتوي على أعمدة لجميع المواد.</p>
             </div>

            <div className="bg-green-50 p-6 rounded-full mb-4">
              <ArrowUpTrayIcon className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">خطوة 2: رفع الملف المملوء</h3>
            <p className="text-gray-500 mb-8 max-w-md">قم برفع الملف الذي قمت بتعبئته. سيقوم النظام بالتعرف تلقائياً على الأعمدة (المواد) الموجودة.</p>
            
            <label className="cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary hover:bg-blue-50 transition w-full max-w-lg">
               <div className="flex flex-col items-center">
                 <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mb-2" />
                 <span className="font-medium text-gray-600">انقر لرفع ملف Excel</span>
                 <span className="text-sm text-gray-400 mt-1">أو اسحب الملف هنا</span>
               </div>
               <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>
            
        </div>
      )}
    </div>
  );
};

export default Results;