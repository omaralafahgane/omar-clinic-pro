'use client';

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const router = useRouter();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.exists) {
        // User exists, redirect to login
        router.push(`/login?email=${encodeURIComponent(email)}`);
      } else {
        // User does not exist, show account creation message
        setMessage({
          type: 'error',
          text: 'هذا البريد الإلكتروني غير مسجل لدينا. يرجى إنشاء حساب جديد للمتابعة.'
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'حدث خطأ أثناء التحقق من البريد الإلكتروني. يرجى المحاولة مرة أخرى.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <span className="text-white font-black text-xl">OCP</span>
              </div>
              <span className="font-black text-2xl text-gray-900 tracking-tight">Omar Clinic Pro</span>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/login" 
                className="text-gray-600 font-bold hover:text-blue-600 transition-colors py-2 px-4"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/login"
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-[1.1]">
              إدارة عيادتك أصبحت <span className="text-blue-600">أذكى وأسهل</span>
            </h1>
            <p className="text-xl text-gray-500 mb-12 leading-relaxed font-medium">
              نظام متكامل يجمع بين إدارة المرضى، جدولة المواعيد الذكية، والفوترة المالية الاحترافية في منصة واحدة مصممة للعيادات العصرية.
            </p>

            {/* Email Check Form */}
            <div className="max-w-xl mx-auto mb-12">
              <form onSubmit={handleCheckEmail} className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني للمتابعة..."
                  className="w-full pl-4 pr-44 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-lg font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all shadow-2xl shadow-gray-100"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute left-2 top-2 bottom-2 px-8 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'جاري التحقق...' : 'متابعة'}
                </button>
              </form>
              
              {message && (
                <div className={cn(
                  "mt-4 p-4 rounded-2xl font-bold text-sm animate-in fade-in slide-in-from-top-2",
                  message.type === 'error' ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                )}>
                  <div className="flex items-center justify-center gap-2">
                    {message.type === 'error' ? '⚠️' : '✅'}
                    {message.text}
                    {message.type === 'error' && (
                      <Link href="/login" className="underline mr-2 hover:text-red-700">إنشاء حساب الآن</Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 font-bold text-sm uppercase tracking-widest">
              <span>✓ إدارة مرضى</span>
              <span>✓ تقارير مالية</span>
              <span>✓ مواعيد ذكية</span>
              <span>✓ بوابة مرضى</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "لوحة تحكم ذكية",
                description: "راقب أداء عيادتك لحظة بلحظة مع رسوم بيانية تفاعلية وإحصائيات دقيقة للإيرادات والمواعيد.",
                icon: "📊"
              },
              {
                title: "بوابة المريض المتطورة",
                description: "امنح مرضاك القدرة على متابعة سجلاتهم، تحميل الأشعة، والاطلاع على مواعيدهم وفواتيرهم.",
                icon: "🏥"
              },
              {
                title: "نظام مالي احترافي",
                description: "إدارة الفواتير، تتبع الدفعات المعلقة، وتصدير التقارير المالية المتوافقة مع المعايير.",
                icon: "💰"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 transition-all group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{feature.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">OCP</span>
            </div>
            <span className="font-black text-xl text-gray-900">Omar Clinic Pro</span>
          </div>
          <p className="text-gray-400 font-bold text-sm">
            &copy; 2026 Omar Clinic Pro. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-900 font-bold text-sm">الخصوصية</Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-900 font-bold text-sm">الشروط</Link>
            <Link href="/contact" className="text-gray-400 hover:text-gray-900 font-bold text-sm">اتصل بنا</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
