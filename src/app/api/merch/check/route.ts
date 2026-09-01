import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIP } from "@/lib/rate-limit";

/**
 * Normalisasi nomor WhatsApp agar bisa dicocokkan:
 * +6281234 -> 081234, 6281234 -> 081234, 081234 -> 081234
 */
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+62")) cleaned = "0" + cleaned.slice(3);
  else if (cleaned.startsWith("62")) cleaned = "0" + cleaned.slice(2);
  return cleaned;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimitByIP(ip, "merch-check", 15, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak request. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const { npm, noWhatsapp } = await req.json();

    if (!npm || !noWhatsapp) {
      return NextResponse.json({ error: "NPM dan Nomor WhatsApp wajib diisi" }, { status: 400 });
    }

    const normalizedInput = normalizePhone(noWhatsapp);

    // Cari berdasarkan NPM atau Email
    const registration = await prisma.registration.findFirst({
      where: {
        OR: [
          { npm },
          { email: npm },
        ],
      },
      select: {
        id: true,
        nama: true,
        npm: true,
        prodi: true,
        noWhatsapp: true,
        plan: true,
        paymentStatus: true,
        merchChoice: true,
        merchSelectedAt: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ exists: false });
    }

    // Cocokkan nomor WhatsApp
    const normalizedDb = normalizePhone(registration.noWhatsapp);
    if (normalizedDb !== normalizedInput) {
      return NextResponse.json({
        exists: false,
        message: "NPM ditemukan tetapi nomor WhatsApp tidak cocok.",
      });
    }

    return NextResponse.json({
      exists: true,
      id: registration.id,
      nama: registration.nama,
      npm: registration.npm,
      prodi: registration.prodi,
      plan: registration.plan,
      paymentStatus: registration.paymentStatus,
      merchChoice: registration.merchChoice,
      merchSelectedAt: registration.merchSelectedAt,
    });
  } catch (error) {
    console.error("Error in /api/merch/check:", error);
    return NextResponse.json({ error: "Gagal mengecek data" }, { status: 500 });
  }
}
