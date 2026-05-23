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

  // Cek apakah admin sudah upload gambar QRIS
  const qrisImagePath = await getSetting(SETTING_KEYS.QRIS_IMAGE_PATH);

  if (qrisImagePath) {
    // Admin sudah upload gambar QRIS — langsung kembalikan URL gambar
    // Update payment provider ke GOPAY sebagai default (untuk backward compat)
    await prisma.registration.update({
      where: { id: registrationId },
      data: { paymentProvider: "GOPAY" },
    });

    // Ubah path file menjadi URL API yang bisa diakses
    const imageUrl = qrisImagePath.replace(
      /^\/uploads\/qris\//,
      "/api/uploads/qris/"
    );

    return NextResponse.json({
      qrImage: null,
      qrisImageUrl: imageUrl,
      amount: price,
      provider: "QRIS",
    });
  }

  // Fallback: generate QR dari string QRIS (jika admin belum upload gambar)
  const staticQris = await getSetting(SETTING_KEYS.QRIS_STRING);
  if (!staticQris) {
    return NextResponse.json(
      { error: "QRIS belum dikonfigurasi oleh admin. Silakan hubungi panitia." },
      { status: 500 }
    );
  }

  const dynamicQris = injectAmountToQRIS(staticQris, price);
  const qrImage = await QRCode.toDataURL(dynamicQris, { width: 400, margin: 2 });

  await prisma.registration.update({
    where: { id: registrationId },
    data: { paymentProvider: "GOPAY" },
  });

  return NextResponse.json({
    qrImage,
    qrisImageUrl: null,
    amount: price,
    provider: "QRIS",
  });
}
