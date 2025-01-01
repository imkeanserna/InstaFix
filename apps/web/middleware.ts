import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/server';
import { currentUser } from "./lib";
import { cleanupOldMessages, removeChatSession } from "./app/api/_action/ai/messageQueries";
import { ChatSession } from "@prisma/client/edge";

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
  if (request.nextUrl.pathname === '/become-a-freelancer') {
    return NextResponse.redirect(new URL('/become-a-freelancer/overview', request.url))
  }

  const response = NextResponse.next();

  try {
    const user = await currentUser();
    let sessionId = request.cookies.get('sessionId')?.value;

    // Check the user just logged in (has user ID but session 
    // is either missing or associated with guest)
    if (user?.id !== undefined) {
      try {
        const existingSession: ChatSession | null = sessionId ?
          await prisma.chatSession.findUnique({
            where: { id: sessionId }
          }) : null;

        if (!existingSession || existingSession.userId === 'guest') {
          if (existingSession?.userId === 'guest') {
            await removeChatSession({ sessionId: existingSession.id });
          }
          await cleanupOldMessages({ userId: user.id });

          // Create new session for logged-in user
          const newSession = await prisma.chatSession.create({
            data: {
              userId: user.id,
            },
          });
          sessionId = newSession.id;
          response.cookies.set({
            name: 'sessionId',
            value: sessionId,
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 // 1 day
          });
        }
      } catch (error) {
        console.error('[Database Error]', error);
      }
    } else if (!sessionId) {
      // Handle guest users without a session
      try {
        await cleanupOldMessages({ userId: 'guest' });
        const newSession = await prisma.chatSession.create({
          data: {
            userId: 'guest',
          },
        });
        sessionId = newSession.id;
        response.cookies.set({
          name: 'sessionId',
          value: sessionId,
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 24 * 60 * 60 // 1 day
        });
      } catch (error) {
        console.error('[Database Error]', error);
      }
    }
    return response;
  } catch (error) {
    console.error('[Critical Middleware Error]', error);
    return response;
  }
}

const authRoutes = ["/auth/login", "/auth/sign-up"];
const profileRoute = "/profile";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
