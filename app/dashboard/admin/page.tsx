export default function AdminDashboard() {
  const stats = [
    { label: "إجمالي العيادات", value: "156", change: "+23" },
    { label: "المستخدمون النشطون", value: "3,421", change: "+145" },
    { label: "الإيرادات الشهرية", value: "125,000 ر.س", change: "+18%" },
    { label: "معدل الاحتفاظ", value: "92%", change: "+5%" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-green-600 text-sm mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">نمو المستخدمين</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">سيتم عرض الرسم البياني هنا</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الإيرادات</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">سيتم عرض الرسم البياني هنا</p>
          </div>
        </div>
      </div>

      {/* Recent Clinics */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">أحدث العيادات المسجلة</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4 text-gray-600">اسم العيادة</th>
                <th className="text-right py-3 px-4 text-gray-600">المالك</th>
                <th className="text-right py-3 px-4 text-gray-600">الخطة</th>
                <th className="text-right py-3 px-4 text-gray-600">تاريخ التسجيل</th>
                <th className="text-right py-3 px-4 text-gray-600">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  clinic: "عيادة الشفاء",
                  owner: "أحمد محمد",
                  plan: "متقدم",
                  date: "2026-06-08",
                  status: "نشط",
                },
                {
                  clinic: "عيادة النور",
                  owner: "فاطمة علي",
                  plan: "أساسي",
                  date: "2026-06-07",
                  status: "نشط",
                },
                {
                  clinic: "عيادة الأمل",
                  owner: "محمد حسن",
                  plan: "مؤسسي",
                  date: "2026-06-06",
                  status: "نشط",
                },
              ].map((clinic, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{clinic.clinic}</td>
                  <td className="py-3 px-4 text-gray-600">{clinic.owner}</td>
                  <td className="py-3 px-4 text-gray-600">{clinic.plan}</td>
                  <td className="py-3 px-4 text-gray-600">{clinic.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      {clinic.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
