import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/server';
import { currentUser } from "./lib";

const { auth } = NextAuth(authConfig);

export const runtime = 'experimental-edge';

export default auth((req) => {
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && req.nextUrl.pathname == profileRoute) {
    return Response.redirect(new URL("/auth/login", req.nextUrl.origin));
  }

  if (isLoggedIn && authRoutes.includes(req.nextUrl.pathname)) {
    return Response.redirect(new URL("/profile", req.nextUrl.origin));
  }

  if (
    isLoggedIn &&
    !req.auth?.user?.name &&
    req.nextUrl.pathname != profileRoute
  ) {
    return Response.redirect(new URL(profileRoute, req.nextUrl.origin));
  }
});

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  let sessionId = request.cookies.get('sessionId')?.value;
  if (!sessionId) {
    const user = await currentUser();

    const newSession = await prisma.chatSession.create({
      data: {
        userId: user?.id || 'guest',
      },
    });

    sessionId = newSession.id;
    response.cookies.set({
      name: 'sessionId',
      value: sessionId as string,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 1 day
    })
  }
  return response
}

const authRoutes = ["/auth/login", "/auth/sign-up"];
const profileRoute = "/profile";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
