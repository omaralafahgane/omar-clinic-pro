import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./lib/supabase"; // Import supabaseAdmin for server-side operations
import { ROLES } from "./lib/roles"; // Import roles
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/pricing(.*)",
  "/contact(.*)",
  "/api/webhooks/(.*)",
  "/auth-error(.*)"
]);

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

  // 1. If public route, allow access
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // 2. Protect non-public routes
  if (!userId) {
    return (await auth()).redirectToSignIn();
  }

  // 3. Special handling for dashboard routes (Subscription & Role checks)
  if (isDashboardRoute(request)) {
    // Note: In a real middleware, we would fetch the user's status from a fast cache or DB
    // For this implementation, we allow the request to proceed but the pages/API will handle
    // the specific "requires payment" or "no permission" states to avoid slow middleware.
    
    // Fetch user's role from Supabase (or sessionClaims if available)
    let userRole = sessionClaims?.role as string || ROLES.RECEPTIONIST; // Default to receptionist if no role

    if (userId && !sessionClaims?.role) {
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (user && user.role) {
        userRole = user.role;
      } else if (error) {
        console.error("Error fetching user role in middleware:", error);
      }
    }

    // Attach the user's role to the request headers for downstream API/page access
    const response = NextResponse.next();
    response.headers.set("x-user-role", userRole);
    return response;
  }

  // Default role for other routes if not set above
  const response = NextResponse.next();
  response.headers.set("x-user-role", sessionClaims?.role as string || ROLES.RECEPTIONIST);
  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
