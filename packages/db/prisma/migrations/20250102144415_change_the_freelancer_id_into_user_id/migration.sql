/*
  Warnings:

  - You are about to drop the column `freelancerId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `freelancerId` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `freelancerId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `freelancerId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Payout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_freelancerId_fkey";

-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_freelancerId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_freelancerId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_freelancerId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "freelancerId";

-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "freelancerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "freelancerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "freelancerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
