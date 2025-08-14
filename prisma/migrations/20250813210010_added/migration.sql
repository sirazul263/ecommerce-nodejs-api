-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "passwordResetExpiry" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ALTER COLUMN "emailVerified" SET DEFAULT false;
