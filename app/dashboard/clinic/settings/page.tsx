'use client';

import { useState, useEffect } from 'react';
import { clinicsDbHelpers } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Alert } from '@/components';

export default function SettingsPage() {
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
    description: '',
  });

  useEffect(() => {
    loadClinicData();
    // Load dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const loadClinicData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clinicsDbHelpers.getCurrentClinic();
      if (!result.success) {
        throw new Error(result.error || "فشل في استرجاع بيانات العيادة");
      }
      
      setClinic(result.data);
      setFormData({
        name: result.data?.name || '',
        email: result.data?.email || '',
        phone: result.data?.phone || '',
        website: result.data?.website || '',
        address: result.data?.address || '',
        city: result.data?.city || '',
        country: result.data?.country || 'Saudi Arabia',
        description: result.data?.description || '',
      });
    } catch (err: any) {
      setError(err.message || "حدث خطأ في تحميل البيانات");
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
      setError("يرجى ملء جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، الهاتف)");
      setSaving(false);
      return;
    }

    try {
      if (!clinic?.id) {
        throw new Error("لم يتم العثور على معرف العيادة");
      }

      const result = await clinicsDbHelpers.update(clinic.id, formData);
      if (!result.success) {
        throw new Error(result.error || "فشل في حفظ البيانات");
      }

      setClinic(result.data);
      setSuccess("تم حفظ البيانات بنجاح! ✅");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">جاري تحميل إعدادات العيادة...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 min-h-screen", darkMode ? "dark bg-gray-900" : "bg-gray-50")} dir="rtl">
      {/* Header with Dark Mode Toggle */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={cn("text-3xl font-extrabold tracking-tight", darkMode ? "text-white" : "text-gray-900")}>
            إعدادات العيادة
          </h1>
          <p className={cn("mt-1 text-sm", darkMode ? "text-gray-400" : "text-gray-500")}>
            إدارة بيانات عيادتك والإعدادات الأساسية
          </p>
        </div>
        <button
          onClick={toggleDarkMode}
          className={cn(
            "p-3 rounded-lg transition-all",
            darkMode
              ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
              : "bg-gray-800 text-yellow-400 hover:bg-gray-700"
          )}
          title={darkMode ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} />
        </div>
      )}

      {/* Main Form */}
      <div className={cn("rounded-2xl shadow-lg overflow-hidden", darkMode ? "bg-gray-800" : "bg-white")}>
        <form onSubmit={handleSave} className="p-8 space-y-8">
          {/* Section 1: Basic Information */}
          <div>
            <h2 className={cn("text-xl font-bold mb-6 pb-3 border-b-2 border-blue-500", darkMode ? "text-white" : "text-gray-900")}>
              المعلومات الأساسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinic Name */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                  اسم العيادة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="عيادة أحمد للأسنان"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  )}
                />
              </div>

              {/* Email */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  placeholder="clinic@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  )}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0501234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  )}
                />
              </div>

              {/* Website */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                  الموقع الإلكتروني
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div>
            <h2 className={cn("text-xl font-bold mb-6 pb-3 border-b-2 border-green-500", darkMode ? "text-white" : "text-gray-900")}>
              الموقع الجغرافي
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="md:col-span-2">
                <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                  العنوان
                </label>
                <input
                  type="text"
                  placeholder="شارع النيل، الحي الثاني"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all",
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  )}
                />
              </div>

              {/* City */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                  المدينة
                </label>
                <input
                  type="text"
                  placeholder="الرياض"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all",
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  )}
                />
              </div>

              {/* Country */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                  الدولة
                </label>
                <input
                  type="text"
                  placeholder="المملكة العربية السعودية"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all",
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Description */}
          <div>
            <h2 className={cn("text-xl font-bold mb-6 pb-3 border-b-2 border-purple-500", darkMode ? "text-white" : "text-gray-900")}>
              نبذة عن العيادة
            </h2>
            <div>
              <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                الوصف والخدمات
              </label>
              <textarea
                placeholder="اكتب نبذة عن عيادتك والخدمات التي تقدمها..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all",
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t-2" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95",
                saving
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
            <button
              type="button"
              onClick={loadClinicData}
              className={cn(
                "px-6 py-3 rounded-lg font-bold transition-all",
                darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              إعادة تحميل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
