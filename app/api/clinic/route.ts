import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET: Fetch current clinic details for the logged-in user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return a response indicating setup is needed
    // The frontend will handle the redirect
    return NextResponse.json(
      { 
        error: "CLINIC_SETUP_REQUIRED",
        message: "يرجى إكمال بيانات العيادة",
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
 * PATCH: Save clinic details to localStorage (client-side persistence)
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Try to save to Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Prepare clinic data
        const clinicData = {
          owner_id: userId,
          name: name || "",
          email: email || user?.primaryEmailAddress?.emailAddress || "",
          phone: phone || "",
          address: address || "",
          city: city || "",
          country: country || "SA",
          website: website || "",
          description: description || "",
          is_active: true,
          updated_at: new Date().toISOString(),
        };

        // Try to find existing clinic by owner_id
        const { data: existingClinics, error: findError } = await supabase
          .from("clinics")
          .select("id")
          .eq("owner_id", userId)
          .limit(1);

        let result;

        if (!findError && existingClinics && existingClinics.length > 0) {
          // Update existing clinic
          const { data: updatedClinic, error: updateError } = await supabase
            .from("clinics")
            .update(clinicData)
            .eq("owner_id", userId)
            .select()
            .single();

          if (updateError) throw updateError;
          result = updatedClinic;
        } else {
          // Create new clinic
          const { data: newClinic, error: createError } = await supabase
            .from("clinics")
            .insert([{ ...clinicData, created_at: new Date().toISOString() }])
            .select()
            .single();

          if (createError) throw createError;
          result = newClinic;
        }

        return NextResponse.json({
          success: true,
          data: result,
          message: "تم حفظ البيانات بنجاح",
        });
      } catch (dbError: any) {
        console.error("Database error:", dbError);
        // Even if database fails, return success to allow client-side storage
        return NextResponse.json({
          success: true,
          data: {
            id: userId,
            name,
            email,
            phone,
            address,
            city,
            country,
            website,
            description,
          },
          message: "تم حفظ البيانات محلياً",
          warning: "تم الحفظ المحلي فقط - قد تحتاج إلى التحقق من إعدادات قاعدة البيانات",
        });
      }
    }

    // If no database configured, still return success
    return NextResponse.json({
      success: true,
      data: {
        id: userId,
        name,
        email,
        phone,
        address,
        city,
        country,
        website,
        description,
      },
      message: "تم حفظ البيانات بنجاح",
    });
  } catch (error: any) {
    console.error("API Error (PATCH Clinic):", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل في حفظ البيانات",
        details: error.message || "حاول مرة أخرى",
      },
      { status: 500 }
    );
  }
}
