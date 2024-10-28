/*
  Warnings:

  - You are about to drop the column `fuelType` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fuelType" "FuelType" NOT NULL DEFAULT 'PETROL';

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "fuelType";
