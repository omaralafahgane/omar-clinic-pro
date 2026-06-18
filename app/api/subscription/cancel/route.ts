import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";



export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reason } = await req.json();

    // Get user's clinic
    const { data: user } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Cancel subscription (soft delete with cancellation date)
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq("clinic_id", user.clinic_id);

    if (subError) throw subError;

    // Log the cancellation
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action: "SUBSCRIPTION_CANCELLED",
      entity: "subscription",
      details: { reason }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
