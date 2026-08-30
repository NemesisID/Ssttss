import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimitByIP(ip, "merch-select", 10, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak request. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const { registrationId, merchChoice } = await req.json();

    if (!registrationId || !merchChoice) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { plan: true, paymentStatus: true, merchChoice: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    // Peserta plan PAID (berbayar saat daftar) langsung boleh pilih merch
    // Peserta FREE hanya boleh setelah paymentStatus DONE (sudah bayar upgrade)
    const canSelect =
      registration.plan === "PAID" ||
      (registration.plan === "FREE" && registration.paymentStatus === "DONE");

    if (!canSelect) {
      return NextResponse.json({ error: "Hanya peserta paket spesial yang sudah membayar yang bisa memilih merchandise" }, { status: 403 });
    }


    // Update pilihan merch
    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        merchChoice,
        merchSelectedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, merchChoice });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan pilihan merchandise" }, { status: 500 });
  }
}
