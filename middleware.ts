import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that require authentication
// Best practice: Opt-in model - explicitly protect routes that need auth
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/user(.*)",
  "/api/subscription(.*)",
]);

// Define routes that should be publicly accessible (even if signed in)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
  "/api/version",
  "/api/webhooks(.*)", // Webhooks must be public (authenticated via signing secrets)
]);

export default clerkMiddleware(async (auth, req) => {
  // If route is explicitly public, allow access
  if (isPublicRoute(req)) {
    return;
  }

  // If route is protected, require authentication
  if (isProtectedRoute(req)) {
    await auth().protect();
  }

  // All other routes are public by default
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
