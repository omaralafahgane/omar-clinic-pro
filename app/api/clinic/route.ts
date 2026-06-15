import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * GET: Fetch current clinic details for the logged-in user
 * Returns 404 if clinic data is missing - client should redirect to setup
 */
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return a response that indicates clinic setup is needed
    // This will trigger the client to redirect to settings page
    return NextResponse.json(
      { 
        error: "CLINIC_SETUP_REQUIRED",
        message: "بيانات العيادة غير مكتملة. يرجى إكمال الإعدادات.",
        requiresSetup: true
      },
      { status: 206 } // 206 Partial Content - indicates incomplete setup
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
 * PATCH: Update clinic details
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address, city } = body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "اسم العيادة مطلوب" },
        { status: 400 }
      );
    }

    // Return success - in a real app, this would save to database
    return NextResponse.json({ 
      success: true, 
      data: {
        id: userId,
        name: name || "عيادتي",
        phone: phone || "",
        address: address || "",
        city: city || "",
        country: "SA",
        is_active: true,
      }
    });
  } catch (error) {
    console.error("API Error (PATCH Clinic):", error);
    return NextResponse.json(
      { error: "فشل في حفظ البيانات" },
      { status: 500 }
    );
  }
}
