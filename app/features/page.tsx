import Link from "next/link";

export default function FeaturesPage() {
  const features = [
    {
      title: "إدارة المرضى",
      description: "نظام شامل لإدارة بيانات المرضى والسجلات الطبية",
      items: [
        "تسجيل بيانات المريض الشاملة",
        "السجل الطبي الإلكتروني",
        "البحث السريع والتصفية",
        "تتبع التاريخ الطبي",
      ],
    },
    {
      title: "جدولة المواعيد",
      description: "نظام ذكي لجدولة ومتابعة المواعيد",
      items: [
        "جدول زمني تفاعلي",
        "إشعارات تلقائية للمرضى",
        "إدارة الطاقة الاستيعابية",
        "تقارير المواعيد",
      ],
    },
    {
      title: "الفواتير والدفع",
      description: "نظام متكامل للفواتير والدفوعات",
      items: [
        "إنشاء الفواتير التلقائية",
        "تتبع الدفوعات",
        "تقارير مالية شاملة",
        "خيارات دفع متعددة",
      ],
    },
    {
      title: "التقارير والإحصائيات",
      description: "تحليلات شاملة لأداء العيادة",
      items: [
        "لوحة معلومات شاملة",
        "تقارير مخصصة",
        "إحصائيات الأداء",
        "تحليل الاتجاهات",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">OCP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Omar Clinic Pro</span>
            </Link>
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

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">المميزات الكاملة</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            جميع الأدوات التي تحتاجها لإدارة عيادتك الطبية بنجاح
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          {features.map((feature, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-8 hover:shadow-lg transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              <ul className="space-y-3">
                {feature.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">ابدأ الآن</h2>
          <Link
            href="/free-trial"
            className="bg-white text-blue-500 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold inline-block"
          >
            تجربة مجانية
          </Link>
        </div>
      </section>
    </main>
  );
}
