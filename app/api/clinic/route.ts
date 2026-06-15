import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { clinicsDb } from "@/lib/supabase";

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

    // Try to fetch clinic by user ID
    const result = await clinicsDb.findById(userId);

    if (result.success && result.data) {
      return NextResponse.json(result.data);
    }

    // If clinic not found, return setup required
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

    const body = await req.json();
    const { name, email, phone, address, city, country, website, description } = body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "اسم العيادة مطلوب" },
        { status: 400 }
      );
    }

    // Try to update clinic with the given ID
    const updateResult = await clinicsDb.update(userId, {
      name,
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      country: country || "SA",
      website: website || "",
      description: description || "",
    });

    if (updateResult.success) {
      return NextResponse.json({ 
        success: true, 
        data: updateResult.data,
        message: "تم حفظ البيانات بنجاح"
      });
    }

    // If update failed (clinic doesn't exist), try to create it
    const createResult = await clinicsDb.create({
      id: userId, // Use userId as clinic ID for direct lookup
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
    });

    if (createResult.success) {
      return NextResponse.json({ 
        success: true, 
        data: createResult.data,
        message: "تم إنشاء وحفظ بيانات العيادة بنجاح"
      });
    }

    // If both failed, return error
    return NextResponse.json(
      { 
        error: "فشل في حفظ البيانات",
        details: (createResult.error as any)?.message || "حاول مرة أخرى"
      },
      { status: 500 }
    );
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
