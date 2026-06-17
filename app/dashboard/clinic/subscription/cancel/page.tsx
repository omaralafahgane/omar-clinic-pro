'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function CancelSubscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState<'confirm' | 'reason' | 'success'>('confirm');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = [
    'السعر مرتفع جداً',
    'لا أحتاج الخدمة حالياً',
    'وجدت بديل أفضل',
    'مشاكل تقنية',
    'أخرى'
  ];

  const handleCancel = async () => {
    if (!reason) {
      setError('يرجى اختيار سبب الإلغاء');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('فشل إلغاء الاشتراك');
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900">إلغاء الاشتراك</h1>
        </div>

        {step === 'confirm' && (
          <>
            {/* Warning Card */}
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <AlertCircle className="w-5 h-5" />
                  قبل أن تغادر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-yellow-800">
                <p>عند إلغاء الاشتراك:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>ستفقد الوصول إلى لوحة التحكم فوراً</li>
                  <li>سيتم حذف جميع البيانات بعد 30 يوماً</li>
                  <li>لن تتمكن من استرجاع البيانات بعد الحذف</li>
                  <li>لن يتم استرجاع أي رسوم مدفوعة</li>
                </ul>
              </CardContent>
            </Card>

            {/* Confirmation Card */}
            <Card>
              <CardHeader>
                <CardTitle>هل أنت متأكد؟</CardTitle>
                <CardDescription>
                  يمكنك تعليق الاشتراك مؤقتاً بدلاً من الإلغاء النهائي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-900 text-sm">
                    💡 <strong>نصيحة:</strong> إذا كنت تواجه مشاكل أو تريد خطة أرخص، يمكنك الاتصال بفريق الدعم أولاً.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    العودة للخلف
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setStep('reason')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    متابعة الإلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {step === 'reason' && (
          <Card>
            <CardHeader>
              <CardTitle>لماذا تريد إلغاء الاشتراك؟</CardTitle>
              <CardDescription>
                رأيك مهم لنا ويساعدنا على تحسين الخدمة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Reason Selection */}
              <div className="space-y-3">
                {reasons.map((r) => (
                  <label key={r} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">{r}</span>
                  </label>
                ))}
              </div>

              {/* Additional Comments */}
              {reason === 'أخرى' && (
                <textarea
                  placeholder="يرجى إخبارنا بالمزيد..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('confirm')}
                >
                  العودة
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={loading || !reason}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإلغاء...
                    </>
                  ) : (
                    'تأكيد الإلغاء'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">تم إلغاء الاشتراك</h2>
                <p className="text-green-800">
                  سيتم حذف جميع بيانات عيادتك بعد 30 يوماً. يمكنك استرجاع الاشتراك خلال هذه الفترة.
                </p>
              </div>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-green-600 hover:bg-green-700"
              >
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
