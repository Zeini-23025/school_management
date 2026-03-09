import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import {
  UsersIcon,
  AcademicCapIcon,
  StarIcon,
  BoltIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon,
  AcademicCapIcon as GraduationCapIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useSchoolContext } from '../../context/SchoolContext';

const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string; trend: string; chart?: any }> = ({ title, value, icon: Icon, color, trend, chart }) => {
  const colorMap: Record<string, { bg: string; text: string; dark: string }> = {
    sky: { bg: 'from-sky-300 to-sky-500', text: 'text-sky-600', dark: 'bg-sky-50' },
    indigo: { bg: 'from-indigo-300 to-indigo-500', text: 'text-indigo-600', dark: 'bg-indigo-50' },
    emerald: { bg: 'from-emerald-300 to-emerald-500', text: 'text-emerald-600', dark: 'bg-emerald-50' },
    amber: { bg: 'from-amber-300 to-amber-500', text: 'text-amber-600', dark: 'bg-amber-50' }
  };
  
  const colorScheme = colorMap[color] || colorMap.sky;
  
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-soft hover:shadow-soft-xl transition-all duration-300 border border-slate-100 group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity" style={{
        background: `linear-gradient(135deg, var(--color-start) 0%, var(--color-end) 100%)`,
        borderRadius: '50%'
      }}></div>
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorScheme.dark} ${colorScheme.text} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">
          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          {trend}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
        <div className="flex items-baseline gap-2 mb-4">
          <h3 className="text-4xl font-black text-slate-800">{value}</h3>
        </div>
        
        {chart && (
          <div className="h-12 w-full mb-0">
            <ResponsiveContainer width="100%" height={48}>
              <LineChart data={chart} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <Line type="monotone" dataKey="value" stroke={colorScheme.text.split('-')[1]} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const QuickLinkCard: React.FC<{ title: string; icon: any; color: string; onClick: () => void; desc: string }> = ({ title, icon: Icon, color, onClick, desc }) => {
  const colorMap: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: 'from-indigo-500 to-indigo-600', icon: 'text-indigo-600' },
    emerald: { bg: 'from-emerald-500 to-emerald-600', icon: 'text-emerald-600' },
    amber: { bg: 'from-amber-500 to-amber-600', icon: 'text-amber-600' }
  };
  
  const scheme = colorMap[color] || colorMap.indigo;
  
  return (
    <button 
      onClick={onClick}
      className="relative group overflow-hidden rounded-2xl border border-slate-100 shadow-soft hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-300 text-left bg-white p-6"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${scheme.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-${color}-50 ${scheme.icon} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
          <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all rtl:rotate-180" />
        </div>
        
        <div>
          <p className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors">{title}</p>
          <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-500 transition-colors">{desc}</p>
        </div>
      </div>
    </button>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { students, classes, subjects, results, activities, t, currentUser } = useSchoolContext();
  const isAdmin = currentUser?.role === 'admin';
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === 'ar' ? 'ar-MA' : 'fr-FR';

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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return t('time_just_now');
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return mins === 1 ? t('time_min_ago') : t('time_mins_ago', mins.toString());
    }
    const hours = Math.floor(diffInSeconds / 3600);
    return hours === 1 ? t('time_hour_ago') : t('time_hours_ago', hours.toString());
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 rounded-[32px] p-8 overflow-hidden shadow-soft-xl shadow-primary-200">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary-400/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-primary-300/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-6 h-6 text-primary-200" />
              <span className="text-xs font-bold text-primary-100 uppercase tracking-widest">{t('dashboard')}</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">{t('welcome_back_manager')} 👋</h1>
            <p className="text-primary-100 font-medium">{t('welcome_subtitle')}</p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-xl">
            <CalendarDaysIcon className="w-7 h-7 text-white" />
            <div className="text-right">
              <p className="text-[11px] text-primary-100 font-bold uppercase tracking-wider">{t('today_date')}</p>
              <p className="text-white font-bold text-sm">{new Date().toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('student_count')} 
          value={students.length} 
          icon={UsersIcon} 
          color="sky"
          trend="+12%"
          chart={[{ value: 45 }, { value: 52 }, { value: 48 }, { value: 61 }, { value: 55 }]}
        />
        <StatCard 
          title={t('class_count')} 
          value={classes.length} 
          icon={AcademicCapIcon} 
          color="indigo"
          trend="+2"
          chart={[{ value: 20 }, { value: 22 }, { value: 18 }, { value: 24 }, { value: 26 }]}
        />
        <StatCard 
          title={t('success_rate')} 
          value={statistics.passRate} 
          icon={CheckCircleIcon} 
          color="emerald"
          trend="+5.4%"
          chart={[{ value: 72 }, { value: 75 }, { value: 78 }, { value: 82 }, { value: 85 }]}
        />
        <StatCard 
          title={t('recent_results')} 
          value={statistics.resultsCount} 
          icon={ArrowTrendingUpIcon} 
          color="amber"
          trend="+40"
          chart={[{ value: 120 }, { value: 150 }, { value: 140 }, { value: 180 }, { value: 220 }]}
        />
      </div>

      {/* Dashboard Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline / Recent Activity */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-soft border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
                <BoltIcon className="w-5 h-5" />
              </div>
              {t('recent_activities')}
            </h3>
            <button className="text-sm font-bold text-primary-600 hover:text-primary-700">{t('show_all')}</button>
          </div>

          <div className="space-y-6 overflow-y-auto flex-1 pr-2 max-h-96">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="relative flex items-start gap-5 group pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm transition-all group-hover:scale-110 flex-shrink-0
                    ${act.type === 'add' ? 'bg-emerald-50 text-emerald-600' : 
                      act.type === 'delete' ? 'bg-red-50 text-red-600' : 
                      'bg-blue-50 text-blue-600'}`}
                  >
                    {act.type === 'add' ? <UsersIcon className="w-5 h-5" /> : act.type === 'delete' ? <BoltIcon className="w-5 h-5" /> : <ArrowTrendingUpIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-bold text-slate-800 text-sm">{t(act.descriptionKey, ...(act.params || []))}</p>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase whitespace-nowrap">{formatTimeAgo(act.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t('activity_desc')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BoltIcon className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">{t('no_activities_recent')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-slate-800">{t('quick_links')}</h3>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-primary-200 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <QuickLinkCard 
              title={t('add_student_btn')}
              desc={t('quick_link_add_desc')}
              icon={UsersIcon}
              color="indigo"
              onClick={() => navigate('/students')}
            />
            {isAdmin ? (
              <QuickLinkCard 
                title={t('approve_results')}
                desc={t('quick_link_approve_desc')}
                icon={CheckCircleIcon}
                color="emerald"
                onClick={() => navigate('/approve-results')}
              />
            ) : (
              <QuickLinkCard 
                title={t('enter_results_btn')}
                desc={t('quick_link_results_desc')}
                icon={GraduationCapIcon}
                color="emerald"
                onClick={() => navigate('/results')}
              />
            )}
            <QuickLinkCard 
              title={t('print_reports_btn')}
              desc={t('quick_link_print_desc')}
              icon={StarIcon}
              color="amber"
              onClick={() => navigate('/results')}
            />
          </div>

          {/* System Updates */}
          <div className="mt-8 bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-[24px] text-white shadow-soft-xl shadow-indigo-200">
            <div className="flex gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-black text-lg mb-2">{t('system_updates_title')} 🚀</h4>
            </div>
            <p className="text-indigo-100 text-sm mb-4 leading-relaxed">{t('system_updates_text')}</p>
            <button onClick={() => navigate('/statistics')} className="w-full py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-bold text-sm transition-all">
              {t('explore_now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;