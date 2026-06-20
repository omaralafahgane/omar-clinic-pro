import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  // التحقق من دور المستخدم وحالة الموافقة لتحديد لوحة التحكم المناسبة
  const { data: user } = await supabase
    .from("users")
    .select("email, roles(name), approval_status")
    .eq("id", userId)
    .single();

  const userEmail = (user as any)?.email;
  let role = (user as any)?.roles?.name;
  let approvalStatus = (user as any)?.approval_status;

  // Hardcoded override for the main admin
  if (userEmail === "omaralblack@gmail.com" || userId === "user_2tvrCaJBV8I6gabDLa4YCL") {
    role = "admin";
    approvalStatus = "approved";
  }

  // 1. Check approval status first
  if (approvalStatus !== "approved" && role !== "admin") {
    redirect("/waiting-approval");
  }

  // 2. Redirect based on role
  if (role === "admin") {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/clinic");
  }
}
