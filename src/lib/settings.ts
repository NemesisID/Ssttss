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
  return Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));
}

export const SETTING_KEYS = {
  PAID_PLAN_PRICE: "paid_plan_price",
  REGISTRATION_OPEN: "registration_open",
  /** Path ke file gambar QRIS yang diupload admin (disimpan di uploads/qris/) */
  QRIS_IMAGE_PATH: "qris_image_path",
  /** String QRIS statis — digunakan internal untuk generate dynamic QR, tidak ditampilkan di UI admin */
  QRIS_STRING: "qris_string",
} as const;
