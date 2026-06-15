"use client";
import { UserProfile, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [clinicData, setClinicData] = useState({
    name: "",
    phone: "",
    address: "",
    city: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch clinic data on load
  useEffect(() => {
    async function fetchClinic() {
      try {
        const res = await fetch("/api/clinic");
        if (res.ok) {
          const data = await res.json();
          setClinicData({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch clinic:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClinic();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/clinic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicData)
      });

      if (res.ok) {
        setMessage({ type: "success", text: "تم حفظ التغييرات بنجاح ✅" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "فشل الحفظ ❌" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ غير متوقع ❌" });
    } finally {
      setSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (!isLoaded || loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 h-64 bg-gray-200 rounded-2xl"></div>
        <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الإعدادات</h2>
          <p className="text-gray-500 mt-1">إدارة حسابك الشخصي وتفضيلات العيادة</p>
        </div>
        {message.text && (
          <div className={`px-4 py-2 rounded-xl text-sm font-bold animate-bounce ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Quick Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">إعدادات العيادة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العيادة</label>
                <input 
                  type="text" 
                  value={clinicData.name}
                  onChange={(e) => setClinicData({...clinicData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50" 
                  placeholder="عيادة الأمل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input 
                  type="tel" 
                  value={clinicData.phone}
                  onChange={(e) => setClinicData({...clinicData, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50" 
                  placeholder="05xxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input 
                  type="text" 
                  value={clinicData.address}
                  onChange={(e) => setClinicData({...clinicData, address: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50" 
                  placeholder="الشارع، الحي"
                />
              </div>
              <button 
                onClick={handleSave}
                disabled={saving}
                className={`w-full text-white py-3 rounded-xl font-bold transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 ${
                  saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الحفظ...
                  </>
                ) : "حفظ التغييرات"}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">المظهر</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-700">الوضع الليلي</span>
              <button className="w-10 h-6 bg-gray-200 rounded-full relative transition-colors duration-200">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Clerk UserProfile */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">الملف الشخصي والأمان</h3>
              <p className="text-xs text-gray-500">يتم إدارة هذه البيانات بأمان عبر Clerk</p>
            </div>
            <div className="p-2 overflow-x-auto">
              <UserProfile 
                appearance={{
                  elements: {
                    rootBox: "w-full shadow-none",
                    card: "shadow-none border-none w-full",
                    navbar: "hidden md:flex",
                    scrollBox: "border-none",
                    pageScrollBox: "p-4",
                    headerTitle: "text-xl font-bold",
                    headerSubtitle: "text-gray-500",
                    profileSectionTitleText: "text-blue-600 font-bold",
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
