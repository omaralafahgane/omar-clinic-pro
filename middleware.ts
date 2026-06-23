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
  "/auth-error(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  if (!userId) {
    return (await auth()).redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
