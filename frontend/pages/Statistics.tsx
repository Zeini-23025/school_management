import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { TrophyIcon, ArrowTrendingUpIcon, UsersIcon, ExclamationTriangleIcon, CalculatorIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import { useSchoolContext } from '../context/SchoolContext';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        <p className="text-sm text-primary">
          {payload[0].name}: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string; subtext?: string }> = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className="p-4 rounded-xl" style={{ backgroundColor: `${color}1A` }}>
      <Icon className="w-8 h-8" style={{ color: color }} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const Statistics: React.FC = () => {
  const { fetchStatistics } = useSchoolContext();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2 | 3>(1);

  // Fetch statistics from backend API
  useEffect(() => {
    const loadStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStatistics(selectedSemester);
        if (data) {
          setStats(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'تعذر تحميل الإحصائيات');
        console.error('Error loading statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [fetchStatistics, selectedSemester]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">جاري تحميل الإحصائيات...</div>
      </div>
    );
  }

  // Show error state
  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error || 'تعذر تحميل الإحصائيات'}</div>
      </div>
    );
  }


  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-8 h-8 text-primary" />
            الإحصائيات العامة
          </h2>
          <p className="text-gray-500 mt-1">نظرة شاملة على أداء المدرسة والتلاميذ</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">الفصل الدراسي:</label>
          <select 
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value) as 1 | 2 | 3)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 bg-white text-gray-900"
          >
            <option value={1}>الفصل الأول</option>
            <option value={2}>الفصل الثاني</option>
            <option value={3}>الفصل الثالث</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="المعدل العام للمدرسة" 
          value={stats.globalAverage && stats.globalAverage > 0 ? `${stats.globalAverage.toFixed(2)} / 20` : '0.00 / 20'} 
          icon={CalculatorIcon} 
          color="#3b82f6" // blue
          subtext="متوسط معدلات جميع التلاميذ"
        />
        <StatCard 
          title="نسبة النجاح" 
          value={`${stats.passRate}%`} 
          icon={ArrowTrendingUpIcon} 
          color="#10b981" // green
          subtext={`${stats.passFailData[0].value} تلميذ ناجح`}
        />
        <StatCard 
          title="القسم المتفوق" 
          value={stats.bestClass?.name || '-'} 
          icon={TrophyIcon} 
          color="#f59e0b" // amber
          subtext={stats.bestClass && stats.bestClass.avg ? `معدل: ${stats.bestClass.avg.toFixed(2)}` : ''}
        />
        <StatCard 
          title="التلاميذ المتعثرين" 
          value={stats.failedStudents} 
          icon={ExclamationTriangleIcon} 
          color="#ef4444" // red
          subtext="معدل أقل من 10/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Class Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">ترتيب الأقسام حسب المعدل</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.classPerformance}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 20]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280' }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Bar 
                  dataKey="avg" 
                  name="معدل القسم" 
                  radius={[8, 8, 0, 0]}
                >
                  {stats.classPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pass/Fail Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2 w-full text-right">توزيع النتائج</h3>
          <div className="h-64 w-full relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#10b981" /> {/* Pass */}
                    <Cell fill="#ef4444" /> {/* Fail */}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-800">{stats.passRate}%</span>
                <span className="text-xs text-gray-500">نسبة النجاح</span>
             </div>
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <BookOpenIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">أداء التلاميذ حسب المادة</h3>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.subjectPerformance}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
              <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="avg" 
                name="متوسط النقاط" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAvg)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Statistics;