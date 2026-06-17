'use client';

import { useState, useEffect } from 'react';

interface ReportData {
  patients: {
    total: number;
    newThisMonth: number;
    topDiseases: Array<{ disease: string; count: number }>;
  };
  financial: {
    totalRevenue: number;
    totalPaid: number;
    totalDebt: number;
    monthlyRevenue: Record<string, number>;
  };
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'financial'>('patients');

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports data');
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async (type: 'patients' | 'financial') => {
    try {
      const response = await fetch(`/api/reports/export?type=${type}&format=pdf`);
      if (!response.ok) throw new Error('Failed to export PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (err) {
      alert('فشل في تصدير التقرير');
    }
  };

  const exportToExcel = async (type: 'patients' | 'financial') => {
    try {
      const response = await fetch(`/api/reports/export?type=${type}&format=excel`);
      if (!response.ok) throw new Error('Failed to export Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (err) {
      alert('فشل في تصدير التقرير');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-4">{error || 'فشل في تحميل البيانات'}</p>
          <button
            onClick={fetchReportsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إعادة محاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">التقارير</h1>
        <p className="mt-1 text-sm text-gray-500">تحليل شامل لأداء عيادتك</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-6 py-3 font-bold border-b-2 transition-all ${
            activeTab === 'patients'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          تقرير المرضى
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-6 py-3 font-bold border-b-2 transition-all ${
            activeTab === 'financial'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          التقرير المالي
        </button>
      </div>

      {activeTab === 'patients' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => exportToPDF('patients')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              تصدير PDF
            </button>
            <button
              onClick={() => exportToExcel('patients')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              تصدير Excel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <p className="text-gray-600 text-sm mb-2">إجمالي المرضى</p>
              <p className="text-4xl font-black text-blue-600">{data.patients.total}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <p className="text-gray-600 text-sm mb-2">مرضى جدد هذا الشهر</p>
              <p className="text-4xl font-black text-green-600">{data.patients.newThisMonth}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <p className="text-gray-600 text-sm mb-2">أكثر الأمراض شيوعاً</p>
              <p className="text-2xl font-black text-purple-600">
                {data.patients.topDiseases[0]?.disease || 'لا توجد بيانات'}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">أكثر الأمراض شيوعاً</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 text-gray-600 font-bold">المرض</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-bold">عدد الحالات</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-bold">النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.patients.topDiseases.map((disease, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{disease.disease}</td>
                      <td className="py-3 px-4 text-gray-600">{disease.count}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${(disease.count / (data.patients.topDiseases[0]?.count || 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-600">
                            {Math.round((disease.count / data.patients.total) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => exportToPDF('financial')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              تصدير PDF
            </button>
            <button
              onClick={() => exportToExcel('financial')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              تصدير Excel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <p className="text-gray-600 text-sm mb-2">إجمالي الإيرادات</p>
              <p className="text-3xl font-black text-green-600">{data.financial.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">ر.س</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <p className="text-gray-600 text-sm mb-2">المدفوع</p>
              <p className="text-3xl font-black text-blue-600">{data.financial.totalPaid.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">ر.س</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <p className="text-gray-600 text-sm mb-2">الديون المعلقة</p>
              <p className="text-3xl font-black text-red-600">{data.financial.totalDebt.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">ر.س</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">الإيرادات الشهرية</h3>
            <div className="space-y-4">
              {Object.entries(data.financial.monthlyRevenue).map(([month, revenue]) => (
                <div key={month} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-600 w-20">{month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-green-600 h-full rounded-full"
                      style={{ width: `${Math.min((revenue / 10000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-24 text-right">
                    {revenue.toLocaleString()} ر.س
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">ملخص مالي</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">معدل التحصيل</p>
                <p className="text-3xl font-black text-green-600">
                  {Math.round((data.financial.totalPaid / data.financial.totalRevenue) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">نسبة الديون</p>
                <p className="text-3xl font-black text-red-600">
                  {Math.round((data.financial.totalDebt / data.financial.totalRevenue) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
