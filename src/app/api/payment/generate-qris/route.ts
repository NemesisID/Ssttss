import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { injectAmountToQRIS } from "@/lib/qris";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  const { registrationId } = await req.json();

  if (!registrationId) {
    return NextResponse.json({ error: "registrationId required" }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registrasi tidak ditemukan" }, { status: 404 });
  }

  if (registration.plan !== "PAID") {
    return NextResponse.json({ error: "Plan gratis tidak perlu pembayaran" }, { status: 400 });
  }

  if (registration.paymentStatus === "PAID") {
    return NextResponse.json({ error: "Pembayaran sudah dikonfirmasi" }, { status: 400 });
  }

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

  await prisma.registration.update({
    where: { id: registrationId },
    data: { paymentProvider: "GOPAY" },
  });

  return NextResponse.json({
    qrImage,   // QR code yang sudah berisi nominal → peserta tinggal scan
    amount: price,
    provider: "QRIS",
  });
}
