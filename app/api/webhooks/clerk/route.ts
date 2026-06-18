// Clerk Webhook Handler
// Synchronizes Clerk users to Supabase database
// Handles user creation, update, and deletion events

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rolesDb, clinicsDbHelpers, activityLogsDb } from "@/lib/supabase";

// ============================================================================
// WEBHOOK VERIFICATION
// ============================================================================

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret && process.env.NODE_ENV !== "production") {
  throw new Error("CLERK_WEBHOOK_SECRET is not set");
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(req: Request) {
  try {
    // Get headers
    const headerPayload = await headers();
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
    const wh = new Webhook(webhookSecret as string);

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
        // Determine role based on email
        let roleName = "owner";
        if (email === "omaralblack@gmail.com") {
          roleName = "admin";
        }

        // Get role from database
        const roleResult = await rolesDb.findByName(roleName);

        if (!roleResult.success) {
          throw new Error(`${roleName} role not found`);
        }

        // New users will start without a clinic and be redirected to setup
        let clinicId = null;

        // Create user in Supabase using service role client (bypasses RLS)
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .insert([
            {
              id,
              email,
              first_name: first_name || "User",
              last_name: last_name || "",
              role_id: roleResult.data.id,
              clinic_id: clinicId,
              phone,
              is_active: true,
              role: roleName // Sync role string directly for faster access
            },
          ])
          .select()
          .single();

        // Sync to Clerk Public Metadata for frontend role checks
        // Note: This requires the Clerk SDK which is typically used in server actions
        // but here we can rely on the webhook to keep Supabase as the source of truth.

        if (error) {
          throw error;
        }

        // Log user creation
        await activityLogsDb.log({
          clinic_id: clinicId || "system",
          user_id: id,
          entity_type: "users",
          entity_id: id,
          action: "create",
          new_values: {
            email,
            first_name,
            last_name,
            role: roleName,
            clinic_id: clinicId,
          },
          status: "success",
        });

        console.log(`✅ User created: ${email} (role: ${roleName}, clinic: ${clinicId})`);
        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        console.error("❌ Error creating user:", error);

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
          { error: "Failed to create user", details: String(error) },
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
        // Update user in Supabase using service role client
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .update({
            first_name: first_name || "User",
            last_name: last_name || "",
            phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Log user update
        await activityLogsDb.log({
          clinic_id: user?.clinic_id || "system",
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

        console.log(`✅ User updated: ${email}`);
        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        console.error("❌ Error updating user:", error);

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
          { error: "Failed to update user", details: String(error) },
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
        // Hard delete user from Supabase using service role client
        const { error } = await supabaseAdmin
          .from("users")
          .delete()
          .eq("id", id);

        if (error) {
          throw error;
        }

        // Log user deletion (using a generic system log since user is gone)
        await activityLogsDb.log({
          clinic_id: "system",
          user_id: id,
          entity_type: "users",
          entity_id: id,
          action: "hard_delete",
          status: "success",
        });

        console.log(`✅ User hard deleted: ${id}`);
        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        console.error("❌ Error deleting user:", error);

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
          { error: "Failed to delete user", details: String(error) },
          { status: 500 }
        );
      }
    }

    // Handle other event types
    console.log(`ℹ️ Unhandled event type: ${evt.type}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
