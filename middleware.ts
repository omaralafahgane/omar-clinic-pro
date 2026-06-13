// Middleware for Route Protection and Authentication with Subscription Check
// Production-ready Next.js middleware for Omar Clinic Pro
// ENHANCED: Fixed Super Admin security, subscription enforcement, and role validation

import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

// Routes that don't require active subscription (but require auth)
const SUBSCRIPTION_EXEMPT_ROUTES = [
  "/dashboard/clinic/subscription", // Allow access to subscription management
  "/subscription-expired", // Allow access to expired page
];

// ============================================================================
// CLERK MIDDLEWARE CONFIGURATION
// ============================================================================

export default authMiddleware({
  publicRoutes: PUBLIC_ROUTES,
  afterAuth(auth, req) {
    const { userId, sessionClaims } = auth;
    const pathname = req.nextUrl.pathname;

    // ========================================================================
    // STEP 1: Check if user is authenticated
    // ========================================================================
    if (!userId) {
      // Allow access to public routes without authentication
      if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
      }
      
      // Redirect unauthenticated users to login for protected routes
      if (pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      
      return NextResponse.next();
    }

    // ========================================================================
    // STEP 2: Extract and validate user metadata from Clerk
    // ========================================================================
    const userRole = (sessionClaims?.metadata as any)?.role || "patient";
    const userClinicId = (sessionClaims?.metadata as any)?.clinic_id;
    const subscriptionStatus = (sessionClaims?.metadata as any)?.subscription_status;
    
    // SECURITY FIX: Validate role value to prevent privilege escalation
    const validRoles = ["patient", "doctor", "clinic_owner", "admin"];
    if (!validRoles.includes(userRole)) {
      console.warn(`Invalid role detected: ${userRole} for user ${userId}`);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ========================================================================
    // STEP 3: SUPER ADMIN DASHBOARD PROTECTION
    // ========================================================================
    // FIXED: Changed from "super_admin" to "admin" to match DB schema
    if (PROTECTED_ROUTES.admin.test(pathname)) {
      // Only users with "admin" role can access admin dashboard
      if (userRole !== "admin") {
        console.warn(`Unauthorized admin access attempt by user ${userId} with role ${userRole}`);
        return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
      }
      
      // Admin users bypass subscription checks
      return NextResponse.next();
    }

    // ========================================================================
    // STEP 4: CLINIC DASHBOARD PROTECTION & SUBSCRIPTION ENFORCEMENT
    // ========================================================================
    if (PROTECTED_ROUTES.clinic.test(pathname)) {
      // Admin users have full access
      if (userRole === "admin") {
        return NextResponse.next();
      }

      // Check if user has an associated clinic
      if (!userClinicId) {
        console.warn(`User ${userId} attempted clinic access without clinic_id`);
        return NextResponse.redirect(new URL("/free-trial", req.url));
      }

      // ====================================================================
      // CRITICAL: SUBSCRIPTION ENFORCEMENT
      // ====================================================================
      // Check if subscription is active/valid
      const isSubscriptionActive = subscriptionStatus === "active" || subscriptionStatus === "trial";
      const isSubscriptionExpired = subscriptionStatus === "expired" || subscriptionStatus === "inactive" || !subscriptionStatus;
      
      // Allow access to subscription management pages even if subscription is expired
      const isSubscriptionExemptRoute = SUBSCRIPTION_EXEMPT_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route)
      );
      
      if (isSubscriptionExpired && !isSubscriptionExemptRoute) {
        console.warn(`User ${userId} with expired subscription attempted access to ${pathname}`);
        return NextResponse.redirect(new URL("/subscription-expired", req.url));
      }

      // If subscription is not active and not exempt, redirect to subscription page
      if (!isSubscriptionActive && !isSubscriptionExemptRoute) {
        console.warn(`User ${userId} with inactive subscription (${subscriptionStatus}) attempted access to ${pathname}`);
        return NextResponse.redirect(new URL("/dashboard/clinic/subscription", req.url));
      }

      return NextResponse.next();
    }

    // ========================================================================
    // STEP 5: Default behavior for other routes
    // ========================================================================
    return NextResponse.next();
  }
})
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
