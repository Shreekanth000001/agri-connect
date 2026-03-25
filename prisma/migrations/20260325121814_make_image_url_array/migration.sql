/*
  Warnings:

  - The `imageUrl` column on the `ProductAuction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'RESOLVED');

-- AlterTable
ALTER TABLE "BidId" ALTER COLUMN "deliveryDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductAuction" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ContactMessage" (
    "msgId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("msgId")
);
