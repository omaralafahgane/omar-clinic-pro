'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface ReportData {
  patients: {
    total: number;
    newThisMonth: number;
    topDiseases: Array<{ name: string; count: number }>;
  };
  financial: {
    totalRevenue: number;
    totalPaid: number;
    totalDebt: number;
    monthlyStats: Array<{ month: string; revenue: number; paid: number }>;
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

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      // In a real app, this would call the export API
      // For now, we'll simulate the download or show a message
      alert(`جاري تجهيز تقرير ${activeTab === 'patients' ? 'المرضى' : 'المالي'} بصيغة ${format.toUpperCase()}...`);
      
      const response = await fetch(`/api/reports/export?type=${activeTab}&format=${format}`);
      if (!response.ok) {
        // Fallback for demo
        console.log("Export API not fully implemented yet");
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <p className="text-red-600 font-bold mb-4">{error || 'فشل في تحميل البيانات'}</p>
        <button
          onClick={fetchReportsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          إعادة محاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير والتحليلات</h1>
          <p className="text-gray-500 mt-1">نظرة شاملة على أداء العيادة الطبي والمالي</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportReport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors font-bold"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            تصدير PDF
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl hover:bg-green-100 transition-colors font-bold"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            تصدير Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-200/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'patients'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          تقارير المرضى
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'financial'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          التقارير المالية
        </button>
      </div>

      {/* Tab Content: Patients */}
      {activeTab === 'patients' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">إجمالي المرضى</p>
                <h3 className="text-4xl font-black text-gray-900 mt-1">{data.patients.total}</h3>
                <p className="text-green-600 text-sm font-bold mt-2">إجمالي المسجلين في النظام</p>
              </div>
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0" />
                </svg>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">المرضى الجدد</p>
                <h3 className="text-4xl font-black text-gray-900 mt-1">{data.patients.newThisMonth}</h3>
                <p className="text-blue-600 text-sm font-bold mt-2">خلال الشهر الحالي</p>
              </div>
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">أكثر الحالات المرضية شيوعاً</h3>
            <div className="space-y-6">
              {data.patients.topDiseases.length > 0 ? (
                data.patients.topDiseases.map((disease, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-700">{disease.name}</span>
                      <span className="text-blue-600">{disease.count} حالة</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-l from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(disease.count / (data.patients.topDiseases[0]?.count || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">لا توجد بيانات تشخيصات مسجلة بعد</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Financial */}
      {activeTab === 'financial' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">الإيرادات</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(data.financial.totalRevenue)}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">المدفوعات</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(data.financial.totalPaid)}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">الديون</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(data.financial.totalDebt)}</h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-8">تحليل الإيرادات والتحصيل (آخر 6 أشهر)</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.financial.monthlyStats.map((stat, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full flex justify-center gap-1 items-end h-48">
                    <div 
                      className="w-1/3 bg-blue-500 rounded-t-lg transition-all duration-1000" 
                      style={{ height: `${Math.max((stat.revenue / (Math.max(...data.financial.monthlyStats.map(s => s.revenue)) || 1)) * 100, 5)}%` }}
                      title={`إيرادات: ${stat.revenue}`}
                    ></div>
                    <div 
                      className="w-1/3 bg-green-500 rounded-t-lg transition-all duration-1000" 
                      style={{ height: `${Math.max((stat.paid / (Math.max(...data.financial.monthlyStats.map(s => s.revenue)) || 1)) * 100, 5)}%` }}
                      title={`مدفوع: ${stat.paid}`}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-gray-500 whitespace-nowrap">{stat.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-bold text-gray-600">الإيرادات المتوقعة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-bold text-gray-600">المبالغ المحصلة</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
