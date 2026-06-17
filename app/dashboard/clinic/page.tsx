'use client';

import { useState, useEffect } from 'react';

interface DashboardData {
  plan: string;
  limits: {
    patients: number;
    appointments: number;
    doctors: number;
  };
  stats: {
    patients: number;
    doctors: number;
    todayAppointments: number;
    totalRevenue: number;
    pendingRevenue: number;
  };
  charts: {
    monthlyRevenue: Record<string, number>;
    weeklyAppointments: Record<string, number>;
  };
  upcomingAppointments: any[];
  recentInvoices: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-4">{error || 'فشل في تحميل البيانات'}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إعادة محاولة
          </button>
        </div>
      </div>
    );
  }

  const monthlyRevenueData = Object.entries(data.charts.monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue
  }));

  const weeklyAppointmentsData = Object.entries(data.charts.weeklyAppointments).map(([day, count]) => ({
    day,
    appointments: count
  }));

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch(plan) {
      case 'gold': return 'الخطة الذهبية';
      case 'silver': return 'الخطة الفضية';
      default: return 'الخطة الأساسية';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header with Plan Badge */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">لوحة التحكم</h1>
            <p className="mt-1 text-sm text-gray-500">مرحباً بك في نظام إدارة العيادة</p>
          </div>
          <div className={`bg-gradient-to-r ${getPlanColor(data.plan)} text-white px-6 py-3 rounded-2xl shadow-lg`}>
            <p className="text-sm font-bold opacity-90">خطتك الحالية</p>
            <p className="text-2xl font-black">{getPlanLabel(data.plan)}</p>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Patients Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">المرضى</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{data.stats.patients}</p>
          <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all"
              style={{ width: `${getUsagePercentage(data.stats.patients, data.limits.patients)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{data.stats.patients} من {data.limits.patients}</p>
        </div>

        {/* Doctors Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">الأطباء</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{data.stats.doctors}</p>
          <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-600 h-full transition-all"
              style={{ width: `${getUsagePercentage(data.stats.doctors, data.limits.doctors)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{data.stats.doctors} من {data.limits.doctors}</p>
        </div>

        {/* Today's Appointments Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">اليوم</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{data.stats.todayAppointments}</p>
          <p className="text-xs text-gray-500 mt-4">مواعيد اليوم</p>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">الإيرادات</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{data.stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-4">د.أ (JOD)</p>
        </div>

        {/* Pending Revenue Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">معلق</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{data.stats.pendingRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-4">د.أ (JOD)</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">الإيرادات الشهرية</h3>
          <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 font-medium mb-2">الإيرادات الشهرية</p>
              <div className="space-y-2">
                {monthlyRevenueData.slice(-6).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-12">{item.month}</span>
                    <div className="w-40 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full"
                        style={{ width: `${Math.min((item.revenue / 5000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 w-16 text-right">{item.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Appointments Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">المواعيد الأسبوعية</h3>
          <div className="h-80 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center">
            <div className="w-full flex items-end justify-around gap-2 h-64">
              {weeklyAppointmentsData.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-green-600 rounded-t-lg transition-all hover:bg-green-700" style={{ height: `${Math.max(item.appointments * 30, 20)}px` }}></div>
                  <span className="text-xs font-bold text-gray-700">{item.day}</span>
                  <span className="text-xs text-gray-600">{item.appointments}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">المواعيد القادمة</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-gray-400 text-sm border-b">
                  <th className="pb-4 font-bold">المريض</th>
                  <th className="pb-4 font-bold">الوقت</th>
                  <th className="pb-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.upcomingAppointments?.length > 0 ? (
                  data.upcomingAppointments.map((app: any) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50 transition-all">
                      <td className="py-4 font-bold text-gray-900">{app.patient?.first_name} {app.patient?.last_name}</td>
                      <td className="py-4 text-gray-600">{new Date(app.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">مؤكد</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-gray-400 italic">لا توجد مواعيد قادمة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">الفواتير والمالية</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-gray-400 text-sm border-b">
                  <th className="pb-4 font-bold">المريض</th>
                  <th className="pb-4 font-bold">المبلغ</th>
                  <th className="pb-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.recentInvoices?.length > 0 ? (
                  data.recentInvoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50 transition-all">
                      <td className="py-4 font-bold text-gray-900">{inv.patient?.first_name} {inv.patient?.last_name}</td>
                      <td className="py-4 text-gray-600 font-bold">{inv.total_amount} د.أ</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {inv.status === 'paid' ? 'مدفوعة' : 'معلقة'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-gray-400 italic">لا توجد فواتير حديثة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Plan Limits Info */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">حدود خطتك الحالية</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">عدد المرضى المسموح</p>
            <p className="text-2xl font-black text-blue-600">{data.limits.patients}</p>
            <p className="text-xs text-gray-500 mt-2">المستخدم: {data.stats.patients}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">عدد الأطباء المسموح</p>
            <p className="text-2xl font-black text-blue-600">{data.limits.doctors}</p>
            <p className="text-xs text-gray-500 mt-2">المستخدم: {data.stats.doctors}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">عدد المواعيد المسموح</p>
            <p className="text-2xl font-black text-blue-600">{data.limits.appointments}</p>
            <p className="text-xs text-gray-500 mt-2">اليوم: {data.stats.todayAppointments}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
