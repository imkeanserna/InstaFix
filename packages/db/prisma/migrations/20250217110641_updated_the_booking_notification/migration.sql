/*
  Warnings:

  - Added the required column `userId` to the `BookingNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookingNotification" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BookingNotification" ADD CONSTRAINT "BookingNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
