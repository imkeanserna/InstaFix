import { prisma } from "@/server/index";
import { IAddUser } from "@repo/types";

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      posts: true
    }
  });

  // If user exists and has posts, check if credit reset is needed
  if (user && user.posts.length > 0) {
    // Check if it's time for a monthly reset
    const now = new Date();
    const lastResetMonth = user.lastCreditReset.getMonth();
    const lastResetYear = user.lastCreditReset.getFullYear();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const creditLimits = {
      FREE: 2,
      PRO: 20,
      PREMIUM: 999999
    };

    // Check if we're in a new month since the last reset
    if (currentYear > lastResetYear || (currentYear === lastResetYear && currentMonth > lastResetMonth)) {
      // Reset credits based on account type
      const newCredits = creditLimits[user.accountType];
      const creditDifference = newCredits - user.credits;

      // Only update if there's an actual change in credits
      if (creditDifference !== 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            credits: newCredits,
            lastCreditReset: now
          }
        });

        await prisma.creditTransaction.create({
          data: {
            userId: user.id,
            amount: creditDifference,
            description: `Monthly credit reset for ${user.accountType} account`
          }
        });

        user.credits = newCredits;
        user.lastCreditReset = now;
      }
    }
  }

  return user ?? null;
};

export async function addUser({
  email,
  name,
  password,
  image,
}: IAddUser) {
  try {
    if (!email) {
      throw new Error("Email is required");
    }

    const isUserExist = await getUserByEmail(email);

    if (isUserExist) {
      throw new Error("Email already registered");
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: password || null,
        image,
      },
    });
    return {
      email: user.email,
      password: user.password,
    };
  } catch (error) {
    console.error("Error in addUser:", error);
    throw error;
  }
};
