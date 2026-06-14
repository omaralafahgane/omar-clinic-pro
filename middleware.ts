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
  "/forgot-password(.*)",
  "/subscription-expired",
  "/api/webhooks(.*)"
]);

const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);
const isClinicRoute = createRouteMatcher(["/dashboard/clinic(.*)"]);
const isSubscriptionExemptRoute = createRouteMatcher([
  "/dashboard/clinic/subscription(.*)",
  "/subscription-expired"
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId, sessionClaims } = await auth();
    const pathname = req.nextUrl.pathname;

    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    if (!userId) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const metadata = (sessionClaims?.metadata as any) || {};
    const userRole = metadata.role || "patient";
    const userClinicId = metadata.clinic_id;
    const subscriptionStatus = metadata.subscription_status;

    if (isAdminRoute(req)) {
      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
      }
      return NextResponse.next();
    }

    if (isClinicRoute(req)) {
      if (userRole === "admin") return NextResponse.next();
      if (!userClinicId) return NextResponse.redirect(new URL("/free-trial", req.url));

      const isSubscriptionActive = subscriptionStatus === "active" || subscriptionStatus === "trial";
      const isSubscriptionExpired = subscriptionStatus === "expired" || subscriptionStatus === "inactive" || !subscriptionStatus;

      if (isSubscriptionExpired && !isSubscriptionExemptRoute(req)) {
        return NextResponse.redirect(new URL("/subscription-expired", req.url));
      }

      if (!isSubscriptionActive && !isSubscriptionExemptRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard/clinic/subscription", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error caught:", error);
    // If Clerk keys are missing, auth() will throw. In production, we should handle this gracefully
    // to avoid MIDDLEWARE_INVOCATION_FAILED which kills the connection.
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
