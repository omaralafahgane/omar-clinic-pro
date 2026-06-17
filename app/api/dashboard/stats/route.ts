import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's clinic
    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ success: false, requiresSetup: true });
    }

    const clinicId = user.clinic_id;

    // Helper for safe counting
    const getCount = async (table: string) => {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId);
      return count || 0;
    };

    const patientsCount = await getCount('patients');
    const doctorsCount = await getCount('doctors');
    
    // Get today's appointments count safely
    const today = new Date().toISOString().split('T')[0];
    const { count: todayAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('start_time', `${today}T00:00:00`)
      .lte('start_time', `${today}T23:59:59`);

    // Get total revenue safely
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('clinic_id', clinicId)
      .eq('status', 'paid');
    
    const totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) || 0;

    // Return clean data even if empty
    return NextResponse.json({
      success: true,
      data: {
        plan: 'basic',
        limits: { patients: 100, appointments: 20, doctors: 5 },
        stats: {
          patients: patientsCount,
          doctors: doctorsCount,
          todayAppointments: todayAppointments || 0,
          totalRevenue,
          pendingRevenue: 0,
        },
        charts: {
          monthlyRevenue: { [new Date().toLocaleString('en-US', { month: 'short' })]: totalRevenue },
          weeklyAppointments: { [new Date().toLocaleString('en-US', { weekday: 'short' })]: todayAppointments || 0 },
        },
        upcomingAppointments: [],
        recentInvoices: []
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
