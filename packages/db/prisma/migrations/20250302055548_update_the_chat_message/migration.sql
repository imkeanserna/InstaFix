-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "isSystemMessage" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ChatMessage_bookingId_idx" ON "ChatMessage"("bookingId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
