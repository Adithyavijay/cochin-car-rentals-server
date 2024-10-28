/*
  Warnings:

  - You are about to drop the column `price` on the `Vehicle` table. All the data in the column will be lost.
  - Added the required column `dailyRate` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "price",
ADD COLUMN "dailyRate" DOUBLE PRECISION NOT NULL DEFAULT 50.00;

-- UpdateData
UPDATE "Vehicle" SET "dailyRate" = 
  CASE 
    WHEN "category" = 'ECONOMY' THEN 50.00
    WHEN "category" = 'COMPACT' THEN 60.00
    WHEN "category" = 'MIDSIZE' THEN 70.00
    WHEN "category" = 'FULLSIZE' THEN 80.00
    WHEN "category" = 'LUXURY' THEN 100.00
    WHEN "category" = 'SUV' THEN 90.00
    WHEN "category" = 'VAN' THEN 85.00
    WHEN "category" = 'TRUCK' THEN 95.00
    ELSE 75.00
  END;

-- Remove the default constraint after updating
ALTER TABLE "Vehicle" ALTER COLUMN "dailyRate" DROP DEFAULT;