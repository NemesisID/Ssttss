import { NextResponse } from "next/server";
import { getSetting, SETTING_KEYS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export type MerchOption = {
  name: string;
  imagePath: string | null;
};

function parseOptions(raw: string | null): MerchOption[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      if (typeof item === "string") return { name: item, imagePath: null };
      return { name: item.name ?? "", imagePath: item.imagePath ?? null };
    });
  } catch {
    return [];
  }
}

/** GET: ambil konfigurasi merchandise publik (gambar, varian, harga) */
export async function GET() {
  const [imagePath, title, description, optionsStr, open, price] = await Promise.all([
    getSetting(SETTING_KEYS.MERCH_IMAGE_PATH),
    getSetting(SETTING_KEYS.MERCH_TITLE),
    getSetting(SETTING_KEYS.MERCH_DESCRIPTION),
    getSetting(SETTING_KEYS.MERCH_OPTIONS),
    getSetting(SETTING_KEYS.MERCH_OPEN),
    getSetting(SETTING_KEYS.MERCH_PRICE),
  ]);

  const options = parseOptions(optionsStr);

  return NextResponse.json({
    imagePath: imagePath || null,
    title: title || "ISCOM Welcome Kit",
    description: description || "Pilih varian merchandise eksklusif ISCOM",
    options,
    open: open !== "false",
    price: price || "15000",
  }, {
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
