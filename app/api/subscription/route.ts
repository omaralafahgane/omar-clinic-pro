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

    // Get clinic subscription
    const { data: clinic } = await supabase
      .from('clinics')
      .select('subscription_plan, subscription_status, subscription_renewal_date, shopify_subscription_id')
      .eq('id', user.clinic_id)
      .single();

    // Get billing history
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, final_amount, payment_status, created_at')
      .eq('clinic_id', user.clinic_id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        currentPlan: clinic?.subscription_plan || 'basic',
        status: clinic?.subscription_status || 'active',
        renewalDate: clinic?.subscription_renewal_date || new Date().toISOString(),
        shopifySubscriptionId: clinic?.shopify_subscription_id || '',
        billingHistory: invoices?.map((inv: any) => ({
          id: inv.id,
          amount: inv.final_amount,
          date: inv.created_at,
          status: inv.payment_status
        })) || []
      }
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
