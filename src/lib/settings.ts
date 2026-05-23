import { prisma } from "./db";

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.siteSettings.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.siteSettings.findMany();
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

export const SETTING_KEYS = {
  PAID_PLAN_PRICE: "paid_plan_price",
  ACTIVE_QRIS_PROVIDER: "active_qris_provider",
  GOPAY_QRIS_STRING: "gopay_qris_string",
  SHOPEEPAY_QRIS_STRING: "shopeepay_qris_string",
  REGISTRATION_OPEN: "registration_open",
} as const;
