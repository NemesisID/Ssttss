import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIP } from "@/lib/rate-limit";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { normalizePhone } from "@/lib/phone";

/** Verifikasi peserta (NPM/Email + No. WhatsApp) lalu kirim divisi yang sedang diambil */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimitByIP(ip, "divisi-check", 15, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak request. Coba lagi nanti." }, { status: 429 });
  }

  const editOpen = await getSetting(SETTING_KEYS.DIVISION_EDIT_OPEN);
  if (editOpen !== "true") {
    return NextResponse.json({ error: "Edit divisi sedang ditutup." }, { status: 403 });
  }

  try {
    const { npm, noWhatsapp } = await req.json();

    if (!npm || !noWhatsapp) {
      return NextResponse.json({ error: "NPM/Email dan Nomor WhatsApp wajib diisi" }, { status: 400 });
    }

    const registration = await prisma.registration.findFirst({
      where: { OR: [{ npm }, { email: npm }] },
      select: {
        id: true,
        nama: true,
        noWhatsapp: true,
        plan: true,
        divisions: { select: { division: true } },
      },
    });

    if (!registration) {
      return NextResponse.json({ exists: false });
    }

    if (normalizePhone(registration.noWhatsapp) !== normalizePhone(noWhatsapp)) {
      return NextResponse.json({
        exists: false,
        message: "NPM/Email ditemukan tetapi nomor WhatsApp tidak cocok.",
      });
    }

    return NextResponse.json({
      exists: true,
      id: registration.id,
      nama: registration.nama,
      plan: registration.plan,
      divisions: registration.divisions.map((d) => d.division),
    });
  } catch (error) {
    console.error("Error in /api/divisi/check:", error);
    return NextResponse.json({ error: "Gagal mengecek data" }, { status: 500 });
  }
}
