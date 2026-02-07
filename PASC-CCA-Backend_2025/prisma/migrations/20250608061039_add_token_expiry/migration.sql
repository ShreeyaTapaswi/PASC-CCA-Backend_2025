/*
  Warnings:

  - Added the required column `expiresAt` to the `AdminToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `UserToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminToken" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserToken" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
