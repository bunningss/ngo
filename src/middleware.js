import { NextResponse } from "next/server";
import { getSession } from "./utils/auth";
import { roles } from "./lib/static";

const SIGN_IN_URL = "/sign-in";

export async function middleware(request) {
  // Site status validation
  const siteStatus = await fetch(
    `${process.env.SITE_VERIFICATION_URL}site/verify-site-status/${process.env.SITE_ID}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  const data = await siteStatus.json();

  if (!data.payload) {
    throw new Error("Site is not active");
  }

  const { error, role } = await getSession();
  const rolesPermissions = roles[role];
  const { pathname } = request.nextUrl;

  // Redirect authenticated users from auth pages
  if (!error) {
    if (
      pathname === SIGN_IN_URL ||
      pathname === "/sign-up" ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect non-admin users from dashboard
  if (
    !rolesPermissions?.can?.includes("visit:dashboard") &&
    pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
  ],
};
