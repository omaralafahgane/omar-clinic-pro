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
      return NextResponse.json({ requiresSetup: true });
    }

    const { data: clinic } = await supabase.from("clinics").select("*").eq("id", user.clinic_id).maybeSingle();
    if (!clinic) return NextResponse.json({ requiresSetup: true });

    return NextResponse.json({ success: true, data: clinic });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, email, phone, address, city, country, description } = body;

    // 1. Create or update the clinic
    const { data: user } = await supabase.from("users").select("clinic_id").eq("id", userId).maybeSingle();
    let clinicId = user?.clinic_id;

    let finalClinic;
    if (clinicId) {
      const { data, error } = await supabase
        .from("clinics")
        .update({ name, email, phone, address, city, country, description, updated_at: new Date().toISOString() })
        .eq("id", clinicId)
        .select().single();
      if (error) throw error;
      finalClinic = data;
    } else {
      const { data, error } = await supabase
        .from("clinics")
        .insert([{ name, email, phone, address, city, country: country || "الأردن", description, is_active: true }])
        .select().single();
      if (error) throw error;
      finalClinic = data;
      
      // Link to user
      await supabase.from("users").upsert({ id: userId, clinic_id: finalClinic.id, role: 'owner' });
    }

    return NextResponse.json({ success: true, data: finalClinic });
  } catch (error: any) {
    console.error("Clinic PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save clinic" }, { status: 500 });
  }
}
