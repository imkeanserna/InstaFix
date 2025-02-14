import { getPrisma } from '@repo/db/schema'; import { PrismaClient } from '@prisma/client/edge'
import { DATABASE_URL } from '../config/config';

export const prisma: PrismaClient = getPrisma({ DATABASE_URL: DATABASE_URL });
