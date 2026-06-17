'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2, Check } from 'lucide-react';

const PLANS = [
  {
    id: 'basic',
    name: 'الخطة الأساسية',
    price: 19,
    currency: 'JOD',
    description: 'مثالية للعيادات الصغيرة',
    features: [
      '100 مريض',
      '20 موعد يومي',
      'دعم فني أساسي',
      'تقارير بسيطة',
      'نسخ احتياطي يومي'
    ]
  },
  {
    id: 'silver',
    name: 'الخطة الفضية',
    price: 49,
    currency: 'JOD',
    description: 'للعيادات المتوسطة',
    features: [
      '300 مريض',
      '100 موعد يومي',
      'دعم فني 24/7',
      'تقارير مالية متقدمة',
      'نسخ احتياطي يومي',
      'بوابة مريض أساسية'
    ],
    recommended: true
  },
  {
    id: 'gold',
    name: 'الخطة الذهبية',
    price: 99,
    currency: 'JOD',
    description: 'للعيادات الكبيرة والمتخصصة',
    features: [
      'مرضى غير محدود',
      'مواعيد غير محدودة',
      'دعم فني أولويات عالية',
      'تقارير وتحليلات شاملة',
      'نسخ احتياطي كل ساعة',
      'بوابة مريض متقدمة',
      'تكامل مع أنظمة خارجية'
    ]
  }
];

export default function UpgradePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);
    setError(null);

    try {
      // Redirect to Shopify checkout or payment gateway
      // For now, we'll call the activation API
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId })
      });

      if (!response.ok) {
        throw new Error('فشل تفعيل الخطة الجديدة');
      }

      // In production, redirect to Shopify checkout
      // window.location.href = `${process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_URL}?plan=${planId}`;
      
      // For now, show success and redirect
      router.push('/dashboard/clinic/subscription?upgraded=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">ترقية خطتك</h1>
          <p className="text-gray-600 mt-2">اختر الخطة المناسبة لعيادتك واستمتع بمميزات إضافية</p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all ${
                plan.recommended ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                  موصى به
                </div>
              )}
              
              <CardHeader className={plan.recommended ? 'pt-12' : ''}>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.currency}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">شهري</p>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading && selectedPlan === plan.id}
                  className={`w-full ${
                    plan.recommended
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    'اختر هذه الخطة'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>مقارنة الخطط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-medium">الميزة</th>
                    {PLANS.map((plan) => (
                      <th key={plan.id} className="text-center py-3 px-4 font-medium">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="text-right py-3 px-4 font-medium">عدد المرضى</td>
                    <td className="text-center py-3 px-4">100</td>
                    <td className="text-center py-3 px-4">300</td>
                    <td className="text-center py-3 px-4">غير محدود</td>
                  </tr>
                  <tr className="border-b">
                    <td className="text-right py-3 px-4 font-medium">المواعيد اليومية</td>
                    <td className="text-center py-3 px-4">20</td>
                    <td className="text-center py-3 px-4">100</td>
                    <td className="text-center py-3 px-4">غير محدود</td>
                  </tr>
                  <tr className="border-b">
                    <td className="text-right py-3 px-4 font-medium">الدعم الفني</td>
                    <td className="text-center py-3 px-4">أساسي</td>
                    <td className="text-center py-3 px-4">24/7</td>
                    <td className="text-center py-3 px-4">أولويات عالية</td>
                  </tr>
                  <tr className="border-b">
                    <td className="text-right py-3 px-4 font-medium">بوابة المريض</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓ متقدمة</td>
                  </tr>
                  <tr>
                    <td className="text-right py-3 px-4 font-medium">التكامل الخارجي</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">الأسئلة الشائعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل يمكنني تغيير الخطة لاحقاً؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">نعم، يمكنك ترقية أو تنزيل خطتك في أي وقت. سيتم حساب الفرق بناءً على الأيام المتبقية.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل هناك فترة تجريبية؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">لا، يجب الدفع فوراً لتفعيل الحساب. لكن يمكنك إلغاء الاشتراك في أي وقت.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ماذا عن الفاتورة؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">ستتلقى فاتورة شهرية تلقائياً. يمكنك تحميل جميع الفواتير من صفحة الاشتراك.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل هناك عقد طويل الأجل؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">لا، اشتراك شهري مرن بدون التزامات طويلة الأجل.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
