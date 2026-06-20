import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const targetUserId = params.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if requester is admin
    const client = await clerkClient();
    const requester = await client.users.getUser(userId);
    if (requester.publicMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Update Clerk Metadata
    await client.users.updateUser(targetUserId, {
      publicMetadata: {
        ...((await client.users.getUser(targetUserId)).publicMetadata),
        approval_status: "approved",
      },
    });

    // 2. Update Supabase Database
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .update({ approval_status: "approved" })
      .eq("id", targetUserId);

    if (dbError) {
      console.error("Database update error:", dbError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
