import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { ROLES } from "./lib/roles";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/pricing(.*)",
  "/contact(.*)",
  "/api/webhooks/(.*)",
  "/api/auth/check-email(.*)",
  "/auth-error(.*)"
]);

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // 1. If public route, allow access
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // 2. Protect non-public routes
  if (!userId) {
    return (await auth()).redirectToSignIn();
  }

  // 3. Role handling for dashboard
  if (isDashboardRoute(request)) {
    // Check if user exists in our DB
    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    let userRole = user?.role;

    // If user doesn't exist in our DB yet, create them as 'owner'
    // This happens when they first sign up via Clerk
    if (!user && !error) {
      const { data: newUser } = await supabase
        .from("users")
        .insert([{ id: userId, role: ROLES.OWNER }])
        .select("role")
        .single();
      userRole = newUser?.role;
    }

    // Default to receptionist if still no role found
    const finalRole = userRole || ROLES.RECEPTIONIST;

    const response = NextResponse.next();
    response.headers.set("x-user-role", finalRole);
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
