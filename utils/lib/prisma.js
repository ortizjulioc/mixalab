// lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  // EN LUGAR DE ADAPTER, USAMOS 'datasourceUrl'
  globalForPrisma.prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
}

export const prisma = globalForPrisma.prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}