import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const clinicId = session.metadata?.clinic_id;
    const userId = session.metadata?.user_id;
    const planId = session.metadata?.plan_id;

    if (!clinicId || !userId || !planId) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    // Save subscription to database
    const { error } = await supabase.from('subscriptions').upsert({
      clinic_id: clinicId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: session.customer as string,
      plan: planId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
      price: subscription.items.data[0]?.price.unit_amount || 0,
      currency: subscription.items.data[0]?.price.currency || 'sar',
      billing_cycle: subscription.items.data[0]?.price.recurring?.interval || 'month',
      is_active: true,
    });

    if (error) {
      console.error('Error saving subscription:', error);
      return;
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      clinic_id: clinicId,
      user_id: userId,
      action: 'SUBSCRIPTION_ACTIVATED',
      entity_type: 'subscription',
      new_values: {
        plan: planId,
        status: subscription.status,
      },
    });

    console.log(`✅ Subscription activated for clinic ${clinicId}`);
  } catch (error: any) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const clinicId = subscription.metadata?.clinic_id;

    if (!clinicId) {
      console.error('Missing clinic_id in subscription metadata');
      return;
    }

    // Update subscription in database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
        is_active: subscription.status === 'active',
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription:', error);
      return;
    }

    console.log(`✅ Subscription updated for clinic ${clinicId}`);
  } catch (error: any) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  try {
    const clinicId = subscription.metadata?.clinic_id;

    if (!clinicId) {
      console.error('Missing clinic_id in subscription metadata');
      return;
    }

    // Update subscription in database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        is_active: false,
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error cancelling subscription:', error);
      return;
    }

    console.log(`✅ Subscription cancelled for clinic ${clinicId}`);
  } catch (error: any) {
    console.error('Error handling subscription cancelled:', error);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    const clinicId = invoice.metadata?.clinic_id;

    if (!clinicId) {
      console.error('Missing clinic_id in invoice metadata');
      return;
    }

    // Log payment
    await supabase.from('activity_logs').insert({
      clinic_id: clinicId,
      action: 'PAYMENT_RECEIVED',
      entity_type: 'invoice',
      new_values: {
        invoice_id: invoice.id,
        amount: invoice.total,
        currency: invoice.currency,
      },
    });

    console.log(`✅ Payment received for clinic ${clinicId}`);
  } catch (error: any) {
    console.error('Error handling invoice paid:', error);
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  try {
    const clinicId = invoice.metadata?.clinic_id;

    if (!clinicId) {
      console.error('Missing clinic_id in invoice metadata');
      return;
    }

    // Log failed payment
    await supabase.from('activity_logs').insert({
      clinic_id: clinicId,
      action: 'PAYMENT_FAILED',
      entity_type: 'invoice',
      new_values: {
        invoice_id: invoice.id,
        amount: invoice.total,
        currency: invoice.currency,
        error: invoice.last_finalization_error?.message,
      },
    });

    console.log(`❌ Payment failed for clinic ${clinicId}`);
  } catch (error: any) {
    console.error('Error handling invoice failed:', error);
  }
}
