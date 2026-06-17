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

  // التحقق من دور المستخدم لتحديد لوحة التحكم المناسبة
  const { data: user } = await supabase
    .from("users")
    .select("roles(name)")
    .eq("id", userId)
    .single();

  const role = (user as any)?.roles?.name;

  if (role === "admin") {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/clinic");
  }
}
