import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registrationSchema, registrationSchemaPublic } from "@/lib/validation";
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
  const isUmum = body.registrationType === "UMUM";

  // Validate with appropriate schema
  const schema = isUmum ? registrationSchemaPublic : registrationSchema;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten() }, { status: 400 });
  }

  const { nama, email, noWhatsapp, divisions, plan, paymentProofUrl } = parsed.data;
  const npm = isUmum ? null : (parsed.data as unknown as { npm: string }).npm;
  const prodi = isUmum ? null : (parsed.data as unknown as { prodi: string }).prodi;

  // Umum harus PAID_REG, mahasiswa bisa FREE/PAID
  if (isUmum && plan !== "PAID_REG") {
    return NextResponse.json({ error: "Pendaftar umum wajib membayar biaya pendaftaran" }, { status: 400 });
  }

  const needsPayment = plan === "PAID" || plan === "PAID_REG";
  if (needsPayment && !paymentProofUrl) {
    return NextResponse.json({ error: "Bukti pembayaran wajib diupload" }, { status: 400 });
  }

  // Duplicate check
  if (isUmum) {
    // Umum: cek email + noWhatsapp
    const existing = await prisma.registration.findFirst({
      where: { OR: [{ email }, { noWhatsapp }] },
    });
    if (existing) {
      const field = existing.email === email ? "Email" : "Nomor WhatsApp";
      return NextResponse.json({ error: `${field} sudah terdaftar.` }, { status: 409 });
    }
  } else {
    // Mahasiswa: cek npm + email
    const existing = await prisma.registration.findFirst({
      where: { OR: [{ npm: npm as string }, { email }] },
    });
    if (existing) {
      return NextResponse.json({ error: "NPM sudah terdaftar." }, { status: 409 });
    }
  }

  const registration = await prisma.registration.create({
    data: {
      registrationType: isUmum ? "UMUM" : "MAHASISWA",
      nama,
      npm,
      prodi,
      email,
      noWhatsapp,
      plan,
      paymentStatus: "DONE",
      paymentProofUrl: needsPayment ? paymentProofUrl : null,
      paymentUploadedAt: needsPayment ? new Date() : null,
      paymentVerifiedAt: needsPayment ? new Date() : null,
      paymentProvider: needsPayment ? "GOPAY" : null,
      divisions: {
        create: divisions.map((d) => ({ division: d })),
      },
    },
    include: { divisions: true },
  });

  // Sync to Google Sheets
  appendToSheet({
    registrationType: isUmum ? "UMUM" : "MAHASISWA",
    nama,
    npm: npm || "-",
    prodi: prodi || "-",
    email,
    noWhatsapp,
    divisions,
    plan,
    paymentProofUrl: needsPayment ? paymentProofUrl : null,
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    registrationId: registration.id,
    plan: registration.plan,
    paymentStatus: registration.paymentStatus,
  });
}

