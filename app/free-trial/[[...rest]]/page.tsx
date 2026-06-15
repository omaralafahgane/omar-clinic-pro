"use client";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

/**
 * FreeTrialPage - Uses optional catch-all route [[...rest]] as required by Clerk
 * for multi-step flows (SSO callbacks, MFA, email verification, etc.)
 */
export default function FreeTrialPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" dir="rtl">
      {/* Home Link */}
      <Link href="/" className="mb-8 text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        العودة للرئيسية
      </Link>
      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 text-center bg-green-600">
          <h1 className="text-2xl font-black text-white">تجربة مجانية</h1>
          <p className="text-green-100 text-sm mt-1">14 يوم مجاني بدون بطاقة ائتمان</p>
        </div>
        <div className="p-4 flex justify-center">
          <SignUp 
            routing="path"
            path="/free-trial"
            signInUrl="/login"
            afterSignUpUrl="/dashboard/clinic"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none w-full",
                header: "hidden",
                footer: "bg-transparent",
              }
            }}
          />
        </div>
        <div className="px-8 pb-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية
          </p>
        </div>
      </div>
      <p className="mt-8 text-gray-400 text-xs">
        &copy; 2026 Omar Clinic Pro - جميع الحقوق محفوظة
      </p>
    </div>
  );
}
