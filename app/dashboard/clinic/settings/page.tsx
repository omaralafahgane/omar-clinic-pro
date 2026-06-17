'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: 'الأردن',
    description: '',
  });

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      loadClinicData();
    }
  }, [isClerkLoaded, clerkUser]);

  const loadClinicData = async () => {
    if (!clerkUser) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/clinic');
      
      if (response.status === 206) {
        // Setup required - new user
        setLoading(false);
        return;
      }

      const result = await response.json();
      
      if (response.ok) {
        const clinicData = result;
        setClinic(clinicData);
        setFormData({
          name: clinicData.name || '',
          email: clinicData.email || '',
          phone: clinicData.phone || '',
          website: clinicData.website || '',
          address: clinicData.address || '',
          city: clinicData.city || '',
          country: clinicData.country || 'الأردن',
          description: clinicData.description || '',
        });
      }
    } catch (err: any) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.email || !formData.phone) {
      setError("يرجى ملء الحقول الأساسية (الاسم، البريد الإلكتروني، الهاتف)");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/clinic', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل في حفظ البيانات");
      }

      setClinic(result.data);
      setSuccess("تم حفظ بيانات العيادة بنجاح! ✅");
      
      // Refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isClerkLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      <Header />

      <main className="mr-64 mt-16 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900">إعدادات العيادة</h1>
            <p className="text-gray-600 mt-2">قم بضبط بيانات عيادتك الأساسية لتفعيل النظام</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 font-bold rounded-lg shadow-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-r-4 border-green-500 text-green-700 font-bold rounded-lg shadow-sm">
              {success}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <form onSubmit={handleSave} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">اسم العيادة *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="مثلاً: عيادة الشفاء"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">البريد الإلكتروني للعيادة *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="clinic@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">رقم الهاتف *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="07XXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">الموقع الإلكتروني</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">المدينة *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="مثلاً: عمان"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">الدولة</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none"
                  >
                    <option value="الأردن">الأردن</option>
                    <option value="السعودية">السعودية</option>
                    <option value="فلسطين">فلسطين</option>
                    <option value="الإمارات">الإمارات</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">العنوان التفصيلي</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="الشارع، البناية، الطابق"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">وصف مختصر للعيادة</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
                  placeholder="اكتب نبذة عن تخصص العيادة والخدمات..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : "حفظ بيانات العيادة وتفعيل النظام"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
