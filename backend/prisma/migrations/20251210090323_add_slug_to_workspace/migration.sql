/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Made the column `logo` on table `Workspace` required. This step will fail if there are existing NULL values in that column.
  - Made the column `socialLinks` on table `Workspace` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('PERSONAL', 'ORGANIZATION', 'AGENCY', 'EVENT_ORGANIZER', 'CORPORATE_TEAM', 'COMMUNITY_DAO', 'CREATOR_INFLUENCER');

-- DropIndex
DROP INDEX "Workspace_ownerId_idx";

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "type" "WorkspaceType" NOT NULL DEFAULT 'EVENT_ORGANIZER',
ALTER COLUMN "logo" SET NOT NULL,
ALTER COLUMN "socialLinks" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_slug_idx" ON "Workspace"("ownerId", "slug");
