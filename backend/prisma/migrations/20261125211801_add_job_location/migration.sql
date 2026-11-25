-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "isRemote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT;
