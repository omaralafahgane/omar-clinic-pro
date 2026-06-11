// Middleware for Route Protection and Authentication with Subscription Check
// Production-ready Next.js middleware for Omar Clinic Pro

import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ============================================================================
// ROUTE PROTECTION CONFIGURATION
// ============================================================================

const PROTECTED_ROUTES = {
  admin: /^\/dashboard\/admin/,
  clinic: /^\/dashboard\/clinic/,
};

const PUBLIC_ROUTES = [
  "/", "/features", "/pricing", "/contact", "/free-trial", 
  "/login", "/sign-up", "/forgot-password", "/subscription-expired"
];

// ============================================================================
// CLERK MIDDLEWARE CONFIGURATION
// ============================================================================

export default authMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = auth();
  const pathname = req.nextUrl.pathname;

  // 1. Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // 2. Check if user is authenticated
  if (!userId) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // 3. Get user metadata
  const userRole = (sessionClaims?.metadata as any)?.role || "patient";
  const userClinicId = (sessionClaims?.metadata as any)?.clinic_id;
  const subscriptionStatus = (sessionClaims?.metadata as any)?.subscription_status; // Should be injected via Clerk Webhooks

  // 4. Admin Dashboard Protection
  if (PROTECTED_ROUTES.admin.test(pathname)) {
    if (userRole !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
    }
    return NextResponse.next();
  }

  // 5. Clinic Dashboard & Subscription Protection
  if (PROTECTED_ROUTES.clinic.test(pathname)) {
    // Super Admin can always access
    if (userRole === "super_admin") return NextResponse.next();

    // Check if user has a clinic
    if (!userClinicId) {
      return NextResponse.redirect(new URL("/free-trial", req.url));
    }

    // CRITICAL: Subscription Check
    // If subscription is expired/inactive, redirect to expired page
    // Note: In a real app, you might want to allow access to the 'subscription' page specifically
    if (subscriptionStatus === "expired" || subscriptionStatus === "inactive") {
      if (pathname !== "/dashboard/clinic/subscription") {
        return NextResponse.redirect(new URL("/subscription-expired", req.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
