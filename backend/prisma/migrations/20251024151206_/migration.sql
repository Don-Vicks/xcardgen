/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `properties` on the `Template` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "public"."LoginLog_userId_idx";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "properties",
ADD COLUMN     "properties" JSONB NOT NULL;

-- CreateIndex
CREATE INDEX "LoginLog_userId_createdAt_idx" ON "LoginLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");
