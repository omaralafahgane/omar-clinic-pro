'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function ClinicSettingsPage() {
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

  useEffect(() => {
    async function checkClinic() {
      try {
        const res = await fetch('/api/clinic-v2?t=' + Date.now());
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          // If clinic already exists and has subscription, redirect to dashboard
          const subRes = await fetch('/api/subscription');
          const subData = await subRes.json();
          
          if (subRes.ok && subData.success && subData.data?.status === 'active') {
            // Has active subscription, go to dashboard
            window.location.href = '/dashboard/clinic';
          } else {
            // Has clinic but no active subscription, go to subscription page
            window.location.href = '/dashboard/clinic/subscription';
          }
        } else {
          // No clinic, show setup form
          setInitialLoading(false);
        }
      } catch (err) {
        console.error('Error checking clinic:', err);
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
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('يرجى إدخال بريد إلكتروني صحيح');
        setLoading(false);
        return;
      }

      toast.loading('جاري حفظ البيانات...');

      const response = await fetch('/api/clinic-v2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      if (!response.ok && response.status !== 402) {
        console.error('Server error:', responseData);
        toast.error(responseData.error || 'فشل حفظ البيانات. يرجى المحاولة مرة أخرى');
        setLoading(false);
        return;
      }

      if (responseData.success) {
        toast.success('تم حفظ البيانات بنجاح! جاري الانتقال لصفحة الاشتراك...');
        // Add a small delay to ensure data is persisted
        setTimeout(() => {
          // Force a hard redirect to bypass any caching
          window.location.href = '/dashboard/clinic/subscription?setup=true&t=' + Date.now();
        }, 1500);
      } else {
        toast.error(responseData.error || 'فشل حفظ البيانات');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error('خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-blue-600 p-8 text-white text-center">
            <h1 className="text-3xl font-black mb-2">إعداد العيادة</h1>
            <p className="opacity-90">يرجى إكمال البيانات للانتقال لخطوة الاشتراك</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-1">اسم العيادة *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
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
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg text-left"
                  dir="ltr"
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 mr-1">العنوان *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-slate-300"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ البيانات واختيار الاشتراك'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
