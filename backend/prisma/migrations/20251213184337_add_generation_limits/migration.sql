/*
  Warnings:

  - A unique constraint covering the columns `[inviteToken]` on the table `WorkspaceMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_userId_fkey";

-- DropIndex
DROP INDEX "Event_templateId_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "appearance" JSONB,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "features" JSONB,
ADD COLUMN     "maxEvents" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxGenerations" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "maxMembers" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxWorkspaces" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "extraCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "generationCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "appearance" JSONB,
ADD COLUMN     "coverImage" TEXT;

-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "inviteEmail" TEXT,
ADD COLUMN     "inviteToken" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CreditPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "txHash" TEXT,
    "walletAddress" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditPurchase_userId_idx" ON "CreditPurchase"("userId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_txHash_idx" ON "Payment"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_inviteToken_key" ON "WorkspaceMember"("inviteToken");

-- CreateIndex
CREATE INDEX "WorkspaceMember_inviteToken_idx" ON "WorkspaceMember"("inviteToken");

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
