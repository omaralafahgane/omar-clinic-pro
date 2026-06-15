import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { clinicsDb, usersDb } from "@/lib/supabase";

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

    // Find user to get their clinic_id
    let userResult = await usersDb.findById(userId);
    
    // If user doesn't exist in Supabase yet (first time login), the webhook might be slow
    // Let's try to find by email or create a placeholder if needed for this session
    if (!userResult.success || !userResult.data) {
      console.log("User not found in Supabase, checking by email...");
      const email = user?.emailAddresses[0]?.emailAddress;
      if (email) {
        userResult = await usersDb.findByEmail(email);
      }
    }

    let clinicId = userResult.data?.clinic_id;

    // If no clinic associated, create a default one for the user
    if (!clinicId) {
      console.log("No clinic found for user, creating a default one...");
      const defaultClinic = await clinicsDb.create({
        name: `${user?.firstName || 'عيادة'} ${user?.lastName || 'جديدة'}`,
        email: user?.emailAddresses[0]?.emailAddress || "",
        phone: "",
        address: "",
        city: "",
        country: "SA",
        owner_id: userId
      });

      if (defaultClinic.success) {
        clinicId = defaultClinic.data.id;
        // Link user to this clinic
        await usersDb.update(userId, { clinic_id: clinicId });
      } else {
        return NextResponse.json({ error: "Failed to create initial clinic" }, { status: 500 });
      }
    }

    const clinicResult = await clinicsDb.findById(clinicId);
    if (!clinicResult.success) {
      return NextResponse.json({ error: "Failed to fetch clinic details" }, { status: 500 });
    }

    return NextResponse.json(clinicResult.data);
  } catch (error) {
    console.error("API Error (GET Clinic):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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

    const userResult = await usersDb.findById(userId);
    const clinicId = userResult.data?.clinic_id;

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }
    
    const updateResult = await clinicsDb.update(clinicId, {
      name,
      phone,
      address,
      city
    });

    if (!updateResult.success) {
      return NextResponse.json({ error: "Failed to update clinic" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updateResult.data });
  } catch (error) {
    console.error("API Error (PATCH Clinic):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
