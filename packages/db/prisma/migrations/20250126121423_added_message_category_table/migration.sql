-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN     "messageCategoryId" TEXT;

-- CreateTable
CREATE TABLE "MessageCategory" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_messageCategoryId_fkey" FOREIGN KEY ("messageCategoryId") REFERENCES "MessageCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
