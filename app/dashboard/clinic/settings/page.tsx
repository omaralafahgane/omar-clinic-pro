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
        console.log('[Settings] Checking clinic status...');
        const res = await fetch('/api/clinic', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('[Settings] API Response Status:', res.status);
        const data = await res.json();
        console.log('[Settings] API Response Data:', data);

        if (res.ok && data.success && data.data) {
          console.log('[Settings] Clinic exists, redirecting to subscription...');
          router.replace('/dashboard/clinic/subscription');
        } else if (data.requiresSetup) {
          console.log('[Settings] Clinic setup required, showing form...');
          setInitialLoading(false);
        } else {
          console.log('[Settings] Unexpected response:', data);
          setInitialLoading(false);
        }
      } catch (err) {
        console.error('[Settings] Error checking clinic:', err);
        setInitialLoading(false);
      }
    }
    checkClinic();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[Settings] Submitting clinic data:', formData);
      
      const response = await fetch('/api/clinic', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('[Settings] Save Response Status:', response.status);
      const responseData = await response.json();
      console.log('[Settings] Save Response Data:', responseData);

      if (response.ok && responseData.success) {
        console.log('[Settings] Save successful, redirecting...');
        toast.success('تم حفظ بيانات العيادة بنجاح');
        // Use hard redirect to clear any cached state
        window.location.href = '/dashboard/clinic/subscription';
      } else {
        const errorMsg = responseData.error || 'فشل حفظ البيانات';
        console.error('[Settings] Save failed:', errorMsg);
        toast.error(`خطأ: ${errorMsg}`);
      }
    } catch (error) {
      console.error('[Settings] Exception during save:', error);
      toast.error(`خطأ في الاتصال: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 text-right">إعدادات العيادة</h1>
        <p className="text-gray-600 text-right mb-8">يرجى ملء بيانات عيادتك لتفعيل النظام</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم العيادة *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="مثال: عيادة الدكتور أحمد"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني للعيادة *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="info@clinic.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+962 79 1234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="شارع الملك عبدالله"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المدينة *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="عمّان"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الدولة</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="الأردن">الأردن</option>
              <option value="السعودية">السعودية</option>
              <option value="الإمارات">الإمارات</option>
              <option value="مصر">مصر</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (اختياري)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="نبذة عن عيادتك..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'جاري الحفظ والتفعيل...' : 'حفظ وتفعيل النظام'}
          </button>
        </form>
      </div>
    </div>
  );
}
