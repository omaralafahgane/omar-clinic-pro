'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import { DataTable } from '@/components/shared/DataTable';
import { Users, Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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
  const [requiresSetup, setRequiresSetup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const result = await response.json();
      
      if (result.requiresSetup) {
        setRequiresSetup(true);
        // Automatically redirect to settings after a short delay
        setTimeout(() => {
          router.push('/dashboard/clinic/settings');
        }, 3000);
      } else if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (requiresSetup) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-lg">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">مرحباً بك في Omar Clinic Pro!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            يبدو أنك لم تقم بإعداد بيانات عيادتك بعد. سنقوم بتوجيهك الآن إلى صفحة الإعدادات لإكمال البيانات الأساسية وتفعيل النظام.
          </p>
          <div className="animate-pulse flex items-center justify-center gap-2 text-blue-600 font-bold">
            <span>جاري التوجيه تلقائياً...</span>
          </div>
          <button 
            onClick={() => router.push('/dashboard/clinic/settings')}
            className="mt-8 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
          >
            الذهاب للإعدادات الآن
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-red-600 font-bold">فشل في تحميل البيانات</p>
      </div>
    );
  }

  const monthlyRevenueData = Object.entries(data.charts.monthlyRevenue).map(([month, revenue]) => ({
    month: month.split(' ')[0],
    revenue,
  }));

  const weeklyAppointmentsData = Object.entries(data.charts.weeklyAppointments).map(([day, count]) => ({
    day,
    appointments: count,
  }));

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      <Header />

      {/* Main Content */}
      <main className="mr-64 mt-16 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-2">مرحباً بك في نظام إدارة العيادة المتقدم</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="إجمالي المرضى"
            value={data.stats.patients}
            change={12}
            trend="up"
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <KPICard
            title="الأطباء"
            value={data.stats.doctors}
            change={5}
            trend="up"
            icon={<Users className="w-6 h-6" />}
            color="green"
          />
          <KPICard
            title="مواعيد اليوم"
            value={data.stats.todayAppointments}
            change={-2}
            trend="down"
            icon={<Calendar className="w-6 h-6" />}
            color="purple"
          />
          <KPICard
            title="الإيرادات الكلية"
            value={`${data.stats.totalRevenue.toLocaleString()}`}
            unit="د.أ"
            change={18}
            trend="up"
            icon={<TrendingUp className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">الإيرادات الشهرية</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Appointments Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">المواعيد الأسبوعية</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyAppointmentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="appointments" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <DataTable
            title="المواعيد القادمة"
            columns={[
              { key: 'id', label: 'الرقم', width: '80px' },
              {
                key: 'patient' as any,
                label: 'المريض',
                render: (val, row) => `${row.patient?.first_name} ${row.patient?.last_name}`,
              },
              {
                key: 'start_time' as any,
                label: 'الوقت',
                render: (val) => new Date(val).toLocaleTimeString('ar-SA'),
              },
              {
                key: 'status' as any,
                label: 'الحالة',
                render: () => <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">مؤكد</span>,
              },
            ]}
            data={data.upcomingAppointments || []}
            searchable={true}
            paginated={true}
            pageSize={5}
          />

          {/* Recent Invoices */}
          <DataTable
            title="الفواتير الأخيرة"
            columns={[
              { key: 'id', label: 'رقم الفاتورة', width: '100px' },
              {
                key: 'patient' as any,
                label: 'المريض',
                render: (val, row) => `${row.patient?.first_name} ${row.patient?.last_name}`,
              },
              { key: 'total_amount' as any, label: 'المبلغ', render: (val) => `${val} د.أ` },
              {
                key: 'status' as any,
                label: 'الحالة',
                render: (val) => (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      val === 'paid'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {val === 'paid' ? 'مدفوعة' : 'معلقة'}
                  </span>
                ),
              },
            ]}
            data={data.recentInvoices || []}
            searchable={true}
            paginated={true}
            pageSize={5}
          />
        </div>
      </main>
    </div>
  );
}
