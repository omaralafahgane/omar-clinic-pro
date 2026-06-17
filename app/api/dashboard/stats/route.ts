import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from "@/lib/api-permissions";
import { PERMISSIONS } from "@/lib/roles";
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const GET = requirePermission(PERMISSIONS.REPORTS_READ)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic
    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ 
        success: false,
        error: 'No clinic found',
        requiresSetup: true 
      }, { status: 200 });
    }

    const clinicId = user.clinic_id;

    // Get clinic subscription plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('clinic_id', clinicId)
      .single();

    const plan = subscription?.plan || 'basic';

    // Define plan limits
    const planLimits: any = {
      basic: { patients: 100, appointments: 20, doctors: 5 },
      silver: { patients: 300, appointments: 100, doctors: 20 },
      gold: { patients: 999999, appointments: 999999, doctors: 999999 }
    };

    const limits = planLimits[plan] || planLimits.basic;

    // Count patients
    const { count: patientsCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    // Count doctors
    const { count: doctorsCount } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    // Count today's appointments
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const { count: todayAppointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('start_time', todayStart.toISOString())
      .lte('start_time', todayEnd.toISOString());

    // Get monthly revenue (last 12 months)
    const monthlyRevenue: any = {};
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('clinic_id', clinicId)
        .eq('status', 'paid')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      monthlyRevenue[monthYear] = invoices?.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0;
    }

    // Get weekly appointments (last 7 days)
    const weeklyAppointments: any = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const day = date.toLocaleString('en-US', { weekday: 'short' });

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('start_time', dayStart.toISOString())
        .lte('start_time', dayEnd.toISOString());

      weeklyAppointments[day] = count || 0;
    }

    // Get total revenue
    const { data: allInvoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('clinic_id', clinicId)
      .eq('status', 'paid');

    const totalRevenue = allInvoices?.reduce((sum: number, inv: any) => sum + (Number(inv.total_amount) || 0), 0) || 0;

    // Get pending revenue
    const { data: pendingInvoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('clinic_id', clinicId)
      .in('status', ['sent', 'partially_paid', 'overdue']);

    const pendingRevenue = pendingInvoices?.reduce((sum: number, inv: any) => sum + (Number(inv.total_amount) || 0), 0) || 0;

    // Get upcoming appointments (next 5)
    const { data: upcomingAppointments } = await supabase
      .from('appointments')
      .select('*, patient:patients(first_name, last_name), doctor:doctors(first_name, last_name)')
      .eq('clinic_id', clinicId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5);

    // Get recent invoices (last 5)
    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select('*, patient:patients(first_name, last_name)')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        plan,
        limits,
        stats: {
          patients: patientsCount || 0,
          doctors: doctorsCount || 0,
          todayAppointments: todayAppointmentsCount || 0,
          totalRevenue,
          pendingRevenue,
        },
        charts: {
          monthlyRevenue,
          weeklyAppointments,
        },
        upcomingAppointments: upcomingAppointments || [],
        recentInvoices: recentInvoices || []
      }
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
});
