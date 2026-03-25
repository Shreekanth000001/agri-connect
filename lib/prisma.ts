import 'server-only';
import { PrismaClient } from '@/generated/prisma'; // Importing the "Factory"

// We attach the instance to the global object so it survives reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;