// Clerk Webhook Handler
// Synchronizes Clerk users to Supabase database
// Handles user creation, update, and deletion events

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { usersDb, activityLogsDb, rolesDb } from "@/lib/supabase";

// ============================================================================
// WEBHOOK VERIFICATION
// ============================================================================

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("CLERK_WEBHOOK_SECRET is not set");
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(req: Request) {
  try {
    // Get headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // Verify webhook signature
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: "Missing webhook headers" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.text();
    const wh = new Webhook(webhookSecret);

    let evt;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 400 }
      );
    }

    // ====================================================================
    // HANDLE USER CREATED EVENT
    // ====================================================================
    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, phone_numbers } =
        evt.data;

      const email = email_addresses[0]?.email_address;
      const phone = phone_numbers[0]?.phone_number;

      if (!email) {
        return NextResponse.json(
          { error: "User email is required" },
          { status: 400 }
        );
      }

      try {
        // Get patient role
        const patientRole = await rolesDb.findByName("patient");

        if (!patientRole.success) {
          throw new Error("Patient role not found");
        }

        // Create user in Supabase
        const result = await usersDb.create({
          id,
          email,
          first_name: first_name || "User",
          last_name: last_name || "",
          role_id: patientRole.data.id,
          phone,
        });

        if (!result.success) {
          throw result.error;
        }

        // Log user creation
        await activityLogsDb.log({
          clinic_id: "system", // System-level event
          user_id: id,
          entity_type: "users",
          entity_id: id,
          action: "create",
          new_values: {
            email,
            first_name,
            last_name,
            role: "patient",
          },
          status: "success",
        });

        console.log(`User created: ${email}`);
        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        console.error("Error creating user:", error);

        // Log failed creation
        await activityLogsDb.log({
          clinic_id: "system",
          user_id: id,
          entity_type: "users",
          entity_id: id,
          action: "create",
          status: "failed",
          error_message: String(error),
        });

        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
    }

    // ====================================================================
    // HANDLE USER UPDATED EVENT
    // ====================================================================
    if (evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, phone_numbers } =
        evt.data;

      const email = email_addresses[0]?.email_address;
      const phone = phone_numbers[0]?.phone_number;

      try {
        // Update user in Supabase
        const result = await usersDb.update(id, {
          email,
          first_name: first_name || "User",
          last_name: last_name || "",
          phone,
        });

        if (!result.success) {
          throw result.error;
        }

        // Log user update
        await activityLogsDb.log({
          clinic_id: "system",
          user_id: id,
          entity_type: "users",
          entity_id: id,
          action: "update",
          new_values: {
            email,
            first_name,
            last_name,
          },
          status: "success",
        });

        console.log(`User updated: ${email}`);
        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        console.error("Error updating user:", error);

        // Log failed update
        await activityLogsDb.log({
          clinic_id: "system",
          user_id: id,
          entity_type: "users",
          entity_id: id,
          action: "update",
          status: "failed",
          error_message: String(error),
        });

        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        );
      }
    }

    // ====================================================================
    // HANDLE USER DELETED EVENT
    // ====================================================================
    if (evt.type === "user.deleted") {
      const { id } = evt.data;

      try {
        // Soft delete user in Supabase
        const result = await usersDb.delete(id);

        if (!result.success) {
          throw result.error;
        }

        // Log user deletion
        await activityLogsDb.log({
          clinic_id: "system",
          user_id: id,
          entity_type: "users",
          entity_id: id,
          action: "delete",
          status: "success",
        });

        console.log(`User deleted: ${id}`);
        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        console.error("Error deleting user:", error);

        // Log failed deletion
        await activityLogsDb.log({
          clinic_id: "system",
          user_id: id,
          entity_type: "users",
          entity_id: id,
          action: "delete",
          status: "failed",
          error_message: String(error),
        });

        return NextResponse.json(
          { error: "Failed to delete user" },
          { status: 500 }
        );
      }
    }

    // Handle other event types
    console.log(`Unhandled event type: ${evt.type}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
