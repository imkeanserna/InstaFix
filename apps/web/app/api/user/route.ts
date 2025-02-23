import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from "@/server/index";
import { errorResponse } from '@/lib/errorResponse';
import { User } from "next-auth";
import { currentUser } from '@/lib';
import { z } from 'zod';

// export const runtime = 'edge'

export const LocationSchema = z.object({
  fullAddress: z.string().min(1, "Full address is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional(),
  location: LocationSchema.optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user: User | undefined = await currentUser();
    if (!user || !user?.id) return errorResponse('User Id is required', undefined, 400);

    const body: any = await request.json();
    const validatedData = UpdateUserSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.image && { image: validatedData.image }),
        ...(validatedData.location && {
          location: {
            create: {
              fullAddress: validatedData.location.fullAddress,
              normalizedAddress: validatedData.location.fullAddress,
              latitude: validatedData.location.latitude,
              longitude: validatedData.location.longitude,
            }
          }
        }),
        updatedAt: new Date(),
      },
      include: {
        location: true,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
