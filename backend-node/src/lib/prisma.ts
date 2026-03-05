import { PrismaClient } from '@prisma/client'

// Prisma 7: a URL vem de DATABASE_URL (definida em .env ou prisma.config.ts)
const prisma = new PrismaClient()

export default prisma
