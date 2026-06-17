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

    // 1. Check if user exists and has clinic_id
    const { data: user } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .maybeSingle();

    if (!user?.clinic_id) {
      return NextResponse.json({ requiresSetup: true }, { status: 200 });
    }

    // 2. Get clinic data
    const { data: clinic } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", user.clinic_id)
      .maybeSingle();

    if (!clinic) {
      return NextResponse.json({ requiresSetup: true }, { status: 200 });
    }

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
    const { name, email, phone, address, city, country, website, description } = body;

    // 1. Get or Create user record to ensure we have a place to store clinic_id
    const { data: userRecord } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .maybeSingle();

    if (!userRecord) {
      await supabase.from("users").insert([{ id: userId, role: 'owner' }]);
    }

    let clinicId = userRecord?.clinic_id;
    let result;

    if (clinicId) {
      // Update existing clinic
      const { data: updatedClinic, error: updateError } = await supabase
        .from("clinics")
        .update({
          name, email, phone, address, city, country, website, description,
          updated_at: new Date().toISOString()
        })
        .eq("id", clinicId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      result = updatedClinic;
    } else {
      // Create NEW clinic and link it to user
      const { data: newClinic, error: createError } = await supabase
        .from("clinics")
        .insert([{
          name, email, phone, address, city, country: country || "الأردن", website, description,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      if (newClinic) {
        // CRITICAL: Link user to the new clinic
        const { error: linkError } = await supabase
          .from("users")
          .update({ clinic_id: newClinic.id })
          .eq("id", userId);
        
        if (linkError) throw linkError;
        result = newClinic;
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Clinic Patch Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
