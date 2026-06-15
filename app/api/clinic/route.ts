import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * GET: Fetch current clinic details for the logged-in user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If no Supabase connection, return setup required
    if (!supabase) {
      return NextResponse.json(
        { 
          error: "CLINIC_SETUP_REQUIRED",
          message: "بيانات العيادة غير مكتملة. يرجى إكمال الإعدادات.",
          requiresSetup: true
        },
        { status: 206 }
      );
    }

    // Try to find clinic by user ID
    const { data: clinics, error: clinicError } = await supabase
      .from("clinics")
      .select("*")
      .eq("owner_id", userId)
      .limit(1);

    if (clinicError) {
      console.error("Error fetching clinic:", clinicError);
      return NextResponse.json(
        { 
          error: "CLINIC_SETUP_REQUIRED",
          message: "بيانات العيادة غير مكتملة. يرجى إكمال الإعدادات.",
          requiresSetup: true
        },
        { status: 206 }
      );
    }

    // If clinic exists, return it
    if (clinics && clinics.length > 0) {
      return NextResponse.json(clinics[0]);
    }

    // If no clinic found, return setup required
    return NextResponse.json(
      { 
        error: "CLINIC_SETUP_REQUIRED",
        message: "بيانات العيادة غير مكتملة. يرجى إكمال الإعدادات.",
        requiresSetup: true
      },
      { status: 206 }
    );
  } catch (error) {
    console.error("API Error (GET Clinic):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update or create clinic details
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

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "اسم العيادة مطلوب" },
        { status: 400 }
      );
    }

    // First, try to find existing clinic
    const { data: existingClinics, error: findError } = await supabase
      .from("clinics")
      .select("id")
      .eq("owner_id", userId)
      .limit(1);

    if (findError) {
      console.error("Error finding clinic:", findError);
    }

    let result;

    if (existingClinics && existingClinics.length > 0) {
      // Update existing clinic
      const clinicId = existingClinics[0].id;
      
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
        .eq("id", clinicId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating clinic:", updateError);
        throw updateError;
      }

      result = updatedClinic;
    } else {
      // Create new clinic
      const { data: newClinic, error: createError } = await supabase
        .from("clinics")
        .insert([
          {
            owner_id: userId,
            name,
            email: email || user?.primaryEmailAddress?.emailAddress || "",
            phone: phone || "",
            address: address || "",
            city: city || "",
            country: country || "SA",
            website: website || "",
            description: description || "",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating clinic:", createError);
        throw createError;
      }

      result = newClinic;
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: "تم حفظ البيانات بنجاح"
    });
  } catch (error: any) {
    console.error("API Error (PATCH Clinic):", error);
    return NextResponse.json(
      { 
        error: "فشل في حفظ البيانات",
        details: error.message || "حاول مرة أخرى"
      },
      { status: 500 }
    );
  }
}
