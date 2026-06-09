export default function ClinicDashboard() {
  const stats = [
    { label: "المرضى", value: "1,234", change: "+12%" },
    { label: "المواعيد اليوم", value: "24", change: "+5%" },
    { label: "الإيرادات", value: "45,000 ر.س", change: "+8%" },
    { label: "معدل الرضا", value: "4.8/5", change: "+2%" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-green-600 text-sm mt-2">{stat.change} من الشهر الماضي</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">المواعيد هذا الأسبوع</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">سيتم عرض الرسم البياني هنا</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الإيرادات هذا الشهر</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">سيتم عرض الرسم البياني هنا</p>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">المواعيد القادمة</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4 text-gray-600">المريض</th>
                <th className="text-right py-3 px-4 text-gray-600">الطبيب</th>
                <th className="text-right py-3 px-4 text-gray-600">الوقت</th>
                <th className="text-right py-3 px-4 text-gray-600">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  patient: "أحمد محمد",
                  doctor: "د. فاطمة علي",
                  time: "10:00 AM",
                  status: "مؤكد",
                },
                {
                  patient: "سارة محمود",
                  doctor: "د. محمد حسن",
                  time: "11:30 AM",
                  status: "مؤكد",
                },
                {
                  patient: "علي حسين",
                  doctor: "د. نور أحمد",
                  time: "2:00 PM",
                  status: "في الانتظار",
                },
              ].map((appointment, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{appointment.patient}</td>
                  <td className="py-3 px-4 text-gray-600">{appointment.doctor}</td>
                  <td className="py-3 px-4 text-gray-600">{appointment.time}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        appointment.status === "مؤكد"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status}
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
