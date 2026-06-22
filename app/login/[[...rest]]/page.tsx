"use client";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

/**
 * LoginPage - Uses optional catch-all route [[...rest]] as required by Clerk
 * for multi-step flows (SSO callbacks, MFA, email verification, etc.)
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
      <div className="w-full max-w-[450px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 text-center bg-blue-600">
          <h1 className="text-3xl font-black text-white tracking-tight">Omar Clinic Pro</h1>
          <p className="text-blue-100 text-sm mt-2 font-medium">نظام إدارة العيادات المتكامل</p>
        </div>
        <div className="p-2 flex justify-center">
          <SignIn 
            routing="path"
            path="/login"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none w-full p-0",
                headerTitle: "text-xl font-bold text-gray-800",
                headerSubtitle: "text-gray-500",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                footerActionLink: "text-blue-600 hover:text-blue-800 font-semibold",
                identityPreviewText: "text-gray-600",
                formFieldLabel: "text-gray-700 font-medium",
                formFieldInput: "border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                dividerLine: "bg-gray-100",
                dividerText: "text-gray-400 text-xs uppercase",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                showOptionalFields: true,
              }
            }}
          />
        </div>
      </div>
      <p className="mt-8 text-gray-400 text-xs">
        &copy; 2026 Omar Clinic Pro - الحل الأمثل لإدارة عيادتك باحترافية
      </p>
    </div>
  );
}
