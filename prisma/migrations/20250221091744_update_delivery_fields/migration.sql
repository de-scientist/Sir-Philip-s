/*
  Warnings:

  - The `deliveryStatus` column on the `Delivery` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('pending', 'processing', 'delivered', 'failed');

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "image" SET DEFAULT 'https://img.freepik.com/premium-photo/milk-fruits-yogurt-from-natural-milk-strawberries_118454-2953.jpg?ga=GA1.1.786348031.1736697841&semt=ais_hybrid';

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "deliveryStatus",
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "Delivery_deliveryStatus_idx" ON "Delivery"("deliveryStatus");
