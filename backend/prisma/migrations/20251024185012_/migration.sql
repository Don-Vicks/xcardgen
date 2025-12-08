/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `Analytics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Analytics` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Analytics_eventId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."LoginLog_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "Analytics" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "deviceId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_isActive_idx" ON "Session"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Session_token_isActive_idx" ON "Session"("token", "isActive");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Analytics_eventId_createdAt_userId_idx" ON "Analytics"("eventId", "createdAt", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_eventId_key" ON "Analytics"("eventId");

-- CreateIndex
CREATE INDEX "LoginLog_userId_idx" ON "LoginLog"("userId");

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
