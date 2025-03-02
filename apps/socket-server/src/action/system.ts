import { SYSTEM_EMAIL, SYSTEM_PASSWORD } from '../config/config';
import { prisma } from '../db/index';
import bcrypt from "bcryptjs";

// export const runtime = 'edge'

export async function getOrCreateSystemUser() {
  const systemEmail = SYSTEM_EMAIL;

  const existingUser = await prisma.user.findUnique({
    where: { email: systemEmail }
  });

  if (existingUser) {
    return existingUser;
  }

  // Create a system user if it doesn't exist
  const hashedPassword = bcrypt.hashSync(SYSTEM_PASSWORD, 10);
  return await prisma.user.create({
    data: {
      email: systemEmail,
      name: 'System',
      password: hashedPassword
    }
  });
}
