import React, { useState, useEffect } from 'react';
import { useSchoolContext } from '../context/SchoolContext';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Result } from '../types';

const ApproveResults: React.FC = () => {
  const { fetchPendingResults, approveResult, rejectResult, currentUser, notify, t, language } = useSchoolContext();
  const [pendingResults, setPendingResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    // Only allow admin access
    if (currentUser && currentUser.role !== 'admin') {
      notify('ليس لديك صلاحية للوصول إلى هذه الصفحة', 'error');
      return;
    }
    loadPendingResults();
  }, [currentUser]);

  const loadPendingResults = async () => {
    setLoading(true);
    try {
      const results = await fetchPendingResults();
      setPendingResults(results);
    } catch (error) {
      console.error('Error loading pending results:', error);
      notify('فشل تحميل النتائج قيد المراجعة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (resultId: string) => {
    if (!resultId) return;
    await approveResult(resultId);
    await loadPendingResults();
  };

  const handleReject = async (resultId: string) => {
    if (!resultId) return;
    const reason = rejectReason[resultId] || '';
    await rejectResult(resultId, reason);
    setShowRejectModal(null);
    setRejectReason({ ...rejectReason, [resultId]: '' });
    await loadPendingResults();
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3" />
            موافق عليه
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3" />
            مرفوض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3" />
            قيد المراجعة
          </span>
        );
    }
  };

  // Check if user is admin
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح بالوصول</h2>
        <p className="text-gray-600">هذه الصفحة متاحة فقط للإدارة</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">مراجعة النتائج</h1>
        <button
          onClick={loadPendingResults}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          تحديث
        </button>
      </div>

      {pendingResults.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">لا توجد نتائج قيد المراجعة</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">التلميذ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">المادة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">النقطة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الفصل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">أضافه</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.student_name || 'غير معروف'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {(language === 'ar' && result.subject_name_ar) ? result.subject_name_ar : (result.subject_name || 'غير معروف')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {result.score.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      الفصل {result.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {result.type === 'test' ? 'اختبار' : 'امتحان'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {result.submitted_by_name || 'غير معروف'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString('ar-EG') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(result.id!)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          موافقة
                        </button>
                        <button
                          onClick={() => setShowRejectModal(result.id!)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          رفض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal للرفض */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">رفض النتيجة</h3>
            <p className="text-sm text-gray-600 mb-4">يرجى إدخال سبب الرفض (اختياري):</p>
            <textarea
              value={rejectReason[showRejectModal] || ''}
              onChange={(e) => setRejectReason({ ...rejectReason, [showRejectModal]: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="سبب الرفض..."
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => handleReject(showRejectModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                رفض
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason({ ...rejectReason, [showRejectModal]: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveResults;
