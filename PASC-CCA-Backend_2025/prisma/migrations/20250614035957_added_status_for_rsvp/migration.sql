/*
  Warnings:

  - Added the required column `status` to the `Rsvp` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('ATTENDING', 'NOT_ATTENDING');

-- AlterTable
ALTER TABLE "Rsvp" ADD COLUMN     "status" "RsvpStatus" NOT NULL;
