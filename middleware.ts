import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/pricing(.*)",
  "/contact(.*)",
  "/api/webhooks/(.*)",
  "/api/auth/check-email(.*)",
  "/auth-error(.*)"
]);

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

  // We use a light touch here and let the layout/page level handle clinic and subscription checks
  // This avoids circular redirects and allows API calls to function correctly
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
