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
        const res = await fetch('/api/clinic');
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          // If clinic exists, move to subscription
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
      const response = await fetch('/api/clinic', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        toast.success('تم حفظ بيانات العيادة بنجاح');
        // FORCE REDIRECT - NO CACHE
        setTimeout(() => {
          window.location.href = '/dashboard/clinic/subscription';
        }, 1000);
      } else {
        toast.error(responseData.error || 'فشل حفظ البيانات');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">إعدادات العيادة</h1>
          <p className="text-gray-500">يرجى ملء بيانات عيادتك لتفعيل النظام والبدء</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم العيادة *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="مثال: عيادة الأمل"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="info@clinic.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="+962 7X XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المدينة *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="عمّان"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">العنوان الكامل *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="الشارع، البناية، الطابق"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الوصف (اختياري)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="نبذة بسيطة عن تخصص العيادة..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-lg shadow-blue-500/30"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ وتفعيل النظام'}
          </button>
        </form>
      </div>
    </div>
  );
}
