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
const isSettingsRoute = createRouteMatcher(["/dashboard/clinic/settings(.*)"]);

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

  // 3. Skip complex role checks for settings page to avoid redirect loops
  if (isSettingsRoute(request)) {
    return NextResponse.next();
  }

  // 4. Role handling for dashboard
  if (isDashboardRoute(request)) {
    const { data: user } = await supabase
      .from("users")
      .select("role, clinic_id")
      .eq("id", userId)
      .maybeSingle();

    const response = NextResponse.next();
    if (user) {
      response.headers.set("x-user-role", user.role);
      response.headers.set("x-clinic-id", user.clinic_id || "");
    }
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
