/*
  Warnings:

  - You are about to drop the column `trackNumber` on the `Delivery` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trackingNumber]` on the table `Delivery` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deliveryDate` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackingNumber` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Delivery_orderId_key";

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "trackNumber",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deliveryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "trackingNumber" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "deliveryStatus" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_trackingNumber_key" ON "Delivery"("trackingNumber");

-- CreateIndex
CREATE INDEX "Delivery_trackingNumber_idx" ON "Delivery"("trackingNumber");
