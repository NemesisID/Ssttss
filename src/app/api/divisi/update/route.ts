import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIP } from "@/lib/rate-limit";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { normalizePhone } from "@/lib/phone";
import { divisionSchema } from "@/lib/validation";

/** Ganti seluruh divisi peserta. Kredensial diverifikasi ulang di sini, bukan dari registrationId kiriman client. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimitByIP(ip, "divisi-update", 10, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak request. Coba lagi nanti." }, { status: 429 });
  }

  const editOpen = await getSetting(SETTING_KEYS.DIVISION_EDIT_OPEN);
  if (editOpen !== "true") {
    return NextResponse.json({ error: "Edit divisi sedang ditutup." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { npm, noWhatsapp } = body;

    if (!npm || !noWhatsapp) {
      return NextResponse.json({ error: "NPM/Email dan Nomor WhatsApp wajib diisi" }, { status: 400 });
    }

    const parsed = divisionSchema.safeParse({ divisions: body.divisions });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Pilih minimal 1 divisi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.findFirst({
      where: { OR: [{ npm }, { email: npm }] },
      select: { id: true, noWhatsapp: true },
    });

    if (!registration || normalizePhone(registration.noWhatsapp) !== normalizePhone(noWhatsapp)) {
      return NextResponse.json(
        { error: "Data tidak cocok. Periksa kembali NPM/Email dan nomor WhatsApp kamu." },
        { status: 403 }
      );
    }

    const { divisions } = parsed.data;

    await prisma.$transaction([
      prisma.registrationDivision.deleteMany({ where: { registrationId: registration.id } }),
      prisma.registrationDivision.createMany({
        data: divisions.map((division) => ({ registrationId: registration.id, division })),
      }),
    ]);

    return NextResponse.json({ success: true, divisions });
  } catch (error) {
    console.error("Error in /api/divisi/update:", error);
    return NextResponse.json({ error: "Gagal menyimpan divisi" }, { status: 500 });
  }
}
