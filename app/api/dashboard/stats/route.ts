import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase } from "@/lib/supabase";



export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's clinic
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user?.clinic_id) {
      return NextResponse.json({ success: false, requiresSetup: true });
    }

    const clinicId = user.clinic_id;

    // Helper for safe counting
    const getCount = async (table: string) => {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinicId);
        if (error) {
          console.error(`Error counting ${table}:`, error);
          return 0;
        }
        return count || 0;
      } catch (e) {
        return 0;
      }
    };

    const patientsCount = await getCount('patients');
    
    // Check if doctors table exists and has clinic_id
    let doctorsCount = 0;
    try {
      const { count } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId);
      doctorsCount = count || 0;
    } catch (e) {
      // If table doesn't exist or other error, default to 0
    }
    
    // Get today's appointments count safely
    const today = new Date().toISOString().split('T')[0];
    let todayAppointments = 0;
    try {
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`);
      todayAppointments = count || 0;
    } catch (e) {}

    // Get total revenue safely
    let totalRevenue = 0;
    try {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('clinic_id', clinicId)
        .eq('status', 'paid');
      totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) || 0;
    } catch (e) {}

    // Return clean data even if empty
    const currentMonth = new Date().toLocaleString('ar-EG', { month: 'long' });
    const currentDay = new Date().toLocaleString('ar-EG', { weekday: 'long' });

    return NextResponse.json({
      success: true,
      data: {
        plan: 'basic',
        limits: { patients: 100, appointments: 20, doctors: 5 },
        stats: {
          patients: patientsCount,
          doctors: doctorsCount,
          todayAppointments: todayAppointments,
          totalRevenue,
          pendingRevenue: 0,
        },
        charts: {
          monthlyRevenue: { [currentMonth]: totalRevenue },
          weeklyAppointments: { [currentDay]: todayAppointments },
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
