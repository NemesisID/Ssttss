import { NextResponse } from "next/server";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { injectAmountToQRIS } from "@/lib/qris";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET() {
  const priceStr = await getSetting(SETTING_KEYS.PAID_PLAN_PRICE);
  const price = parseInt(priceStr || "15000", 10);

  // Ambil string QRIS statis yang telah di-decode dari gambar upload admin
  const staticQris = await getSetting(SETTING_KEYS.QRIS_STRING);
  if (!staticQris) {
    return NextResponse.json(
      { error: "QRIS belum dikonfigurasi. Silakan hubungi panitia." },
      { status: 500 }
    );
  }

  // Inject nominal ke QRIS statis → menjadi QRIS dinamis
  const dynamicQris = injectAmountToQRIS(staticQris, price);

  // Generate gambar QR code dari QRIS dinamis
  const qrImage = await QRCode.toDataURL(dynamicQris, {
    width: 400,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return NextResponse.json(
    {
      qrImage,   // QR code yang sudah berisi nominal → peserta tinggal scan
      amount: price,
      provider: "QRIS",
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}
