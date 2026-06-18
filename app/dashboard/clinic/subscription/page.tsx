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
  const [isNewSetup, setIsNewSetup] = useState(false);

  useEffect(() => {
    // Check if this is a new setup (coming from clinic settings page)
    const params = new URLSearchParams(window.location.search);
    if (params.get('setup') === 'true') {
      setIsNewSetup(true);
    }
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription?t=' + Date.now());
      if (!response.ok) {
        // If subscription fetch fails, create a default data object for new setup
        const params = new URLSearchParams(window.location.search);
        if (params.get('setup') === 'true') {
          setData({
            currentPlan: 'none',
            status: 'inactive',
            renewalDate: new Date().toISOString(),
            price: 0,
            currency: 'sar',
            billingCycle: 'month',
            billingHistory: []
          });
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch subscription data');
      }
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        // If no subscription exists, show default data
        setData({
          currentPlan: 'none',
          status: 'inactive',
          renewalDate: new Date().toISOString(),
          price: 0,
          currency: 'sar',
          billingCycle: 'month',
          billingHistory: []
        });
      }
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      // Don't show error, just show default data
      setData({
        currentPlan: 'none',
        status: 'inactive',
        renewalDate: new Date().toISOString(),
        price: 0,
        currency: 'sar',
        billingCycle: 'month',
        billingHistory: []
      });
    } finally {
      setLoading(false);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (plan: string) => {
    setIsProcessing(true);
    try {
      // Create checkout session with Stripe
      const res = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan })
      });
      
      const result = await res.json();
      
      if (res.ok && result.sessionId) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        // Fallback to mock activation if Stripe is not configured
        const activateRes = await fetch('/api/subscription/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan })
        });
        
        if (activateRes.ok) {
          alert('تم تفعيل الاشتراك بنجاح! سيتم توجيهك للوحة التحكم.');
          window.location.href = '/dashboard/clinic';
        } else {
          throw new Error('فشل تفعيل الاشتراك');
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      alert(err.message || 'حدث خطأ أثناء معالجة الدفع');
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    { id: 'basic', name: 'الخطة الأساسية', price: 99, features: ['حتى 50 مريض', 'حتى 5 أطباء', 'إدارة المواعيد الأساسية'] },
    { id: 'professional', name: 'الخطة الاحترافية', price: 299, features: ['حتى 500 مريض', 'حتى 20 طبيب', 'إدارة متقدمة للمواعيد', 'التقارير المتقدمة'] },
    { id: 'enterprise', name: 'الخطة المؤسسية', price: 999, features: ['عدد غير محدود من المرضى', 'عدد غير محدود من الأطباء', 'جميع الميزات', 'دعم فني 24/7'] },
  ];

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

  if (!data) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <p className="text-red-600 font-bold mb-4">فشل في تحميل البيانات</p>
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

      {/* Current Status Banner if inactive */}
      {data.status !== 'active' && (
        <div className={`border-2 p-6 rounded-3xl flex items-center gap-4 ${
          isNewSetup 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isNewSetup 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-yellow-100 text-yellow-600'
          }`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-lg font-bold ${
              isNewSetup 
                ? 'text-blue-900' 
                : 'text-yellow-900'
            }`}>
              {isNewSetup ? 'تم حفظ بيانات العيادة بنجاح!' : 'الدفع مطلوب لتفعيل الحساب'}
            </h3>
            <p className={isNewSetup ? 'text-blue-700' : 'text-yellow-700'}>
              {isNewSetup 
                ? 'الآن يرجى اختيار خطة الاشتراك المناسبة لعيادتك للبدء فوراً.' 
                : 'لا تتوفر فترة تجريبية حالياً. يرجى اختيار خطة والبدء فوراً للوصول لكافة مميزات العيادة.'}
            </p>
          </div>
        </div>
      )}

      {/* Plan Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-[40px] p-8 border-2 transition-all hover:shadow-2xl ${
            data.currentPlan === plan.id ? 'border-blue-600 shadow-xl' : 'border-gray-100 hover:border-blue-200'
          }`}>
            <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-blue-600">{plan.price}</span>
              <span className="text-gray-500 font-bold">د.أ / شهر</span>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600 font-medium">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              disabled={isProcessing || data.currentPlan === plan.id}
              onClick={() => handlePayment(plan.id)}
              className={`w-full py-4 rounded-2xl font-bold transition-all ${
                data.currentPlan === plan.id 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
              }`}
            >
              {isProcessing ? 'جاري المعالجة...' : data.currentPlan === plan.id ? 'خطتك الحالية' : 'اشترك الآن'}
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {data.status === 'active' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">الإجراءات</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href="/dashboard/clinic/subscription/upgrade"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              ترقية الخطة
            </a>
            <a
              href="/dashboard/clinic/subscription/cancel"
              className="px-6 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              إلغاء الاشتراك
            </a>
          </div>
        </div>
      )}

      {/* Billing History Table */}
      {data.billingHistory.length > 0 && (
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
                {data.billingHistory.map((invoice) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
