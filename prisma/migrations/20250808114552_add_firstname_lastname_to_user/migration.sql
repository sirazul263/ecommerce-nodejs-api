-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT 'Unknown';
