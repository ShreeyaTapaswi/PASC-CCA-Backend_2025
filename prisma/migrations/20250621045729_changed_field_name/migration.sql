/*
  Warnings:

  - You are about to drop the column `name` on the `AttendanceSession` table. All the data in the column will be lost.
  - Added the required column `sessionName` to the `AttendanceSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendanceSession" DROP COLUMN "name",
ADD COLUMN     "sessionName" TEXT NOT NULL;
