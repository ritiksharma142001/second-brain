import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // A session cookie that does not decode (e.g. the secret changed) is useless: remove it,
  // so the browser stops sending it and the user is simply signed out.
  const hasStaleCookie =
    !req.auth && SESSION_COOKIES.some((name) => req.cookies.has(name));
  const respond = (response: NextResponse) => {
    if (hasStaleCookie)
      SESSION_COOKIES.forEach((name) => response.cookies.delete(name));
    return response;
  };

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return respond(NextResponse.redirect(new URL("/auth/signin", req.url)));
    }
    if (userRole !== "ADMIN") {
      return respond(NextResponse.redirect(new URL("/", req.url)));
    }
  }

  // User dashboard protection
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return respond(NextResponse.redirect(new URL("/auth/signin", req.url)));
    }
  }

  // Redirect logged-in users away from auth pages
  if (
    (pathname.startsWith("/auth/signin") ||
      pathname.startsWith("/auth/signup")) &&
    isLoggedIn
  ) {
    return respond(NextResponse.redirect(new URL("/dashboard", req.url)));
  }

  return respond(NextResponse.next());
});

export const config = {
  matcher: ["/((?!api|uploads|_next/static|_next/image|favicon.ico|public).*)"],
};
