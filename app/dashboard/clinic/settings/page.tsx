'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Alert } from '@/components';

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
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
    country: 'الأردن',
    description: '',
  });

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      loadClinicData();
    }
    // Load dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, [isClerkLoaded, clerkUser]);

  const loadClinicData = async () => {
    if (!clerkUser) return;
    setLoading(true);
    setError(null);
    try {
      // Use the API endpoint instead of direct DB helper for better consistency
      const response = await fetch('/api/clinic');
      
      if (response.status === 206) {
        // Setup required - no clinic yet, this is fine for new users
        setLoading(false);
        return;
      }

      if (!response.ok && response.status !== 402) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "فشل في استرجاع بيانات العيادة");
      }
      
      const data = await response.json();
      // API might return payment required error but still give clinic data if it exists
      const clinicData = data.data || data;
      
      if (clinicData && clinicData.id) {
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

    if (!formData.name || !formData.email || !formData.phone || !formData.description || !formData.address || !formData.city) {
      setError("يرجى ملء جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، الهاتف، العنوان، المدينة، والنبذة)");
      setSaving(false);
      return;
    }

    try {
      // Use the API PATCH endpoint which handles both CREATE and UPDATE
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
      setSuccess("تم حفظ البيانات بنجاح! ✅");
      
      // If this was the first time setup, refresh after a delay to update layout state
      if (result.message?.includes("قاعدة البيانات") || !clinic) {
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setTimeout(() => setSuccess(null), 3000);
      }
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

  if (loading || !isClerkLoaded) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400 font-medium">جاري تحميل إعدادات العيادة...</span>
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

      <div className={cn("rounded-3xl shadow-xl overflow-hidden border", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={cn("text-sm font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>اسم العيادة *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn("w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-100 outline-none", 
                  darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-600")}
                placeholder="مثلاً: عيادة الأمل الطبية"
              />
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>البريد الإلكتروني *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={cn("w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-100 outline-none", 
                  darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-600")}
                placeholder="clinic@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>رقم الهاتف *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={cn("w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-100 outline-none", 
                  darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-600")}
                placeholder="07XXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>الموقع الإلكتروني</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className={cn("w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-100 outline-none", 
                  darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-600")}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>المدينة *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={cn("w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-100 outline-none", 
                  darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-600")}
                placeholder="مثلاً: عمان"
              />
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>الدولة</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={cn("w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-100 outline-none appearance-none", 
                  darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-600")}
              >
                <option value="الأردن">الأردن</option>
                <option value="السعودية">السعودية</option>
                <option value="فلسطين">فلسطين</option>
                <option value="الإمارات">الإمارات</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={cn("text-sm font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>العنوان التفصيلي *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={cn("w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-100 outline-none", 
                darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-600")}
              placeholder="الشارع، البناية، رقم الطابق"
            />
          </div>

          <div className="space-y-2">
            <label className={cn("text-sm font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>نبذة عن العيادة *</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={cn("w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-100 outline-none resize-none", 
                darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-600")}
              placeholder="اكتب وصفاً مختصراً للخدمات التي تقدمها العيادة..."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className={cn("w-full md:w-auto px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl disabled:opacity-50",
                darkMode ? "bg-blue-500 text-white hover:bg-blue-400 shadow-blue-900/20" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200")}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري الحفظ...
                </div>
              ) : "حفظ الإعدادات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
