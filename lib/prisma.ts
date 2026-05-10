import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function normalizePgSslMode(databaseUrl: string) {
  return databaseUrl.replace(/([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/i, "$1verify-full");
}

const rawConnectionString = process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/missing";
const connectionString = normalizePgSslMode(rawConnectionString);
const adapter = new PrismaPg({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
