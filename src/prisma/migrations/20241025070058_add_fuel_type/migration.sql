-- src/prisma/migrations/[timestamp]_add_fuel_type_field.sql

-- Create the enum FuelType if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the fuel type column to Vehicle table
ALTER TABLE "Vehicle"
ADD COLUMN "fuelType" "FuelType";

-- Set default value of PETROL for all existing vehicles
UPDATE "Vehicle"
SET "fuelType" = 'PETROL';

-- Now make the column NOT NULL
ALTER TABLE "Vehicle"
ALTER COLUMN "fuelType" SET NOT NULL;

-- Set default for new vehicles
ALTER TABLE "Vehicle"
ALTER COLUMN "fuelType" SET DEFAULT 'PETROL';