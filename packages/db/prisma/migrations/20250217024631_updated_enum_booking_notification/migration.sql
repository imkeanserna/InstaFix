/*
  Warnings:

  - The values [RESCHEDULE] on the enum `BookingEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingEventType_new" AS ENUM ('CREATED', 'UPDATED', 'RESCHEDULED', 'CANCELLED', 'CONFIRMED');
ALTER TABLE "BookingNotification" ALTER COLUMN "type" TYPE "BookingEventType_new" USING ("type"::text::"BookingEventType_new");
ALTER TYPE "BookingEventType" RENAME TO "BookingEventType_old";
ALTER TYPE "BookingEventType_new" RENAME TO "BookingEventType";
DROP TYPE "BookingEventType_old";
COMMIT;
