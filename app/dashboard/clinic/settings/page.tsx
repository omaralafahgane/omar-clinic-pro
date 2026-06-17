'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
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
      fetch('/api/clinic')
        .then(res => res.json())
        .then(result => {
          if (result.success && result.data) {
            const d = result.data;
            setFormData({
              name: d.name || '',
              email: d.email || '',
              phone: d.phone || '',
              website: d.website || '',
              address: d.address || '',
              city: d.city || '',
              country: d.country || 'الأردن',
              description: d.description || '',
            });
          }
        })
        .catch(err => console.error("Error loading clinic:", err))
        .finally(() => setLoading(false));
    }
  }, [isClerkLoaded, clerkUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/clinic', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccess("تم حفظ البيانات بنجاح! ✅");
        setTimeout(() => window.location.href = '/dashboard/clinic', 1500);
      } else {
        setError(result.error || "فشل في حفظ البيانات");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isClerkLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      <Header />
      <main className="mr-64 mt-16 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-gray-900 mb-2">إعدادات العيادة</h1>
          <p className="text-gray-600 mb-8">يرجى إكمال بيانات عيادتك الأساسية</p>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border-r-4 border-red-500 font-bold">{error}</div>}
          {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border-r-4 border-green-500 font-bold">{success}</div>}

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اسم العيادة *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف *</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">المدينة *</label>
                  <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">وصف العيادة</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 outline-none resize-none" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-500/30 disabled:opacity-50">
                {saving ? "جاري الحفظ..." : "حفظ وتفعيل النظام"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
