/*
  Warnings:

  - Made the column `previousPrice` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "previousPrice" SET NOT NULL,
ALTER COLUMN "previousPrice" SET DEFAULT 0;
