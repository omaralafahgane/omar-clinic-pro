"use client";
import { UserProfile, useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">الإعدادات</h2>
        <p className="text-gray-500 mt-1">إدارة حسابك الشخصي وتفضيلات العيادة</p>
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
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                  placeholder="عيادة الأمل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                  placeholder="05xxxxxxx"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                حفظ التغييرات
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
