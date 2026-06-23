import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  // التحقق من دور المستخدم لتحديد لوحة التحكم المناسبة
  const { data: user } = await supabase
    .from("users")
    .select("email, role")
    .eq("id", userId)
    .single();

  const userEmail = (user as any)?.email || sessionClaims?.email;
  let role = (user as any)?.role;

  // Hardcoded override for the main admin to ensure he always gets the admin dashboard
  if (userEmail === "omaralblack@gmail.com" || userId === "user_3FOjbOk3hK1NlAfpJc6BYjrYutm") {
    role = "admin";
  }

  // Redirect based on role (Approval check removed)
  if (role === "admin") {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/clinic");
  }
}
