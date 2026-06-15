"use client";
import Link from "next/link";
import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClinicDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [showSetupAlert, setShowSetupAlert] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  const navItems = [
    { label: "لوحة التحكم", href: "/dashboard/clinic" },
    { label: "المرضى", href: "/dashboard/clinic/patients" },
    { label: "المواعيد", href: "/dashboard/clinic/appointments" },
    { label: "الفواتير", href: "/dashboard/clinic/invoices" },
    { label: "التقارير", href: "/dashboard/clinic/reports" },
    { label: "الإعدادات", href: "/dashboard/clinic/settings" },
  ];

  // Check if clinic data is set up
  useEffect(() => {
    const checkClinicSetup = async () => {
      if (!isLoaded) return;

      try {
        const res = await fetch("/api/clinic");
        
        // If clinic setup is required (206 status or requiresSetup flag)
        if (res.status === 206 || !res.ok) {
          const data = await res.json().catch(() => ({}));
          
          if (data.requiresSetup || res.status === 206) {
            setShowSetupAlert(true);
            
            // Only redirect if not already on settings page
            if (!pathname.includes("/settings")) {
              router.push("/dashboard/clinic/settings");
            }
          }
        }
      } catch (error) {
        console.error("Error checking clinic setup:", error);
      } finally {
        setIsCheckingSetup(false);
      }
    };

    checkClinicSetup();
  }, [isLoaded, pathname, router]);

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      {/* Setup Alert Banner */}
      {showSetupAlert && !pathname.includes("/settings") && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b-2 border-yellow-400 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 font-semibold">يرجى إكمال بيانات العيادة قبل المتابعة</span>
            </div>
            <Link 
              href="/dashboard/clinic/settings"
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              إكمال الآن
            </Link>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold">OCP</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Omar Clinic</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-blue-200 shadow-lg" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t bg-gray-50/50">
          {isLoaded && user && (
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <UserButton afterSignOutUrl="/login" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-gray-900 truncate">
                  {user.fullName || user.username || "مستخدم"}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          )}
          <SignOutButton>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              تسجيل الخروج
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {navItems.find(item => item.href === pathname)?.label || "لوحة التحكم"}
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <UserButton afterSignOutUrl="/login" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {isCheckingSetup ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">جاري التحقق من البيانات...</p>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
