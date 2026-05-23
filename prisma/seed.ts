import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("Admin user created: admin / admin123");

  // Seed default settings
  const defaults = [
    { key: "paid_plan_price", value: "15000" },
    { key: "active_qris_provider", value: "GOPAY" },
    { key: "gopay_qris_string", value: "" },
    { key: "shopeepay_qris_string", value: "" },
    { key: "registration_open", value: "true" },
  ];

  for (const { key, value } of defaults) {
    await prisma.siteSettings.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("Default settings seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
