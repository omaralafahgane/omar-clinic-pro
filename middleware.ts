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

  // 1. If public route, allow access
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // 2. Protect non-public routes
  if (!userId) {
    return (await auth()).redirectToSignIn();
  }

  // 3. Hardcoded override for admin users - bypass approval check entirely
  // This ensures the main admin can always access the dashboard regardless of metadata
  if (userId === "user_2tvrCaJBV8I6gabDLa4YCL" || sessionClaims?.email === "omaralblack@gmail.com") {
    return NextResponse.next();
  }

  // 4. Check for approval status in metadata
  const publicMetadata = sessionClaims?.metadata as any;
  const approvalStatus = publicMetadata?.approval_status;
  const userEmail = sessionClaims?.email;

  // Debug logs (visible in Vercel logs)
  console.log("Middleware check:", { userId, approvalStatus, userEmail });

  // BYPASS FOR OWNER: If email is omaralblack@gmail.com, allow everything
  if (userEmail === "omaralblack@gmail.com") {
    return NextResponse.next();
  }

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
