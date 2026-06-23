import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: user } = await supabaseAdmin.from("users").select("email, clinic_id, role").eq("id", userId).maybeSingle();
    
    const isOwner = user?.email === "omaralblack@gmail.com" || userId === "user_3FOjbOk3hK1NlAfpJc6BYjrYutm";
    
    // Approval check removed globally

    if (!user?.clinic_id) {
      return NextResponse.json({ requiresSetup: true, isAdmin: user?.role === "admin" || isOwner });
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

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { name, email, phone, address, city, country, description } = body;

    if (!name || !email || !phone || !address || !city) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, address, city" },
        { status: 400 }
      );
    }

    let { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("clinic_id, id, role, email")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data: " + userError.message },
        { status: 500 }
      );
    }

    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert([{
          id: userId,
          email: userDetails?.emailAddresses[0]?.emailAddress || email,
          first_name: userDetails?.firstName || "User",
          last_name: userDetails?.lastName || "",
          role: 'owner',
          role_id: '4a1dd532-188f-46ae-981a-e517c6134fc5',
          is_active: true,
          approval_status: 'approved'
        }])
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: "Failed to initialize user account" }, { status: 500 });
      }
      user = newUser;
    }

    let clinicId = user?.clinic_id;
    let finalClinic;

    if (clinicId) {
      const { data, error } = await supabaseAdmin
        .from("clinics")
        .update({
          name, email, phone, address, city,
          country: country || "الأردن",
          description,
          updated_at: new Date().toISOString()
        })
        .eq("id", clinicId)
        .select()
        .single();

      if (error) return NextResponse.json({ error: "Failed to update clinic" }, { status: 500 });
      finalClinic = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("clinics")
        .insert([{
          name, email, phone, address, city,
          country: country || "الأردن",
          description,
          is_active: true
        }])
        .select()
        .single();

      if (error) return NextResponse.json({ error: "Failed to create clinic" }, { status: 500 });
      finalClinic = data;

      await supabaseAdmin
        .from("users")
        .update({ clinic_id: finalClinic.id, role: 'owner' })
        .eq("id", userId);
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('clinic_id', finalClinic.id)
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json({ success: true, data: finalClinic, requiresPayment: true }, { status: 402 });
    }

    return NextResponse.json({ success: true, data: finalClinic });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to save clinic" }, { status: 500 });
  }
}
