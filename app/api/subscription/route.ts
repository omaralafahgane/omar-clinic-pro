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

    // Get user's clinic_id
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

    // Get clinic subscription from subscriptions table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('clinic_id', clinicId)
      .single();

    // Get billing history from invoices table
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, status, created_at')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        currentPlan: subscription?.plan || 'PRO',
        status: subscription?.status || 'active',
        renewalDate: subscription?.renewal_date || subscription?.end_date || new Date().toISOString(),
        price: subscription?.price || 0,
        currency: subscription?.currency || 'SAR',
        billingCycle: subscription?.billing_cycle || 'monthly',
        billingHistory: invoices?.map((inv: any) => ({
          id: inv.id,
          number: inv.invoice_number,
          amount: inv.total_amount,
          date: inv.created_at,
          status: inv.status
        })) || []
      }
    });
  } catch (error: any) {
    console.error('Subscription API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
