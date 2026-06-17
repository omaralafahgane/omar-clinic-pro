'use client';

import { useState, useEffect } from 'react';

interface SubscriptionData {
  currentPlan: string;
  status: 'active' | 'cancelled' | 'expired';
  renewalDate: string;
  shopifySubscriptionId: string;
  billingHistory: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (!response.ok) throw new Error('Failed to fetch subscription data');
      
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

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/subscription/upgrade', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to upgrade');
      
      const result = await response.json();
      window.location.href = result.redirectUrl;
    } catch (err) {
      alert('فشل في الترقية');
    }
  };

  const handleCancel = async () => {
    if (!confirm('هل أنت متأكد من إلغاء الاشتراك؟')) return;
    
    try {
      const response = await fetch('/api/subscription/cancel', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to cancel');
      
      fetchSubscriptionData();
      alert('تم إلغاء الاشتراك بنجاح');
    } catch (err) {
      alert('فشل في إلغاء الاشتراك');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل بيانات الاشتراك...</p>
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
            onClick={fetchSubscriptionData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إعادة محاولة
          </button>
        </div>
      </div>
    );
  }

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch(plan) {
      case 'gold': return 'الخطة الذهبية';
      case 'silver': return 'الخطة الفضية';
      default: return 'الخطة الأساسية';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return 'نشط';
      case 'cancelled': return 'ملغي';
      case 'expired': return 'منتهي الصلاحية';
      default: return 'غير معروف';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">الاشتراك والفواتير</h1>
        <p className="mt-1 text-sm text-gray-500">إدارة خطتك والفواتير</p>
      </div>

      {/* Current Plan Card */}
      <div className={`bg-gradient-to-r ${getPlanColor(data.currentPlan)} text-white p-8 rounded-3xl shadow-2xl mb-8`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-lg font-bold opacity-90 mb-2">خطتك الحالية</p>
            <h2 className="text-5xl font-black mb-4">{getPlanLabel(data.currentPlan)}</h2>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  الحالة: <span className="font-bold">{getStatusLabel(data.status)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">
                  التجديد: <span className="font-bold">{new Date(data.renewalDate).toLocaleDateString('ar-SA')}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpgrade}
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
            >
              ترقية الخطة
            </button>
            {data.status === 'active' && (
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
              >
                إلغاء الاشتراك
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900">المرضى</h3>
          </div>
          <p className="text-3xl font-black text-blue-600 mb-2">
            {data.currentPlan === 'gold' ? '∞' : data.currentPlan === 'silver' ? '300' : '100'}
          </p>
          <p className="text-sm text-gray-600">مريض مسموح</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900">المواعيد</h3>
          </div>
          <p className="text-3xl font-black text-green-600 mb-2">
            {data.currentPlan === 'gold' ? '∞' : data.currentPlan === 'silver' ? '100' : '20'}
          </p>
          <p className="text-sm text-gray-600">موعد مسموح</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900">الأطباء</h3>
          </div>
          <p className="text-3xl font-black text-purple-600 mb-2">
            {data.currentPlan === 'gold' ? '∞' : data.currentPlan === 'silver' ? '20' : '5'}
          </p>
          <p className="text-sm text-gray-600">طبيب مسموح</p>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">سجل الفواتير</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-gray-600 font-bold">التاريخ</th>
                <th className="text-right py-3 px-4 text-gray-600 font-bold">المبلغ</th>
                <th className="text-right py-3 px-4 text-gray-600 font-bold">الحالة</th>
                <th className="text-right py-3 px-4 text-gray-600 font-bold">الفاتورة</th>
              </tr>
            </thead>
            <tbody>
              {data.billingHistory.map((bill, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{new Date(bill.date).toLocaleDateString('ar-SA')}</td>
                  <td className="py-3 px-4 text-gray-600 font-bold">{bill.amount.toLocaleString()} ر.س</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      bill.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bill.status === 'paid' ? 'مدفوع' : 'معلق'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 font-bold">
                      تحميل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
