import { FuelType, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { configDotenv } from 'dotenv';
configDotenv();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'adi@gmail.com';
  const adminPassword = 'admin123'; // In a real scenario, use a strong password

  await prisma.Vehicle.updateMany({
    where : {
      fuelType : undefined | null
    } ,
    data : { 
      fuelType : FuelType.petrol
    }
  }) 
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });