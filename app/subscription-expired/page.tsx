import Link from 'next/link';

export default function SubscriptionExpired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100">
            <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-sans">
            انتهت صلاحية الاشتراك
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            نأسف لإبلاغك بأن اشتراك عيادتك قد انتهى. يرجى التجديد للمتابعة في استخدام النظام والوصول إلى بياناتك.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            href="/dashboard/clinic/subscription"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            تجديد الاشتراك الآن
          </Link>
          <Link
            href="/contact"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            تواصل مع الدعم الفني
          </Link>
        </div>
      </div>
    </div>
  );
}
