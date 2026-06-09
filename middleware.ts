// Middleware for Route Protection and Authentication
// Production-ready Next.js middleware for Omar Clinic Pro

import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// ROUTE PROTECTION CONFIGURATION
// ============================================================================

const PROTECTED_ROUTES = {
  // Admin routes - Super Admin only
  admin: /^\/dashboard\/admin/,

  // Clinic routes - Clinic Owner, Doctor, Receptionist, Accountant
  clinic: /^\/dashboard\/clinic/,

  // Doctor routes
  doctor: /^\/dashboard\/clinic\/patients/,

  // Receptionist routes
  receptionist: /^\/dashboard\/clinic\/appointments/,

  // Accountant routes
  accountant: /^\/dashboard\/clinic\/invoices/,
};

const PUBLIC_ROUTES = [
  "/",
  "/features",
  "/pricing",
  "/contact",
  "/free-trial",
  "/login",
  "/sign-up",
  "/forgot-password",
];

// ============================================================================
// CLERK MIDDLEWARE CONFIGURATION
// ============================================================================

export default authMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = auth();
  const pathname = req.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!userId) {
    // Redirect to login for protected routes
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Get user role and clinic ID from session claims
  const userRole = (sessionClaims?.metadata as any)?.role || "patient";
  const userClinicId = (sessionClaims?.metadata as any)?.clinic_id;

  // ========================================================================
  // ADMIN DASHBOARD PROTECTION
  // ========================================================================
  if (PROTECTED_ROUTES.admin.test(pathname)) {
    if (userRole !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
    }
    return NextResponse.next();
  }

  // ========================================================================
  // CLINIC DASHBOARD PROTECTION
  // ========================================================================
  if (PROTECTED_ROUTES.clinic.test(pathname)) {
    // Allow clinic_owner, doctor, receptionist, accountant
    const allowedRoles = [
      "super_admin",
      "clinic_owner",
      "doctor",
      "receptionist",
      "accountant",
    ];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check clinic_id for non-super-admin users
    if (userRole !== "super_admin" && !userClinicId) {
      return NextResponse.redirect(new URL("/free-trial", req.url));
    }

    return NextResponse.next();
  }

  // ========================================================================
  // DOCTOR ROUTES PROTECTION
  // ========================================================================
  if (PROTECTED_ROUTES.doctor.test(pathname)) {
    if (!["super_admin", "clinic_owner", "doctor", "receptionist"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
    }
    return NextResponse.next();
  }

  // ========================================================================
  // RECEPTIONIST ROUTES PROTECTION
  // ========================================================================
  if (PROTECTED_ROUTES.receptionist.test(pathname)) {
    if (!["super_admin", "clinic_owner", "receptionist"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
    }
    return NextResponse.next();
  }

  // ========================================================================
  // ACCOUNTANT ROUTES PROTECTION
  // ========================================================================
  if (PROTECTED_ROUTES.accountant.test(pathname)) {
    if (!["super_admin", "clinic_owner", "accountant"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    // Include all routes except:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
