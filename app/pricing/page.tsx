import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "الأساسي",
      price: "99",
      description: "للعيادات الصغيرة",
      features: [
        "إدارة حتى 100 مريض",
        "جدولة المواعيد الأساسية",
        "الفواتير البسيطة",
        "دعم البريد الإلكتروني",
      ],
      cta: "ابدأ الآن",
      highlighted: false,
    },
    {
      name: "المتقدم",
      price: "299",
      description: "للعيادات المتوسطة",
      features: [
        "إدارة عدد غير محدود من المرضى",
        "جدولة متقدمة مع التنبيهات",
        "إدارة فواتير متقدمة",
        "تقارير وإحصائيات",
        "دعم الأولوية",
        "تكامل البريد الإلكتروني",
      ],
      cta: "ابدأ الآن",
      highlighted: true,
    },
    {
      name: "المؤسسي",
      price: "999",
      description: "للعيادات الكبيرة",
      features: [
        "جميع مميزات المتقدم",
        "إدارة متعددة الفروع",
        "API مخصص",
        "دعم 24/7",
        "تدريب مخصص",
        "استشارات تقنية",
      ],
      cta: "اتصل بنا",
      highlighted: false,
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">أسعار شفافة وعادلة</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اختر الخطة المناسبة لعيادتك. جميع الخطط تتضمن تجربة مجانية لمدة 14 يوم
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-8 transition ${
                plan.highlighted
                  ? "border-2 border-blue-500 shadow-lg scale-105"
                  : "border border-gray-200 hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="bg-blue-500 text-white text-center py-2 px-4 rounded mb-4 text-sm font-semibold">
                  الأكثر شيوعاً
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600 mr-2">/شهر</span>
              </div>
              <button
                className={`w-full py-3 rounded-lg font-semibold mb-8 transition ${
                  plan.highlighted
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                }`}
              >
                {plan.cta}
              </button>
              <ul className="space-y-4">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            الأسئلة الشائعة
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "هل هناك فترة تجربة مجانية؟",
                a: "نعم، جميع الخطط تتضمن تجربة مجانية لمدة 14 يوم بدون الحاجة لبطاقة ائتمان",
              },
              {
                q: "هل يمكن تغيير الخطة لاحقاً؟",
                a: "نعم، يمكنك تغيير خطتك في أي وقت. سيتم حساب الفرق تلقائياً",
              },
              {
                q: "هل هناك عقد طويل الأجل؟",
                a: "لا، جميع الخطط شهرية وبدون التزام. يمكنك الإلغاء في أي وقت",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
