import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUsers() {
  console.log("🚀 Starting mass sync of users to Clerk...");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase environment variables.");
    return;
  }

  // 1. Get all users from Supabase
  const { data: users, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    console.error("❌ Error fetching users from Supabase:", error);
    return;
  }

  console.log(`ℹ️ Found ${users.length} users to sync.`);

  const client = await clerkClient();

  for (const user of users) {
    try {
      console.log(`⏳ Syncing user: ${user.email} (${user.id})...`);
      
      // Update Clerk Metadata
      await client.users.updateUser(user.id, {
        publicMetadata: {
          role: user.role || "owner",
          approval_status: "approved", // Force approve all existing users
          clinic_id: user.clinic_id,
        },
      });

      // Also ensure Supabase is updated if it wasn't
      if (user.approval_status !== "approved") {
        await supabase
          .from("users")
          .update({ approval_status: "approved" })
          .eq("id", user.id);
        console.log(`✅ Supabase status updated for: ${user.email}`);
      }

      console.log(`✅ Successfully synced and approved in Clerk: ${user.email}`);
    } catch (err) {
      console.error(`❌ Failed to sync user ${user.email}:`, err);
    }
  }

  console.log("✨ Mass sync completed!");
}

syncUsers();
