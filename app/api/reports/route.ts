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

    // Get user's clinic
    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('clerk_id', userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ error: 'No clinic found' }, { status: 404 });
    }

    const clinicId = user.clinic_id;

    // Patients Report
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthStr = thisMonth.toISOString().split('T')[0];

    const { count: newThisMonth } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', thisMonthStr);

    // Top Diseases
    const { data: diseases } = await supabase
      .from('patients')
      .select('disease')
      .eq('clinic_id', clinicId)
      .not('disease', 'is', null);

    const diseaseCount: Record<string, number> = {};
    diseases?.forEach((p: any) => {
      if (p.disease) {
        diseaseCount[p.disease] = (diseaseCount[p.disease] || 0) + 1;
      }
    });

    const topDiseases = Object.entries(diseaseCount)
      .map(([disease, count]) => ({ disease, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Financial Report
    const { data: allInvoices } = await supabase
      .from('invoices')
      .select('final_amount, payment_status')
      .eq('clinic_id', clinicId);

    const totalRevenue = allInvoices?.reduce((sum: number, inv: any) => sum + (inv.final_amount || 0), 0) || 0;
    const totalPaid = allInvoices?.filter((inv: any) => inv.payment_status === 'paid').reduce((sum: number, inv: any) => sum + (inv.final_amount || 0), 0) || 0;
    const totalDebt = allInvoices?.filter((inv: any) => inv.payment_status !== 'paid').reduce((sum: number, inv: any) => sum + (inv.final_amount || 0), 0) || 0;

    // Monthly Revenue
    const monthlyRevenue: Record<string, number> = {};
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
        .select('final_amount')
        .eq('clinic_id', clinicId)
        .eq('payment_status', 'paid')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      monthlyRevenue[monthYear] = invoices?.reduce((sum: number, inv: any) => sum + (inv.final_amount || 0), 0) || 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        patients: {
          total: totalPatients || 0,
          newThisMonth: newThisMonth || 0,
          topDiseases
        },
        financial: {
          totalRevenue,
          totalPaid,
          totalDebt,
          monthlyRevenue
        }
      }
    });
  } catch (error: any) {
    console.error('Reports error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
