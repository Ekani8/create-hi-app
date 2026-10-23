import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Demo seed is disabled in production.");
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "db"].includes(url.hostname))
    throw new Error("Demo seed only supports local development databases.");
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com" },
  });
}
main()
  .catch(() => {
    console.error("Seed failed. Check your local database configuration.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
