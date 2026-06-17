'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function ClinicSettingsPageV2() {
  const router = useRouter();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'الأردن',
    description: ''
  });

  // VERSION 2.0 - CACHE BREAKER
  useEffect(() => {
    async function checkClinic() {
      try {
        // Use v2 API to bypass cache
        const res = await fetch('/api/clinic-v2?t=' + Date.now());
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          window.location.href = '/dashboard/clinic/subscription';
        } else {
          setInitialLoading(false);
        }
      } catch (err) {
        setInitialLoading(false);
      }
    }
    checkClinic();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/clinic-v2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        toast.success('تم التفعيل بنجاح! جاري التوجيه...');
        setTimeout(() => {
          window.location.href = '/dashboard/clinic/subscription';
        }, 1500);
      } else {
        toast.error(responseData.error || 'فشل في حفظ البيانات');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-blue-600 font-black">جاري تحضير النظام (V2)...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-blue-600 p-8 text-white text-center">
            <h1 className="text-3xl font-black mb-2">تفعيل عيادة Omar Clinic Pro</h1>
            <p className="opacity-90">أدخل بيانات عيادتك لمرة واحدة فقط للبدء</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-1">اسم العيادة الرسمية *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
                  placeholder="مثال: مجمع الشفاء الطبي"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
                  placeholder="clinic@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-1">رقم التواصل الأردني *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg text-left"
                  placeholder="07XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-1">المدينة *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
                  placeholder="عمّان، الزرقاء، إربد..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 mr-1">العنوان التفصيلي *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
                placeholder="اسم الشارع، رقم البناية"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? 'جاري تفعيل النظام...' : 'تأكيد البيانات والبدء فوراً'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
