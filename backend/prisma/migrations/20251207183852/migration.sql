/*
  Warnings:

  - You are about to drop the column `generationId` on the `Download` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Download` table. All the data in the column will be lost.
  - You are about to drop the `Analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Generation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cardGenerationId` to the `Download` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MintStatus" AS ENUM ('PENDING', 'MINTED', 'FAILED');

-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_userId_fkey";

-- DropForeignKey
ALTER TABLE "Download" DROP CONSTRAINT "Download_generationId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_templateId_fkey";

-- DropForeignKey
ALTER TABLE "Generation" DROP CONSTRAINT "Generation_eventId_fkey";

-- DropIndex
DROP INDEX "Download_eventId_generationId_idx";

-- AlterTable
ALTER TABLE "Download" DROP COLUMN "generationId",
DROP COLUMN "updatedAt",
ADD COLUMN     "cardGenerationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "templateId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "canvasData" JSONB,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Untitled Template',
ADD COLUMN     "sampleData" JSONB,
ALTER COLUMN "properties" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "Analytics";

-- DropTable
DROP TABLE "Generation";

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventStats" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniques" INTEGER NOT NULL DEFAULT 0,
    "generations" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventVisit" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "visitorId" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardGeneration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attendeeId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialShare" (
    "id" TEXT NOT NULL,
    "cardGenerationId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFTMint" (
    "id" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "txHash" TEXT,
    "status" "MintStatus" NOT NULL DEFAULT 'PENDING',
    "network" TEXT NOT NULL DEFAULT 'solana',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFTMint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attendee_eventId_idx" ON "Attendee"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_eventId_email_key" ON "Attendee"("eventId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "EventStats_eventId_key" ON "EventStats"("eventId");

-- CreateIndex
CREATE INDEX "EventVisit_eventId_createdAt_idx" ON "EventVisit"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "CardGeneration_eventId_createdAt_idx" ON "CardGeneration"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "NFTMint_attendeeId_idx" ON "NFTMint"("attendeeId");

-- CreateIndex
CREATE INDEX "Download_eventId_cardGenerationId_idx" ON "Download"("eventId", "cardGenerationId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStats" ADD CONSTRAINT "EventStats_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVisit" ADD CONSTRAINT "EventVisit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardGeneration" ADD CONSTRAINT "CardGeneration_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardGeneration" ADD CONSTRAINT "CardGeneration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialShare" ADD CONSTRAINT "SocialShare_cardGenerationId_fkey" FOREIGN KEY ("cardGenerationId") REFERENCES "CardGeneration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_cardGenerationId_fkey" FOREIGN KEY ("cardGenerationId") REFERENCES "CardGeneration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFTMint" ADD CONSTRAINT "NFTMint_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
