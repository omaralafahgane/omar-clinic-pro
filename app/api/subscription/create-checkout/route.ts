import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Define available plans
const PLANS = {
  basic: {
    name: 'الخطة الأساسية',
    price: 9900, // 99 SAR in cents
    currency: 'sar',
    interval: 'month',
    description: 'مناسبة للعيادات الصغيرة',
    features: ['حتى 50 مريض', 'حتى 5 أطباء', 'إدارة المواعيد الأساسية'],
  },
  professional: {
    name: 'الخطة الاحترافية',
    price: 29900, // 299 SAR in cents
    currency: 'sar',
    interval: 'month',
    description: 'مناسبة للعيادات المتوسطة',
    features: ['حتى 500 مريض', 'حتى 20 طبيب', 'إدارة متقدمة للمواعيد', 'التقارير المتقدمة'],
  },
  enterprise: {
    name: 'الخطة المؤسسية',
    price: 99900, // 999 SAR in cents
    currency: 'sar',
    interval: 'month',
    description: 'مناسبة للعيادات الكبيرة والشبكات',
    features: ['عدد غير محدود من المرضى', 'عدد غير محدود من الأطباء', 'جميع الميزات', 'دعم فني 24/7'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // Get user and clinic info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('clinic_id, email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !user?.clinic_id) {
      return NextResponse.json(
        { error: 'User or clinic not found' },
        { status: 404 }
      );
    }

    // Get clinic info
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', user.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    // Create or get Stripe customer
    let customerId: string;
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('clinic_id', user.clinic_id)
      .maybeSingle();

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: clinic.name,
        description: `Clinic: ${clinic.name}`,
        metadata: {
          clinic_id: user.clinic_id,
          user_id: userId,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      await supabase.from('stripe_customers').insert({
        clinic_id: user.clinic_id,
        stripe_customer_id: customerId,
        email: user.email,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.description,
              metadata: {
                plan_id: planId,
              },
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval as 'month' | 'year',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clinic/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clinic/subscription?canceled=true`,
      metadata: {
        clinic_id: user.clinic_id,
        user_id: userId,
        plan_id: planId,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET endpoint to list available plans
export async function GET(request: NextRequest) {
  try {
    const plans = Object.entries(PLANS).map(([id, plan]) => ({
      id,
      ...plan,
    }));

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
