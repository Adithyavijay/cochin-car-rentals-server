// src/config/prisma.js

import { PrismaClient } from '@prisma/client'

// Instantiate Prisma client
const prisma = new PrismaClient()

// Function to connect to the database
export const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('Successfully connected to the database')
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    process.exit(1)
  }
}

// Function to disconnect from the database
export const disconnectDB = async () => {
  await prisma.$disconnect()
  console.log('Disconnected from the database')
}

// Export the Prisma client instance
export { prisma } 