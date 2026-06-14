import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ============================================================================
// ROUTE MATCHERS CONFIGURATION
// ============================================================================

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/features",
  "/pricing",
  "/contact",
  "/free-trial",
  "/login(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/subscription-expired",
  "/api/webhooks(.*)" // Ensure webhooks are public
]);

// Admin routes
const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);

// Clinic routes
const isClinicRoute = createRouteMatcher(["/dashboard/clinic(.*)"]);

// Routes that don't require active subscription (but require auth)
const isSubscriptionExemptRoute = createRouteMatcher([
  "/dashboard/clinic/subscription(.*)",
  "/subscription-expired"
]);

// ============================================================================
// MIDDLEWARE LOGIC
// ============================================================================

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;

  // 1. Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2. Protect all other routes
  if (!userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Extract metadata
  const metadata = (sessionClaims?.metadata as any) || {};
  const userRole = metadata.role || "patient";
  const userClinicId = metadata.clinic_id;
  const subscriptionStatus = metadata.subscription_status;

  // 4. Admin Protection
  if (isAdminRoute(req)) {
    if (userRole !== "admin") {
      console.warn(`Unauthorized admin access attempt by user ${userId} with role ${userRole}`);
      return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
    }
    return NextResponse.next();
  }

  // 5. Clinic Protection & Subscription Enforcement
  if (isClinicRoute(req)) {
    // Admins have full access
    if (userRole === "admin") {
      return NextResponse.next();
    }

    // Check if user has an associated clinic
    if (!userClinicId) {
      console.warn(`User ${userId} attempted clinic access without clinic_id`);
      return NextResponse.redirect(new URL("/free-trial", req.url));
    }

    // Subscription enforcement
    const isSubscriptionActive = subscriptionStatus === "active" || subscriptionStatus === "trial";
    const isSubscriptionExpired = subscriptionStatus === "expired" || subscriptionStatus === "inactive" || !subscriptionStatus;

    if (isSubscriptionExpired && !isSubscriptionExemptRoute(req)) {
      console.warn(`User ${userId} with expired subscription attempted access to ${pathname}`);
      return NextResponse.redirect(new URL("/subscription-expired", req.url));
    }

    if (!isSubscriptionActive && !isSubscriptionExemptRoute(req)) {
      console.warn(`User ${userId} with inactive subscription (${subscriptionStatus}) attempted access to ${pathname}`);
      return NextResponse.redirect(new URL("/dashboard/clinic/subscription", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
