import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// import { supabaseAdmin as supabase } from "@/lib/supabase";

import { supabaseAdmin as supabase } from "@/lib/supabase";

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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { name, email, phone, address, city, country, description } = body;

    // Validate required fields
    if (!name || !email || !phone || !address || !city) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, address, city" },
        { status: 400 }
      );
    }

    // 1. Get user's current clinic_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    let clinicId = user?.clinic_id;
    let finalClinic;

    if (clinicId) {
      // UPDATE EXISTING CLINIC
      const { data, error } = await supabase
        .from("clinics")
        .update({
          name,
          email,
          phone,
          address,
          city,
          country: country || "الأردن",
          description,
          updated_at: new Date().toISOString()
        })
        .eq("id", clinicId)
        .select()
        .single();

      if (error) {
        console.error("Error updating clinic:", error);
        return NextResponse.json(
          { error: "Failed to update clinic: " + error.message },
          { status: 500 }
        );
      }
      finalClinic = data;
    } else {
      // CREATE NEW CLINIC
      const { data, error } = await supabase
        .from("clinics")
        .insert([{
          name,
          email,
          phone,
          address,
          city,
          country: country || "الأردن",
          description,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating clinic:", error);
        return NextResponse.json(
          { error: "Failed to create clinic: " + error.message },
          { status: 500 }
        );
      }
      finalClinic = data;

      // LINK CLINIC TO USER
      const { error: linkError } = await supabase
        .from("users")
        .update({ clinic_id: finalClinic.id, role: 'owner' })
        .eq("id", userId);

      if (linkError) {
        console.error("Error linking clinic to user (update failed), trying upsert:", linkError);
        // Try upsert if update fails
        const { error: upsertError } = await supabase
          .from("users")
          .upsert({
            id: userId,
            clinic_id: finalClinic.id,
            role: 'owner'
          });

        if (upsertError) {
          console.error("Error linking clinic to user (upsert failed):", upsertError);
          return NextResponse.json(
            { error: "Failed to link clinic to user" },
            { status: 500 }
          );
        }
      }
    }

    // After clinic creation/update, check subscription status
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('clinic_id', finalClinic.id)
      .maybeSingle();

    if (subError && subError.code !== 'PGRST116') {
      console.error("Error checking subscription:", subError);
      // Don't fail if subscription check fails, just proceed
    }

    // If no subscription, return 402 Payment Required to trigger subscription page
    if (!subscription) {
      return NextResponse.json(
        { success: true, data: finalClinic, requiresPayment: true },
        { status: 402 }
      );
    }

    return NextResponse.json({ success: true, data: finalClinic });
  } catch (error: any) {
    console.error("Clinic PATCH Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save clinic" },
      { status: 500 }
    );
  }
}
