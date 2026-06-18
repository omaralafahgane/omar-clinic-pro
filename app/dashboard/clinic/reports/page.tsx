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
      } else {
        throw new Error(result.error || 'فشل في تحميل البيانات');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      alert(`جاري تجهيز تقرير ${activeTab === 'patients' ? 'المرضى' : 'المالي'} بصيغة ${format.toUpperCase()}...`);
      
      const response = await fetch(`/api/reports/export?type=${activeTab}&format=${format}`);
      if (!response.ok) {
        alert("خدمة التصدير قيد التطوير حالياً");
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
          <p className="text-gray-600 font-medium">جاري تحميل التقارير الحقيقية...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-bold mb-4">{error || 'فشل في تحميل البيانات'}</p>
        <button
          onClick={fetchReportsData}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all"
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
          <h1 className="text-3xl font-black text-gray-900">التقارير والتحليلات المباشرة</h1>
          <p className="text-gray-500 mt-1 font-medium">بيانات فعلية من قاعدة بيانات عيادتك</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportReport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors font-bold"
          >
            تصدير PDF
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl hover:bg-green-100 transition-colors font-bold"
          >
            تصدير Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-gray-200/50 rounded-2xl w-fit border border-gray-200">
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-8 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'patients'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          تحليل المرضى
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-8 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'financial'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          التحليل المالي
        </button>
      </div>

      {/* Tab Content: Patients */}
      {activeTab === 'patients' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-bold">إجمالي المرضى</p>
                <h3 className="text-5xl font-black text-gray-900 mt-1">{data.patients.total}</h3>
                <p className="text-green-600 text-sm font-bold mt-2">سجلات حقيقية في النظام</p>
              </div>
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0" />
                </svg>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-bold">المرضى الجدد</p>
                <h3 className="text-5xl font-black text-gray-900 mt-1">{data.patients.newThisMonth}</h3>
                <p className="text-blue-600 text-sm font-bold mt-2">خلال الشهر الحالي</p>
              </div>
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-600">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-8">أكثر الحالات المرضية تشخيصاً</h3>
            <div className="space-y-8">
              {data.patients.topDiseases.length > 0 ? (
                data.patients.topDiseases.map((disease, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between text-base font-black">
                      <span className="text-gray-700">{disease.name}</span>
                      <span className="text-blue-600">{disease.count} حالة</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-gradient-to-l from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(disease.count / (data.patients.topDiseases[0]?.count || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-gray-400 font-bold">لا توجد بيانات تشخيصات مسجلة بعد في سجلات العلاج</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Financial */}
      {activeTab === 'financial' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-bold">إجمالي الإيرادات</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(data.financial.totalRevenue)}</h3>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-bold">المبالغ المحصلة</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(data.financial.totalPaid)}</h3>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-bold">المبالغ المستحقة</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(data.financial.totalDebt)}</h3>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-10 text-center md:text-right">تحليل الأداء المالي (آخر 6 أشهر)</h3>
            <div className="h-80 flex items-end justify-between gap-4">
              {data.financial.monthlyStats.map((stat, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full flex justify-center gap-1.5 items-end h-60">
                    <div 
                      className="w-1/3 bg-blue-500 rounded-t-xl transition-all duration-700 hover:brightness-110" 
                      style={{ height: `${Math.max((stat.revenue / (Math.max(...data.financial.monthlyStats.map(s => s.revenue)) || 1)) * 100, 5)}%` }}
                    ></div>
                    <div 
                      className="w-1/3 bg-green-500 rounded-t-xl transition-all duration-700 hover:brightness-110" 
                      style={{ height: `${Math.max((stat.paid / (Math.max(...data.financial.monthlyStats.map(s => s.revenue)) || 1)) * 100, 5)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-black text-gray-600">{stat.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-md shadow-blue-200"></div>
                <span className="text-base font-black text-gray-700">الإيرادات (الفواتير)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-md shadow-green-200"></div>
                <span className="text-base font-black text-gray-700">التحصيل (المدفوعات)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
