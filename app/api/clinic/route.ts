import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clinicsDb, usersDb } from "@/lib/supabase";

/**
 * GET: Fetch current clinic details for the logged-in user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user to get their clinic_id
    const userResult = await usersDb.findById(userId);
    if (!userResult.success || !userResult.data?.clinic_id) {
      return NextResponse.json({ error: "Clinic not found for this user" }, { status: 404 });
    }

    const clinicId = userResult.data.clinic_id;
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

    // Find user to get their clinic_id
    const userResult = await usersDb.findById(userId);
    if (!userResult.success || !userResult.data?.clinic_id) {
      return NextResponse.json({ error: "Clinic not found for this user" }, { status: 404 });
    }

    const clinicId = userResult.data.clinic_id;
    
    // Update clinic in DB
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
