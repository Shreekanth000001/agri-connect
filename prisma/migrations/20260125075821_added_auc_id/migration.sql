/*
  Warnings:

  - Added the required column `aucId` to the `BidId` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BidId" ADD COLUMN     "aucId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "BidId" ADD CONSTRAINT "BidId_aucId_fkey" FOREIGN KEY ("aucId") REFERENCES "ProductAuction"("ProdAucId") ON DELETE RESTRICT ON UPDATE CASCADE;
