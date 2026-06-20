import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/pricing(.*)",
  "/contact(.*)",
  "/api/webhooks/(.*)",
  "/api/auth/check-email(.*)",
  "/auth-error(.*)",
  "/waiting-approval(.*)"
]);

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

  // 3. Check for approval status in metadata
  // We prefer checking metadata first for performance, then database if needed
  const publicMetadata = sessionClaims?.metadata as any;
  const approvalStatus = publicMetadata?.approval_status;

  // If status is not approved, redirect to waiting page
  if (approvalStatus !== "approved" && !request.nextUrl.pathname.startsWith("/waiting-approval")) {
    // Exception for admin users if they are not marked as approved in metadata yet
    // But usually the super admin is pre-approved
    const url = request.nextUrl.clone();
    url.pathname = "/waiting-approval";
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
