import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registrationSchema } from "@/lib/validation";
import { rateLimitByIP } from "@/lib/rate-limit";
import { appendToSheet } from "@/lib/google-sheets";
import { getSetting, SETTING_KEYS } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimitByIP(ip, "register", 5, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  const regOpen = await getSetting(SETTING_KEYS.REGISTRATION_OPEN);
  if (regOpen === "false") {
    return NextResponse.json({ error: "Pendaftaran sedang ditutup." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten() }, { status: 400 });
  }

  const { nama, npm, prodi, email, noWhatsapp, divisions, plan } = parsed.data;

  const existing = await prisma.registration.findFirst({
    where: { OR: [{ npm }, { email }] },
  });
  if (existing) {
    const field = existing.npm === npm ? "NPM" : "Email";
    return NextResponse.json({ error: `${field} sudah terdaftar.` }, { status: 409 });
  }

  const registration = await prisma.registration.create({
    data: {
      nama,
      npm,
      prodi,
      email,
      noWhatsapp,
      plan,
      paymentStatus: plan === "FREE" ? "PAID" : "PENDING",
      divisions: {
        create: divisions.map((d) => ({ division: d })),
      },
    },
    include: { divisions: true },
  });

  // Sync to Google Sheets
  appendToSheet({
    nama,
    npm,
    prodi,
    email,
    noWhatsapp,
    divisions,
    plan,
    paymentStatus: plan === "FREE" ? "PAID" : "PENDING",
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    registrationId: registration.id,
    plan: registration.plan,
    paymentStatus: registration.paymentStatus,
  });
}
