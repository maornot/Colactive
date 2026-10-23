import { NextResponse, type NextRequest } from "next/server";
import { MEMBER_COOKIE, PASS_COOKIE, verify } from "@/lib/session";

// Entry flow: password (/gate) → registration (/join) → the site.
// /admin has its own password and skips the gate.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) return NextResponse.next();

  const isMember = Boolean(await verify("member", request.cookies.get(MEMBER_COOKIE)?.value));
  const hasPass = isMember || Boolean(await verify("pass", request.cookies.get(PASS_COOKIE)?.value));

  const redirect = (to: string) => NextResponse.redirect(new URL(to, request.url));

  if (pathname === "/gate") return hasPass ? redirect(isMember ? "/" : "/join") : NextResponse.next();
  if (!hasPass) return redirect("/gate");
  if (pathname === "/join") return isMember ? redirect("/") : NextResponse.next();
  if (!isMember) return redirect("/join");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|avif|gif)$).*)"],
};
