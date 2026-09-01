import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  // Gunakan rate limit yang sedikit lebih longgar untuk check, misalnya 15 request per jam
  const { allowed } = await rateLimitByIP(ip, "check-participant", 15, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak request. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const { npm, email, noWhatsapp, registrationType } = await req.json();
    const isUmum = registrationType === "UMUM";

    if (isUmum) {
      if (!email || !noWhatsapp) {
        return NextResponse.json({ error: "Email dan No. WhatsApp wajib diisi" }, { status: 400 });
      }
      const existing = await prisma.registration.findFirst({
        where: { OR: [{ email }, { noWhatsapp }] },
        select: { id: true, email: true, noWhatsapp: true },
      });
      if (existing) {
        const field = existing.email === email ? "Email" : "Nomor WhatsApp";
        return NextResponse.json({ exists: true, field, registrationId: existing.id });
      }
    } else {
      if (!npm || !email) {
        return NextResponse.json({ error: "NPM dan Email wajib diisi" }, { status: 400 });
      }
      const existing = await prisma.registration.findFirst({
        where: { OR: [{ npm }, { email }] },
        select: { id: true, npm: true, email: true },
      });
      if (existing) {
        return NextResponse.json({ exists: true, field: "NPM", registrationId: existing.id });
      }
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengecek data" }, { status: 500 });
  }
}

