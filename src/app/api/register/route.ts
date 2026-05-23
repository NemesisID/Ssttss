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

  const { nama, npm, prodi, email, noWhatsapp, divisions, plan, paymentProofUrl } = parsed.data;

  if (plan === "PAID" && !paymentProofUrl) {
    return NextResponse.json({ error: "Bukti pembayaran wajib diupload untuk paket spesial" }, { status: 400 });
  }

  const existing = await prisma.registration.findFirst({
    where: { OR: [{ npm }, { email }] },
  });
  if (existing) {
    const field = existing.npm === npm ? "NPM" : "Email";
    return NextResponse.json({ error: `${field} sudah terdaftar.` }, { status: 409 });
  }

  const isPaid = plan === "PAID";
  const registration = await prisma.registration.create({
    data: {
      nama,
      npm,
      prodi,
      email,
      noWhatsapp,
      plan,
      paymentStatus: "PAID", // FREE dan PAID dua-duanya akan PAID (karena PAID sudah diverifikasi dari upload)
      paymentProofUrl: isPaid ? paymentProofUrl : null,
      paymentUploadedAt: isPaid ? new Date() : null,
      paymentVerifiedAt: isPaid ? new Date() : null,
      paymentProvider: isPaid ? "GOPAY" : null, // Default
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
    paymentStatus: "PAID",
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    registrationId: registration.id,
    plan: registration.plan,
    paymentStatus: registration.paymentStatus,
  });
}
