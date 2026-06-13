// Shopify Webhook Handler
// Handles subscription activation and payment processing from Shopify
// Processes: order.created, order.paid, subscription_billing_attempt.success

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { emailService } from "@/lib/resend";
import crypto from "crypto";

// ============================================================================
// WEBHOOK VERIFICATION
// ============================================================================

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

if (!SHOPIFY_WEBHOOK_SECRET) {
  console.warn("SHOPIFY_WEBHOOK_SECRET is not set - webhook verification disabled");
}

/**
 * Verify Shopify webhook signature
 * Shopify signs each webhook with HMAC-SHA256
 */
function verifyShopifyWebhook(
  request: Request,
  body: string,
  hmacHeader: string
): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.warn("Webhook verification skipped - no secret configured");
    return true; // Allow in development
  }

  try {
    const hmac = crypto
      .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
      .update(body, "utf8")
      .digest("base64");

    return hmac === hmacHeader;
  } catch (error) {
    console.error("Webhook verification error:", error);
    return false;
  }
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.text();
    const event = JSON.parse(body);

    // Get HMAC header for verification
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";

    // Verify webhook signature
    if (!verifyShopifyWebhook(req, body, hmacHeader)) {
      console.error("Shopify webhook verification failed");
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 401 }
      );
    }

    console.log(`Received Shopify webhook: ${event.type || "unknown"}`);

    // ====================================================================
    // HANDLE ORDER PAID EVENT
    // ====================================================================
    if (event.type === "orders/paid" || event.type === "order.paid") {
      return handleOrderPaid(event);
    }

    // ====================================================================
    // HANDLE ORDER CREATED EVENT
    // ====================================================================
    if (event.type === "orders/create" || event.type === "order.created") {
      return handleOrderCreated(event);
    }

    // ====================================================================
    // HANDLE SUBSCRIPTION BILLING SUCCESS
    // ====================================================================
    if (
      event.type === "subscription_billing_attempts/success" ||
      event.type === "subscription_billing_attempt.success"
    ) {
      return handleSubscriptionBillingSuccess(event);
    }

    // Handle other event types
    console.log(`Unhandled Shopify event type: ${event.type}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Shopify webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle order.paid event - Activate subscription
 */
async function handleOrderPaid(event: any) {
  try {
    const order = event.data?.object || event;
    const orderId = order.id || order.order_id;
    const customerId = order.customer?.id || order.customer_id;
    const lineItems = order.line_items || [];

    console.log(`Processing paid order: ${orderId}`);

    // Extract clinic data from order metadata or line items
    let clinicId: string | null = null;
    let planName: string | null = null;
    let amount: number = 0;

    // Try to get clinic_id from order metadata
    if (order.note_attributes) {
      const clinicAttr = order.note_attributes.find(
        (attr: any) => attr.name === "clinic_id"
      );
      if (clinicAttr) clinicId = clinicAttr.value;

      const planAttr = order.note_attributes.find(
        (attr: any) => attr.name === "plan"
      );
      if (planAttr) planName = planAttr.value;
    }

    // If not in metadata, try to extract from line items
    if (!planName && lineItems.length > 0) {
      const productTitle = lineItems[0].title || "";
      // Extract plan name from product title (e.g., "Omar Clinic Pro - Basic Plan")
      if (productTitle.includes("Basic")) planName = "basic";
      else if (productTitle.includes("Advanced")) planName = "advanced";
      else if (productTitle.includes("Enterprise")) planName = "enterprise";
    }

    // Calculate total amount
    amount = order.total_price ? parseFloat(order.total_price) : 0;

    if (!clinicId) {
      console.error(`Order ${orderId}: clinic_id not found in metadata`);
      return NextResponse.json(
        { error: "clinic_id not found in order" },
        { status: 400 }
      );
    }

    if (!planName) {
      console.error(`Order ${orderId}: plan name not found`);
      planName = "basic"; // Default to basic
    }

    // ====================================================================
    // UPDATE SUBSCRIPTION IN DATABASE
    // ====================================================================

    // Check if clinic exists
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, name, email, owner_id")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      console.error(`Clinic ${clinicId} not found:`, clinicError);
      return NextResponse.json(
        { error: "Clinic not found" },
        { status: 404 }
      );
    }

    // Create or update subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1-month subscription

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          clinic_id: clinicId,
          plan: planName,
          status: "active",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          renewal_date: endDate.toISOString(),
          price: amount,
          currency: order.currency || "USD",
          billing_cycle: "monthly",
          auto_renew: true,
          shopify_order_id: orderId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "clinic_id" }
      )
      .select()
      .single();

    if (subscriptionError) {
      console.error(`Failed to create subscription for clinic ${clinicId}:`, subscriptionError);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }

    console.log(`Subscription activated for clinic ${clinicId}: ${planName}`);

    // ====================================================================
    // SEND ACTIVATION EMAIL
    // ====================================================================

    // Get clinic owner email
    const { data: owner, error: ownerError } = await supabase
      .from("users")
      .select("email, first_name")
      .eq("id", clinic.owner_id)
      .single();

    if (!ownerError && owner) {
      try {
        await emailService.sendSubscriptionActivationEmail({
          clinicName: clinic.name,
          clinicEmail: clinic.email,
          ownerEmail: owner.email,
          ownerName: owner.first_name || "Clinic Owner",
          plan: planName,
          amount: amount.toString(),
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        });
        console.log(`Activation email sent to ${owner.email}`);
      } catch (emailError) {
        console.error(`Failed to send activation email:`, emailError);
        // Don't fail the webhook if email fails
      }
    }

    // ====================================================================
    // LOG ACTIVITY
    // ====================================================================

    await supabase.from("activity_logs").insert({
      clinic_id: clinicId,
      user_id: clinic.owner_id,
      entity_type: "subscriptions",
      entity_id: subscription.id,
      action: "activate",
      new_values: {
        plan: planName,
        status: "active",
        shopify_order_id: orderId,
        amount,
      },
      status: "success",
    });

    return NextResponse.json(
      { success: true, subscription_id: subscription.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling order.paid event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle order.created event - Log order creation
 */
async function handleOrderCreated(event: any) {
  try {
    const order = event.data?.object || event;
    const orderId = order.id || order.order_id;

    console.log(`Order created: ${orderId}`);

    // Extract clinic_id if available
    let clinicId: string | null = null;
    if (order.note_attributes) {
      const clinicAttr = order.note_attributes.find(
        (attr: any) => attr.name === "clinic_id"
      );
      if (clinicAttr) clinicId = clinicAttr.value;
    }

    if (clinicId) {
      // Log order creation
      await supabase.from("activity_logs").insert({
        clinic_id: clinicId,
        entity_type: "orders",
        entity_id: orderId,
        action: "create",
        new_values: {
          shopify_order_id: orderId,
          status: order.financial_status || "pending",
        },
        status: "success",
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error handling order.created event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription_billing_attempt.success event - Renew subscription
 */
async function handleSubscriptionBillingSuccess(event: any) {
  try {
    const billingAttempt = event.data?.object || event;
    const subscriptionId = billingAttempt.subscription_id;

    console.log(`Subscription billing success: ${subscriptionId}`);

    if (!subscriptionId) {
      console.error("subscription_id not found in billing attempt");
      return NextResponse.json(
        { error: "subscription_id not found" },
        { status: 400 }
      );
    }

    // Update subscription renewal date
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        renewal_date: renewalDate.toISOString(),
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("shopify_subscription_id", subscriptionId);

    if (updateError) {
      console.error(`Failed to update subscription ${subscriptionId}:`, updateError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    console.log(`Subscription ${subscriptionId} renewed`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error handling subscription billing success:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
