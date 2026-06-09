import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">OCP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Omar Clinic Pro</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                تسجيل الدخول
              </Link>
              <Link
                href="/free-trial"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                تجربة مجانية
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            نظام إدارة العيادة الطبية الحديث
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            حل متكامل لإدارة عيادتك الطبية بكفاءة واحترافية. إدارة المرضى والمواعيد والفواتير
            والتقارير في مكان واحد.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/free-trial"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 font-semibold"
            >
              ابدأ تجربة مجانية
            </Link>
            <Link
              href="/features"
              className="border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-lg hover:bg-blue-50 font-semibold"
            >
              اعرف المزيد
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            المميزات الرئيسية
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "إدارة المرضى",
                description: "تسجيل وتتبع بيانات المرضى بسهولة",
              },
              {
                title: "جدولة المواعيد",
                description: "نظام متقدم لجدولة المواعيد والتنبيهات",
              },
              {
                title: "الفواتير والدفع",
                description: "إنشاء الفواتير وتتبع الدفوعات",
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">هل أنت مستعد للبدء؟</h2>
          <p className="text-lg mb-8 opacity-90">
            احصل على تجربة مجانية لمدة 14 يوم بدون الحاجة لبطاقة ائتمان
          </p>
          <Link
            href="/free-trial"
            className="bg-white text-blue-500 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold inline-block"
          >
            ابدأ الآن
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Omar Clinic Pro</h3>
              <p className="text-gray-400">نظام إدارة عيادة طبية متكامل</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">المنتج</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    المميزات
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    الأسعار
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الشركة</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    اتصل بنا
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الحسابات</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/login" className="hover:text-white">
                    تسجيل الدخول
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Omar Clinic Pro. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
