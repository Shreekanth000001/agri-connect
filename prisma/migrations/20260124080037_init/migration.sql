/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uemail]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uemail` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ugeo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uphone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('VEGETABLES', 'FRUITS', 'GRAINS', 'DAIRY', 'MEAT', 'FISH', 'OTHER');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "uemail" TEXT NOT NULL,
ADD COLUMN     "ugeo" TEXT NOT NULL,
ADD COLUMN     "uid" SERIAL NOT NULL,
ADD COLUMN     "ujoinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "uname" TEXT NOT NULL,
ADD COLUMN     "uphone" INTEGER NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("uid");

-- CreateTable
CREATE TABLE "BidId" (
    "bidId" SERIAL NOT NULL,
    "cid" INTEGER NOT NULL,
    "fid" INTEGER NOT NULL,
    "bidAmount" DOUBLE PRECISION NOT NULL,
    "bidTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "ujoinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BidId_pkey" PRIMARY KEY ("bidId")
);

-- CreateTable
CREATE TABLE "ProductAuction" (
    "ProdAucId" SERIAL NOT NULL,
    "fid" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startingBid" DOUBLE PRECISION NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL,
    "auctionStatus" "AuctionStatus" NOT NULL DEFAULT 'OPEN',
    "category" "Category" NOT NULL DEFAULT 'OTHER',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAuction_pkey" PRIMARY KEY ("ProdAucId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uemail_key" ON "User"("uemail");

-- AddForeignKey
ALTER TABLE "BidId" ADD CONSTRAINT "BidId_cid_fkey" FOREIGN KEY ("cid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidId" ADD CONSTRAINT "BidId_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuction" ADD CONSTRAINT "ProductAuction_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
