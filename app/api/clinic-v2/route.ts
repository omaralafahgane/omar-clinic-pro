import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: user } = await supabaseAdmin.from("users").select("clinic_id").eq("id", userId).maybeSingle();
    
    if (!user?.clinic_id) {
      return NextResponse.json({ requiresSetup: true });
    }

    const { data: clinic } = await supabaseAdmin.from("clinics").select("*").eq("id", user.clinic_id).maybeSingle();
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

    const userDetails = await currentUser();

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

    // 1. Get or Create user's record in Supabase using ADMIN client
    let { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("clinic_id, id")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data: " + userError.message },
        { status: 500 }
      );
    }

    // If user doesn't exist in Supabase (Webhook failed), create them now using ADMIN client
    if (!user) {
      console.log("User not found in Supabase, creating from Clerk session...");
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert([{
          id: userId,
          email: userDetails?.emailAddresses[0]?.emailAddress || email,
          first_name: userDetails?.firstName || "User",
          last_name: userDetails?.lastName || "",
          role: 'owner',
          role_id: '4a1dd532-188f-46ae-981a-e517c6134fc5', // clinic_owner role ID
          is_active: true
        }])
        .select()
        .single();

      if (createError) {
        console.error("Error auto-creating user:", createError);
        return NextResponse.json(
          { error: "Failed to initialize user account: " + createError.message },
          { status: 500 }
        );
      }
      user = newUser;
    }

    let clinicId = user?.clinic_id;
    let finalClinic;

    if (clinicId) {
      // UPDATE EXISTING CLINIC using ADMIN client
      const { data, error } = await supabaseAdmin
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
      // CREATE NEW CLINIC using ADMIN client
      const { data, error } = await supabaseAdmin
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

      // LINK CLINIC TO USER using ADMIN client
      const { error: linkError } = await supabaseAdmin
        .from("users")
        .update({ clinic_id: finalClinic.id, role: 'owner' })
        .eq("id", userId);

      if (linkError) {
        console.error("Error linking clinic to user:", linkError);
        return NextResponse.json(
          { error: "Failed to link clinic to user: " + linkError.message },
          { status: 500 }
        );
      }
    }

    // Check for subscription using ADMIN client
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('clinic_id', finalClinic.id)
      .maybeSingle();

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
