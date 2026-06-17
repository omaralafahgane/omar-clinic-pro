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

    // 1. Check if user already has a clinic_id
    const { data: existingUser } = await supabase.from("users").select("clinic_id").eq("id", userId).maybeSingle();
    
    let clinicId = existingUser?.clinic_id;

    // 2. If no clinic_id, check if a clinic with this email already exists
    if (!clinicId && email) {
      const { data: existingClinic } = await supabase.from("clinics").select("id").eq("email", email).maybeSingle();
      if (existingClinic) {
        clinicId = existingClinic.id;
        // Link it to user immediately
        await supabase.from("users").upsert({ id: userId, clinic_id: clinicId, role: 'owner' });
      }
    }

    let result;
    if (clinicId) {
      // Update existing
      const { data: updatedClinic, error: uErr } = await supabase
        .from("clinics")
        .update({ name, email, phone, address, city, country, description, updated_at: new Date().toISOString() })
        .eq("id", clinicId)
        .select().single();
      if (uErr) throw uErr;
      result = updatedClinic;
    } else {
      // Create NEW
      const { data: newClinic, error: cErr } = await supabase
        .from("clinics")
        .insert([{ name, email, phone, address, city, country: country || "الأردن", description, is_active: true }])
        .select().single();

      if (cErr) throw cErr;

      if (newClinic) {
        await supabase.from("users").upsert({ id: userId, clinic_id: newClinic.id, role: 'owner' });
        result = newClinic;
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
