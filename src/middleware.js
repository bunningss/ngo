import { NextResponse } from "next/server";
import { getSession } from "./utils/auth";
import { roles } from "./lib/static";

const SIGN_IN_URL = "/sign-in";

export async function middleware(request) {
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
