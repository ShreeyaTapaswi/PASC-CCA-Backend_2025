// import { PrismaClient } from '@prisma/client';

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
//   });

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma;
// }

// export default prisma;




import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Setup the connection pool
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });

// 2. Wrap it in the Prisma Adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // <--- THIS IS THE MAGIC KEY FOR PRISMA 7!
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;