"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function ClinicSettingsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [clinicData, setClinicData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "SA",
    website: "",
    description: "",
  });

  // Initialize dark mode from localStorage
  useEffect(() => {
    const darkModeEnabled = localStorage.getItem("darkMode") === "true";
    setDarkMode(darkModeEnabled);
    if (darkModeEnabled) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Fetch clinic data on mount
  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const res = await fetch("/api/clinic");
        if (res.ok) {
          const data = await res.json();
          setClinicData({
            name: data.name || "",
            email: data.email || user?.primaryEmailAddress?.emailAddress || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            country: data.country || "SA",
            website: data.website || "",
            description: data.description || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch clinic:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClinicData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/clinic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicData),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "تم حفظ البيانات بنجاح ✅" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: `فشل الحفظ: ${err.error || "حاول مرة أخرى"}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ غير متوقع ❌" });
    } finally {
      setSaving(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">إعدادات العيادة</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">إدارة معلومات عيادتك والإعدادات العامة</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title={darkMode ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي"}
        >
          {darkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414a1 1 0 00-1.414 1.414zm2.828-2.828l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414a1 1 0 001.414 1.414zm0-4.242L13.536 5.464a1 1 0 001.414-1.414L14.95 6.364a1 1 0 10-1.414 1.414zM5.464 5.464a1 1 0 001.414-1.414L5.464 2.636a1 1 0 00-1.414 1.414l1.414 1.414zM3 8a1 1 0 110 2H1a1 1 0 110-2h2zm14 0a1 1 0 110 2h2a1 1 0 110-2h-2zM3.464 14.536a1 1 0 00-1.414 1.414l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414zm11.314-1.414a1 1 0 00-1.414 1.414l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414z" clipRule="evenodd"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
            </svg>
            المعلومات الأساسية
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Clinic Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                اسم العيادة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={clinicData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم العيادة"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={clinicData.email}
                onChange={handleInputChange}
                placeholder="البريد الإلكتروني"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                name="phone"
                value={clinicData.phone}
                onChange={handleInputChange}
                placeholder="مثال: 0501234567"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                الموقع الإلكتروني
              </label>
              <input
                type="url"
                name="website"
                value={clinicData.website}
                onChange={handleInputChange}
                placeholder="مثال: www.clinic.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
            معلومات الموقع
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                العنوان
              </label>
              <input
                type="text"
                name="address"
                value={clinicData.address}
                onChange={handleInputChange}
                placeholder="الشارع والحي"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                المدينة
              </label>
              <input
                type="text"
                name="city"
                value={clinicData.city}
                onChange={handleInputChange}
                placeholder="المدينة"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                الدولة
              </label>
              <select
                name="country"
                value={clinicData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="SA">السعودية</option>
                <option value="AE">الإمارات</option>
                <option value="KW">الكويت</option>
                <option value="QA">قطر</option>
                <option value="BH">البحرين</option>
                <option value="OM">عمان</option>
                <option value="YE">اليمن</option>
                <option value="JO">الأردن</option>
                <option value="SY">سوريا</option>
                <option value="LB">لبنان</option>
                <option value="PS">فلسطين</option>
                <option value="IL">إسرائيل</option>
                <option value="IQ">العراق</option>
                <option value="EG">مصر</option>
                <option value="LY">ليبيا</option>
                <option value="TN">تونس</option>
                <option value="DZ">الجزائر</option>
                <option value="MA">المغرب</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"></path>
            </svg>
            نبذة عن العيادة
          </h3>

          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            الوصف
          </label>
          <textarea
            name="description"
            value={clinicData.description}
            onChange={handleInputChange}
            placeholder="أضف وصفاً عن عيادتك، تخصصاتك، والخدمات التي تقدمها"
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                جاري الحفظ...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M19.414 3.586a2 2 0 00-2.828 0L7 13.172V16h2.828l9.586-9.586a2 2 0 000-2.828z"></path>
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path>
                </svg>
                حفظ البيانات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
