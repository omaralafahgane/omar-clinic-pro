'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PatientData {
  appointments: any[];
  files: any[];
  invoices: any[];
  history: any;
}

export default function PatientPortal() {
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'files' | 'invoices'>('appointments');

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    try {
      const response = await fetch('/api/portal/data');
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">جاري تحميل بياناتك...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8" dir="rtl">
      <header className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900">مرحباً بك في بوابتك الطبية</h1>
          <p className="text-gray-500 mt-2">تابع مواعيدك، ملفاتك، وفواتيرك بكل سهولة</p>
        </div>
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </header>

      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('appointments')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'appointments' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>مواعيدي</button>
        <button onClick={() => setActiveTab('files')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'files' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>ملفاتي الطبية</button>
        <button onClick={() => setActiveTab('invoices')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'invoices' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>الفواتير</button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {activeTab === 'appointments' && (
          <div className="p-8 space-y-4">
            {data?.appointments.length ? data.appointments.map((app: any) => (
              <div key={app.id} className="flex justify-between items-center p-6 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all">
                <div>
                  <h4 className="font-bold text-gray-900">{app.reason_for_visit}</h4>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(app.start_time)} - د. {app.doctor.first_name}</p>
                </div>
                <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{app.status}</span>
              </div>
            )) : <p className="text-center text-gray-400 py-20">لا توجد مواعيد حالية</p>}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.files.length ? data.files.map((file: any) => (
              <a href={file.file_url} target="_blank" key={file.id} className="flex items-center gap-4 p-6 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{file.file_name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{file.file_type} - {formatDate(file.created_at)}</p>
                </div>
              </a>
            )) : <p className="text-center text-gray-400 py-20 col-span-2">لا توجد ملفات طبية مرفوعة</p>}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="p-8 space-y-4">
            {data?.invoices.length ? data.invoices.map((inv: any) => (
              <div key={inv.id} className="flex justify-between items-center p-6 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all">
                <div>
                  <h4 className="font-bold text-gray-900">فاتورة رقم #{inv.invoice_number}</h4>
                  <p className="text-sm text-gray-500 mt-1">المبلغ: {formatCurrency(inv.total_amount)} - الحالة: {inv.status}</p>
                </div>
                <button className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all">تحميل PDF</button>
              </div>
            )) : <p className="text-center text-gray-400 py-20">لا توجد فواتير صادرة</p>}
          </div>
        )}
      </div>
    </div>
  );
}
