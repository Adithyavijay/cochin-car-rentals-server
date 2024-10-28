/*
  Warnings:

  - You are about to drop the column `fuelType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "fuelType";

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "fuelType" "FuelType" NOT NULL DEFAULT 'PETROL';
