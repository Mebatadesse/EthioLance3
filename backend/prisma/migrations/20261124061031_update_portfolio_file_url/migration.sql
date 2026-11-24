/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `PortfolioItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PortfolioItem" DROP COLUMN "imageUrl",
ADD COLUMN     "fileUrl" TEXT;
