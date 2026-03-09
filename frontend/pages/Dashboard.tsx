import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, AcademicCapIcon, StarIcon, BoltIcon } from '@heroicons/react/24/solid';
import { useSchoolContext } from '../context/SchoolContext';

const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-full bg-${color}-50 text-${color}-500`}>
      <Icon className="w-8 h-8" color={color} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { students, classes, subjects, results, activities } = useSchoolContext();

  // حساب نسبة النجاح والمعدل العام
  const statistics = useMemo(() => {
    // حساب معدل كل طالب
    const studentAverages = students.map(student => {
      const currentClass = classes.find(c => String(c.id) === String(student.classId));
      if (!currentClass) return { studentId: student.id, average: 0 };

      // المواد الخاصة بالمستوى الدراسي
      const levelSubjects = subjects.filter(s => s.level === currentClass.level);
      if (levelSubjects.length === 0) return { studentId: student.id, average: 0 };

      // النتائج للفصل الدراسي الأول (للإحصائيات العامة)
      const semesterResults = results.filter(r => String(r.studentId) === String(student.id) && r.semester === 1);

      let normalizedScores: number[] = [];
      let totalScore = 0;

      levelSubjects.forEach(subj => {
        const testRes = semesterResults.find(r => String(r.subjectId) === String(subj.id) && r.type === 'test');
        const examRes = semesterResults.find(r => String(r.subjectId) === String(subj.id) && r.type === 'exam');

        let subjScore: number | null = null;
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

    // حساب نسبة النجاح
    const studentsWithResults = studentAverages.filter(s => s.average > 0);
    const totalStudentsWithResults = studentsWithResults.length;
    const passedStudents = studentsWithResults.filter(s => s.average >= 10).length;
    const passRate = totalStudentsWithResults > 0 
      ? ((passedStudents / totalStudentsWithResults) * 100).toFixed(1) 
      : '0.0';

    // عدد النتائج الفريدة (تجنب العد المزدوج للاختبار والامتحان)
    const uniqueResultsCount = results.length;

    return {
      passRate: `${passRate}%`,
      resultsCount: uniqueResultsCount
    };
  }, [students, classes, subjects, results]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">لوحة التحكم</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="عدد التلاميذ" 
          value={students.length} 
          icon={UsersIcon} 
          color="#0ea5e9" // blue
        />
        <StatCard 
          title="عدد الأقسام" 
          value={classes.length} 
          icon={AcademicCapIcon} 
          color="#8b5cf6" // purple
        />
        <StatCard 
          title="نسبة النجاح" 
          value={statistics.passRate} 
          icon={StarIcon} 
          color="#10b981" // green
        />
        <StatCard 
          title="عدد النتائج" 
          value={statistics.resultsCount} 
          icon={BoltIcon} 
          color="#f59e0b" // amber
        />
      </div>

      {/* Recent Activity & Recent Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">آخر النشاطات</h3>
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.slice(0, 5).map((act, index) => {
                const timeAgo = (() => {
                  const now = new Date();
                  const diffInSeconds = Math.floor((now.getTime() - new Date(act.timestamp).getTime()) / 1000);
                  if (diffInSeconds < 60) return 'الآن';
                  if (diffInSeconds < 3600) {
                    const mins = Math.floor(diffInSeconds / 60);
                    return `منذ ${mins} دقيقة`;
                  }
                  const hours = Math.floor(diffInSeconds / 3600);
                  return `منذ ${hours} ساعة`;
                })();
                
                return (
                  <div key={act.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      act.type === 'add' ? 'bg-green-500' : 
                      act.type === 'delete' ? 'bg-red-500' : 
                      act.type === 'result' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{act.descriptionKey}</p>
                      <p className="text-sm text-gray-500">{timeAgo}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد نشاطات مؤخراً
              </div>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">آخر النتائج</h3>
          <div className="space-y-4">
            {results && results.length > 0 ? (
              (() => {
                // ترتيب النتائج حسب التاريخ (الأحدث أولاً) - استخدام id كمعرف للترتيب
                const sortedResults = [...results].slice(-10).reverse(); // آخر 10 نتائج
                return sortedResults.map((result, index) => {
                  const student = students.find(s => String(s.id) === String(result.studentId));
                  const subject = subjects.find(s => String(s.id) === String(result.subjectId));
                  const semesterName = result.semester === 1 ? 'الفصل الأول' : result.semester === 2 ? 'الفصل الثاني' : 'الفصل الثالث';
                  const typeName = result.type === 'test' ? 'اختبار' : 'امتحان';
                  
                  return (
                    <div key={result.id || `result-${index}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {result.score}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {student?.fullName || 'غير معروف'} - {subject?.name || 'مادة'}
                        </p>
                        <p className="text-sm text-gray-500">{semesterName} - {typeName}</p>
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد نتائج مسجلة
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">روابط سريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={() => navigate('/students')} 
            className="flex items-center justify-between p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
          >
            <span>إضافة تلميذ جديد</span>
            <UsersIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/results')} 
            className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
          >
            <span>إدخال النتائج</span>
            <BoltIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/results')} 
            className="flex items-center justify-between p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition"
          >
            <span>طباعة الكشوفات</span>
            <StarIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
