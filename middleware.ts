import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
  const { userId } = await auth();

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
    
    // However, we can add a custom header or check if we had the session claims
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
