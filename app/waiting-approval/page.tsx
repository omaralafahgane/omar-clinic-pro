"use client";
import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WaitingApprovalPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      const approvalStatus = user.publicMetadata.approval_status as string;
      setStatus(approvalStatus);
      
      // If user is already approved, redirect to dashboard
      if (approvalStatus === "approved") {
        router.push("/dashboard");
      }
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden p-10">
        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-600">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-4">بانتظار موافقة المسؤول</h1>
        
        <div className="bg-blue-50 text-blue-800 p-6 rounded-2xl mb-8 leading-relaxed">
          <p className="font-bold mb-2 text-lg">Your account is waiting for approval.</p>
          <p>Please contact the administrator:</p>
          <a href="mailto:omaralblack@gmail.com" className="font-black underline block mt-2">omaralblack@gmail.com</a>
        </div>

        <p className="text-gray-500 mb-10 leading-relaxed">
          شكراً لتسجيلك في Omar Clinic Pro. سيقوم فريق الإدارة بمراجعة حسابك وتفعيله في أقرب وقت ممكن.
        </p>

        <div className="space-y-4">
          <SignOutButton>
            <button className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all">
              تسجيل الخروج
            </button>
          </SignOutButton>
          
          <Link href="/" className="block text-blue-600 font-bold hover:underline">
            العودة للرئيسية
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-gray-400 text-xs">
        &copy; 2026 Omar Clinic Pro - الحل الأمثل لإدارة عيادتك باحترافية
      </p>
    </div>
  );
}
