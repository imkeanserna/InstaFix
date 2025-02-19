
// export const runtime = 'edge';

import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { currentUser } from "@/lib";
import { errorResponse } from "@/lib/errorResponse";
import { User } from "next-auth";

export async function POST() {
  try {
    const user: User | undefined = await currentUser();

    if (!user || !user?.id) {
      return errorResponse('User Id is required', undefined, 400);
    }

    const jwtSecret = process.env.JWT_SECRET as string;

    const token: string = jwt.sign({
      userId: user.id,
      email: user.email,
      sessionId: (user as any).sessionId,
      iat: Math.floor(Date.now() / 1000)
    }, jwtSecret, {
      algorithm: 'HS256',
    })

    return NextResponse.json({
      success: true,
      data: token
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
