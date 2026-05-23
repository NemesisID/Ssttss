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

  const provider = await getSetting(SETTING_KEYS.ACTIVE_QRIS_PROVIDER);
  const priceStr = await getSetting(SETTING_KEYS.PAID_PLAN_PRICE);
  const price = parseInt(priceStr || "15000", 10);

  const qrisKey = provider === "SHOPEEPAY"
    ? SETTING_KEYS.SHOPEEPAY_QRIS_STRING
    : SETTING_KEYS.GOPAY_QRIS_STRING;

  const staticQris = await getSetting(qrisKey);
  if (!staticQris) {
    return NextResponse.json({ error: "QRIS belum dikonfigurasi oleh admin" }, { status: 500 });
  }

  const dynamicQris = injectAmountToQRIS(staticQris, price);
  const qrImage = await QRCode.toDataURL(dynamicQris, { width: 400, margin: 2 });

  await prisma.registration.update({
    where: { id: registrationId },
    data: { paymentProvider: provider === "SHOPEEPAY" ? "SHOPEEPAY" : "GOPAY" },
  });

  return NextResponse.json({
    qrImage,
    amount: price,
    provider: provider || "GOPAY",
  });
}
