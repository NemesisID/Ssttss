import { NextRequest, NextResponse } from "next/server";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { injectAmountToQRIS } from "@/lib/qris";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isUmum = req.nextUrl.searchParams.get("type") === "umum";

  const plan = req.nextUrl.searchParams.get("plan");

  let price = 0;
  if (isUmum) {
    const publicPriceStr = await getSetting(SETTING_KEYS.PUBLIC_REG_PRICE);
    price += parseInt(publicPriceStr || "25000", 10);
    // Jika UMUM memilih bundle (PAID), tambahkan harga plan paid
    if (plan === "PAID") {
      const merchPriceStr = await getSetting(SETTING_KEYS.PAID_PLAN_PRICE);
      price += parseInt(merchPriceStr || "15000", 10);
    }
  } else {
    const merchPriceStr = await getSetting(SETTING_KEYS.PAID_PLAN_PRICE);
    price = parseInt(merchPriceStr || "15000", 10);
  }

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

