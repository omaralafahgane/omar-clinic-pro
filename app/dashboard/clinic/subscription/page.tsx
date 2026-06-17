'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SubscriptionData {
  currentPlan: string;
  status: string;
  renewalDate: string;
  price: number;
  currency: string;
  billingCycle: string;
  billingHistory: Array<{
    id: string;
    number: string;
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

  const handleAction = (action: string) => {
    alert(`جاري تنفيذ ${action}... سيتم توجيهك إلى بوابة الدفع.`);
    // Here we would redirect to Shopify/PayPal/Stripe
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل بيانات الاشتراك...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <p className="text-red-600 font-bold mb-4">{error || 'فشل في تحميل البيانات'}</p>
        <button
          onClick={fetchSubscriptionData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          إعادة محاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة الاشتراك</h1>
        <p className="text-gray-500 mt-1">عرض تفاصيل خطتك الحالية وسجل المدفوعات</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">الخطة الحالية</span>
                {data.status === 'active' && (
                  <span className="bg-green-400/20 text-green-100 px-3 py-1 rounded-full text-xs font-bold">نشط</span>
                )}
              </div>
              <h2 className="text-5xl font-black mb-2">{data.currentPlan}</h2>
              <p className="text-blue-100 font-medium">
                تاريخ التجديد القادم: {formatDate(new Date(data.renewalDate))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black">{formatCurrency(data.price)}</p>
              <p className="text-blue-100 text-sm">لكل {data.billingCycle === 'monthly' ? 'شهر' : 'سنة'}</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 flex flex-wrap gap-4 border-t border-gray-50">
          <button 
            onClick={() => handleAction('ترقية الخطة')}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            ترقية الخطة (Upgrade)
          </button>
          <button 
            onClick={() => handleAction('إلغاء الاشتراك')}
            className="px-8 py-3 bg-white text-red-600 border border-red-100 rounded-2xl font-bold hover:bg-red-50 transition-all"
          >
            إلغاء الاشتراك (Cancel)
          </button>
          <button 
            onClick={() => handleAction('سجل الفواتير')}
            className="px-8 py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all"
          >
            سجل الفواتير (Billing History)
          </button>
        </div>
      </div>

      {/* Billing History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-xl font-bold text-gray-900">سجل المدفوعات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="px-6 py-4 font-bold">رقم الفاتورة</th>
                <th className="px-6 py-4 font-bold">التاريخ</th>
                <th className="px-6 py-4 font-bold">المبلغ</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.billingHistory.length > 0 ? (
                data.billingHistory.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{invoice.number}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(new Date(invoice.date))}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(invoice.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {invoice.status === 'paid' ? 'مدفوع' : 'معلق'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 font-bold hover:underline text-sm">تحميل PDF</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">لا يوجد سجل مدفوعات حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
