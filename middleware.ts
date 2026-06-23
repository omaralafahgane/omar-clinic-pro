import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/contact(.*)",
  "/api/webhooks/(.*)",
  "/api/auth/check-email(.*)",
  "/auth-error(.*)",
  "/waiting-approval(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  
  // Extract email from session claims
  const userEmail = sessionClaims?.email as string;

  // 1. If public route, allow access
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // 2. Protect non-public routes
  if (!userId) {
    return (await auth()).redirectToSignIn();
  }

  // 3. ABSOLUTE BYPASS FOR OWNER (Omar)
  // We check by Email and UserID to ensure he NEVER gets locked out
  const isOwner = 
    userEmail === "omaralblack@gmail.com" || 
    userId === "user_3FOjbOk3hK1NlAfpJc6BYjrYutm";

  if (isOwner) {
    console.log("Owner bypass triggered for:", userEmail);
    return NextResponse.next();
  }

  // 4. Check for approval status in metadata for other users
  const publicMetadata = sessionClaims?.metadata as any;
  const approvalStatus = publicMetadata?.approval_status;

  // If status is not approved, redirect to waiting page
  if (approvalStatus !== "approved" && !request.nextUrl.pathname.startsWith("/waiting-approval")) {
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
