"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

/**
 * LoginPage - Updated to ensure complete removal of old manual login logic
 * This page now exclusively uses Clerk for authentication.
 */
export default function LoginPage() {
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
        <div className="p-8 text-center bg-blue-600">
          <h1 className="text-2xl font-black text-white">Omar Clinic Pro</h1>
          <p className="text-blue-100 text-sm mt-1">تسجيل الدخول للنظام</p>
        </div>
        
        <div className="p-4 flex justify-center">
          <SignIn 
            routing="hash"
            signUpUrl="/free-trial"
            afterSignInUrl="/dashboard/clinic"
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
      </div>
      
      <p className="mt-8 text-gray-400 text-xs">
        &copy; 2026 Omar Clinic Pro - جميع الحقوق محفوظة
      </p>
    </div>
  );
}
