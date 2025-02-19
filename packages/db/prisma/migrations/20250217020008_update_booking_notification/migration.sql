/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BookingEventType" AS ENUM ('CREATED', 'UPDATED', 'RESCHEDULE', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_bookingId_fkey";

-- DropTable
DROP TABLE "Notification";

-- CreateTable
CREATE TABLE "BookingNotification" (
    "id" TEXT NOT NULL,
    "type" "BookingEventType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingNotification_bookingId_idx" ON "BookingNotification"("bookingId");

-- CreateIndex
CREATE INDEX "BookingNotification_type_idx" ON "BookingNotification"("type");

-- AddForeignKey
ALTER TABLE "BookingNotification" ADD CONSTRAINT "BookingNotification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
