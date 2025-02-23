import { getPrisma } from '@repo/db/schema';
import { PrismaClient } from '@prisma/client/edge'

export type PrismaClientOrTx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'> | PrismaClient;
export const prisma: PrismaClient = getPrisma({ DATABASE_URL: process.env.DATABASE_URL! });
