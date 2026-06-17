import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration");
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * GET: Fetch clinic data for the logged-in user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Find user first to get their clinic_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .single();

    if (userError || !user?.clinic_id) {
      return NextResponse.json(
        { 
          error: "CLINIC_SETUP_REQUIRED",
          message: "يرجى إكمال بيانات العيادة",
          requiresSetup: true
        },
        { status: 206 }
      );
    }

    // Check subscription status
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("clinic_id", user.clinic_id)
      .maybeSingle();

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { 
          error: "PAYMENT_REQUIRED",
          message: "يرجى اختيار خطة اشتراك وتفعيل الحساب",
          requiresPayment: true
        },
        { status: 402 } // Payment Required
      );
    }

    // Query clinics table for this user
    const { data, error } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", user.clinic_id)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch clinic data", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { 
          error: "CLINIC_SETUP_REQUIRED",
          message: "يرجى إكمال بيانات العيادة",
          requiresSetup: true
        },
        { status: 206 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Error (GET):", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update or create clinic data
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { name, email, phone, address, city, country, website, description } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "اسم العيادة مطلوب" },
        { status: 400 }
      );
    }

    // Find user first to get their clinic_id
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .single();

    const clinicId = userRecord?.clinic_id;

    // Check if clinic exists for this user
    const { data: existingClinic, error: checkError } = clinicId 
      ? await supabase
          .from("clinics")
          .select("id")
          .eq("id", clinicId)
          .maybeSingle()
      : { data: null, error: null };

    if (checkError) {
      console.error("Error checking clinic:", checkError);
      return NextResponse.json(
        { error: "Failed to check clinic", details: checkError.message },
        { status: 500 }
      );
    }

    let result;

    if (existingClinic) {
      // Update existing clinic
      const { data: updatedClinic, error: updateError } = await supabase
        .from("clinics")
        .update({
          name,
          email: email || "",
          phone: phone || "",
          address: address || "",
          city: city || "",
          country: country || "SA",
          website: website || "",
          description: description || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingClinic.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update clinic", details: updateError.message },
          { status: 500 }
        );
      }

      result = updatedClinic;
    } else {
      // Create new clinic
      const { data: newClinic, error: createError } = await supabase
        .from("clinics")
        .insert([
          {
            name,
            email: email || user?.primaryEmailAddress?.emailAddress || "",
            phone: phone || "",
            address: address || "",
            city: city || "",
            country: country || "JO",
            website: website || "",
            description: description || "",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (!createError && newClinic) {
        // Update user with new clinic_id
        await supabase
          .from("users")
          .update({ clinic_id: newClinic.id })
          .eq("id", userId);
      }

      if (createError) {
        console.error("Create error:", createError);
        return NextResponse.json(
          { error: "Failed to create clinic", details: createError.message },
          { status: 500 }
        );
      }

      result = newClinic;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: "تم حفظ البيانات بنجاح في قاعدة البيانات",
    });
  } catch (error: any) {
    console.error("API Error (PATCH):", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
