import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    console.log("[API/Clinic GET] Starting...");
    
    const { userId } = await auth();
    if (!userId) {
      console.log("[API/Clinic GET] No userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log("[API/Clinic GET] UserId:", userId);

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .maybeSingle();
    
    if (userError) {
      console.error("[API/Clinic GET] User query error:", userError);
      return NextResponse.json({ error: "Failed to fetch user", details: userError.message }, { status: 500 });
    }

    console.log("[API/Clinic GET] User data:", user);
    
    if (!user?.clinic_id) {
      console.log("[API/Clinic GET] No clinic_id for user, requires setup");
      return NextResponse.json({ requiresSetup: true }, { status: 200 });
    }

    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", user.clinic_id)
      .maybeSingle();

    if (clinicError) {
      console.error("[API/Clinic GET] Clinic query error:", clinicError);
      return NextResponse.json({ error: "Failed to fetch clinic", details: clinicError.message }, { status: 500 });
    }

    if (!clinic) {
      console.log("[API/Clinic GET] Clinic not found");
      return NextResponse.json({ requiresSetup: true }, { status: 200 });
    }

    console.log("[API/Clinic GET] Clinic found:", clinic.id);
    return NextResponse.json({ success: true, data: clinic });
  } catch (error: any) {
    console.error("[API/Clinic GET] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("[API/Clinic PATCH] Starting...");
    
    const { userId } = await auth();
    if (!userId) {
      console.log("[API/Clinic PATCH] No userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[API/Clinic PATCH] UserId:", userId);

    const body = await request.json();
    const { name, email, phone, address, city, country, description } = body;

    console.log("[API/Clinic PATCH] Request body:", { name, email, phone, address, city, country });

    // 1. Check if user already has a clinic_id
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .maybeSingle();
    
    if (userError) {
      console.error("[API/Clinic PATCH] User query error:", userError);
      return NextResponse.json({ error: "Failed to fetch user", details: userError.message }, { status: 500 });
    }

    console.log("[API/Clinic PATCH] Existing user:", existingUser);
    
    let clinicId = existingUser?.clinic_id;

    // 2. If no clinic_id, check if a clinic with this email already exists
    if (!clinicId && email) {
      console.log("[API/Clinic PATCH] No clinic_id, checking for existing clinic with email:", email);
      
      const { data: existingClinic, error: clinicCheckError } = await supabase
        .from("clinics")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      
      if (clinicCheckError) {
        console.error("[API/Clinic PATCH] Clinic check error:", clinicCheckError);
        return NextResponse.json({ error: "Failed to check clinic", details: clinicCheckError.message }, { status: 500 });
      }

      if (existingClinic) {
        console.log("[API/Clinic PATCH] Found existing clinic:", existingClinic.id);
        clinicId = existingClinic.id;
        
        // Link it to user immediately
        const { error: linkError } = await supabase
          .from("users")
          .upsert({ id: userId, clinic_id: clinicId, role: 'owner' });
        
        if (linkError) {
          console.error("[API/Clinic PATCH] Error linking clinic to user:", linkError);
          return NextResponse.json({ error: "Failed to link clinic", details: linkError.message }, { status: 500 });
        }
        
        console.log("[API/Clinic PATCH] Linked clinic to user");
      }
    }

    let result;
    if (clinicId) {
      console.log("[API/Clinic PATCH] Updating existing clinic:", clinicId);
      
      // Update existing
      const { data: updatedClinic, error: uErr } = await supabase
        .from("clinics")
        .update({ name, email, phone, address, city, country, description, updated_at: new Date().toISOString() })
        .eq("id", clinicId)
        .select()
        .single();
      
      if (uErr) {
        console.error("[API/Clinic PATCH] Update error:", uErr);
        return NextResponse.json({ error: "Failed to update clinic", details: uErr.message }, { status: 500 });
      }
      
      result = updatedClinic;
      console.log("[API/Clinic PATCH] Clinic updated successfully");
    } else {
      console.log("[API/Clinic PATCH] Creating new clinic");
      
      // Create NEW
      const { data: newClinic, error: cErr } = await supabase
        .from("clinics")
        .insert([{ name, email, phone, address, city, country: country || "الأردن", description, is_active: true }])
        .select()
        .single();

      if (cErr) {
        console.error("[API/Clinic PATCH] Create error:", cErr);
        return NextResponse.json({ error: "Failed to create clinic", details: cErr.message }, { status: 500 });
      }

      console.log("[API/Clinic PATCH] Clinic created:", newClinic.id);

      if (newClinic) {
        const { error: linkError } = await supabase
          .from("users")
          .upsert({ id: userId, clinic_id: newClinic.id, role: 'owner' });
        
        if (linkError) {
          console.error("[API/Clinic PATCH] Error linking new clinic to user:", linkError);
          return NextResponse.json({ error: "Failed to link clinic", details: linkError.message }, { status: 500 });
        }
        
        result = newClinic;
        console.log("[API/Clinic PATCH] New clinic linked to user");
      }
    }

    console.log("[API/Clinic PATCH] Success, returning clinic:", result?.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[API/Clinic PATCH] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
