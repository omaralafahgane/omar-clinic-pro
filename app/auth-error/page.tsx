"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">خطأ في المصادقة</h1>
      <p className="text-gray-600 mb-8">
        {error === "user_not_found" 
          ? "لم نتمكن من العثور على بياناتك في النظام. يرجى التأكد من اكتمال عملية التسجيل."
          : "حدث خطأ غير متوقع أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى لاحقاً."}
      </p>

      <div className="space-y-4">
        <Link 
          href="/login" 
          className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          العودة لصفحة الدخول
        </Link>
        <Link 
          href="/contact" 
          className="block w-full text-blue-600 font-medium hover:underline"
        >
          التواصل مع الدعم الفني
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <Suspense fallback={<div className="animate-pulse bg-white p-8 rounded-2xl shadow-xl w-full max-w-md h-64 flex items-center justify-center">جاري التحميل...</div>}>
        <AuthErrorContent />
      </Suspense>
    </main>
  );
}
