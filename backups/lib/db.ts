import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

// Always store in globalThis to prevent multiple instances
// in both development and production Next.js environments
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
