/*
  Warnings:

  - You are about to drop the column `messageCategoryId` on the `Subcategory` table. All the data in the column will be lost.
  - You are about to drop the `MessageCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subcategory" DROP CONSTRAINT "Subcategory_messageCategoryId_fkey";

-- AlterTable
ALTER TABLE "Subcategory" DROP COLUMN "messageCategoryId";

-- DropTable
DROP TABLE "MessageCategory";
