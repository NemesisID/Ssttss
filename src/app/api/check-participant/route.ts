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
    const { npm, email } = await req.json();

    if (!npm || !email) {
      return NextResponse.json({ error: "NPM dan Email wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.registration.findFirst({
      where: { OR: [{ npm }, { email }] },
    });

    if (existing) {
      const field = existing.npm === npm ? "NPM" : "Email";
      return NextResponse.json({ exists: true, field });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengecek data" }, { status: 500 });
  }
}
