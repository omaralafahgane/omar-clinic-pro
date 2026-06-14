import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/features",
  "/pricing",
  "/contact",
  "/free-trial",
  "/login(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  // Temporary: Allow all requests to diagnose connection reset
  // Once the site is reachable, we will restore protection
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
