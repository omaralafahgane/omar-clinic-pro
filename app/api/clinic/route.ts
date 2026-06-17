import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user and their clinic_id
    const { data: user } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ requiresSetup: true }, { status: 200 });
    }

    // Get clinic data
    const { data: clinic, error } = await supabase
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
    if (!userId || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, city, country, website, description } = body;

    // Check if user already has a clinic
    const { data: userRecord } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .single();

    let clinicId = userRecord?.clinic_id;
    let result;

    if (clinicId) {
      // Update existing
      const { data: updatedClinic } = await supabase
        .from("clinics")
        .update({
          name, email, phone, address, city, country, website, description,
          updated_at: new Date().toISOString()
        })
        .eq("id", clinicId)
        .select()
        .single();
      result = updatedClinic;
    } else {
      // Create new
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

      if (newClinic) {
        await supabase.from("users").update({ clinic_id: newClinic.id }).eq("id", userId);
        result = newClinic;
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
