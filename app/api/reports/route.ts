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
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic_id from users table
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

    // --- 1. Patients Report ---
    
    // Total Patients
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .is('deleted_at', null);

    // New Patients This Month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { count: newPatientsThisMonth } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', firstDayOfMonth.toISOString())
      .is('deleted_at', null);

    // Top Diseases (Extracted from treatments diagnosis)
    const { data: treatments } = await supabase
      .from('treatments')
      .select('diagnosis')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null)
      .not('diagnosis', 'is', null);

    const diagnosisCount: Record<string, number> = {};
    treatments?.forEach((t: any) => {
      if (t.diagnosis) {
        const d = t.diagnosis.trim();
        diagnosisCount[d] = (diagnosisCount[d] || 0) + 1;
      }
    });

    const topDiseases = Object.entries(diagnosisCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // --- 2. Financial Report ---
    
    // Invoices Data
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, paid_amount, balance_due, status')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null);

    const financial = {
      totalRevenue: invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0,
      totalPaid: invoices?.reduce((sum, inv) => sum + Number(inv.paid_amount), 0) || 0,
      totalDebt: invoices?.reduce((sum, inv) => sum + Number(inv.balance_due), 0) || 0,
    };

    // Monthly Financial Stats (Last 6 Months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('ar-SA', { month: 'long' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const monthInvoices = invoices?.filter(inv => {
        // Since we don't have created_at in the select above, we use a simple filter if we had it, 
        // but for accurate monthly stats we should query specifically
        return true; // Placeholder for logic below
      });
      
      // Correct way: Query monthly
      const { data: mInvoices } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount')
        .eq('clinic_id', clinicId)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .is('deleted_at', null);

      monthlyStats.push({
        month: monthLabel,
        revenue: mInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0,
        paid: mInvoices?.reduce((sum, inv) => sum + Number(inv.paid_amount), 0) || 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        patients: {
          total: totalPatients || 0,
          newThisMonth: newPatientsThisMonth || 0,
          topDiseases
        },
        financial: {
          ...financial,
          monthlyStats
        }
      }
    });
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
