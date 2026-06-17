import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Force check in users table
    const { data: user } = await supabase.from("users").select("clinic_id").eq("id", userId).maybeSingle();
    
    if (!user?.clinic_id) {
      return NextResponse.json({ requiresSetup: true }, { status: 200 });
    }

    const { data: clinic } = await supabase.from("clinics").select("*").eq("id", user.clinic_id).maybeSingle();
    if (!clinic) return NextResponse.json({ requiresSetup: true }, { status: 200 });

    return NextResponse.json({ success: true, data: clinic });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, email, phone, address, city, country, description } = body;

    // 1. Find if user exists or create them
    const { data: existingUser } = await supabase.from("users").select("clinic_id").eq("id", userId).maybeSingle();
    
    let clinicId = existingUser?.clinic_id;
    let result;

    if (clinicId) {
      const { data: updatedClinic } = await supabase
        .from("clinics")
        .update({ name, email, phone, address, city, country, description, updated_at: new Date().toISOString() })
        .eq("id", clinicId)
        .select().single();
      result = updatedClinic;
    } else {
      // 2. Create clinic
      const { data: newClinic, error: cErr } = await supabase
        .from("clinics")
        .insert([{ name, email, phone, address, city, country: country || "الأردن", description, is_active: true }])
        .select().single();

      if (cErr) throw cErr;

      if (newClinic) {
        // 3. UPSERT user to ensure link exists
        const { error: uErr } = await supabase
          .from("users")
          .upsert({ id: userId, clinic_id: newClinic.id, role: 'owner', updated_at: new Date().toISOString() });
        
        if (uErr) throw uErr;
        result = newClinic;
      }
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
