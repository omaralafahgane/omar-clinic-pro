import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-permissions";
import { PERMISSIONS } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: NextRequest) {
  return requirePermission(PERMISSIONS.INVOICE_CREATE)(async (req: NextRequest) => {
    try {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { plan } = await req.json();

      // Get user's clinic
      const { data: user } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("id", userId)
        .single();

      if (!user?.clinic_id) {
        return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
      }

      // Activate or Update subscription
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert({
          clinic_id: user.clinic_id,
          plan: plan,
          status: "active",
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          trial_end: null, // No trial period
          updated_at: new Date().toISOString()
        });

      if (subError) throw subError;

      // Log the audit
      await supabase.from("audit_logs").insert({
        user_id: userId,
        action: "SUBSCRIPTION_ACTIVATED",
        entity: "subscription",
        details: { plan }
      });

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
  })(request);
}
