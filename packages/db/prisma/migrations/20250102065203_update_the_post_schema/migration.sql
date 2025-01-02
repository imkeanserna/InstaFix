-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('ONE_TIME_PROJECT', 'ONGOING_COLLABORATION', 'CONSULTATION', 'CUSTOM_ARRANGEMENT');

-- CreateEnum
CREATE TYPE "ServiceLocationType" AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('STARTUPS', 'ENTERPRISES', 'INDIVIDUALS', 'NON_PROFITS');

-- CreateEnum
CREATE TYPE "ServicesIncluded" AS ENUM ('FAST_TURNAROUND', 'UNLIMITED_REVISIONS', 'FREE_CONSULTATION', 'PROJECT_MANAGEMENT_SUPPORT', 'AVAILABILITY_24_7', 'NO_UPFRONT_PAYMENT', 'PROFESSIONAL_PORTFOLIO', 'MONEY_BACK_GUARANTEE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "RequestConfirmationType" AS ENUM ('INSTANT_BOOK', 'APPROVE_DECLINE');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('HOURLY', 'FIXED_PRICE', 'CUSTOM', 'PACKAGE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PAYMENT', 'PAYOUT');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "customDetails" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "fixedPrice" DOUBLE PRECISION,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "packageDetails" TEXT,
ADD COLUMN     "pricingType" "PricingType",
ADD COLUMN     "requestConfirmation" "RequestConfirmationType",
ADD COLUMN     "serviceLocation" "ServiceLocationType",
ADD COLUMN     "servicesIncluded" "ServicesIncluded"[],
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "targetAudience" "TargetAudience",
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceEngagement" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "engagementType" "EngagementType" NOT NULL,
    "customDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL,
    "payoutMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEngagement" ADD CONSTRAINT "ServiceEngagement_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
