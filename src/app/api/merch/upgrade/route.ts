import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimitByIP(ip, "merch-upgrade", 5, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak request. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const { registrationId, paymentProofUrl } = await req.json();

    if (!registrationId || !paymentProofUrl) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { plan: true, paymentStatus: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    if (registration.plan === "PAID" && registration.paymentStatus === "DONE") {
      return NextResponse.json({ error: "Peserta sudah membayar paket spesial" }, { status: 400 });
    }

    // Upgrade ke PAID
    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        plan: "PAID",
        paymentStatus: "DONE",
        paymentProofUrl,
        paymentUploadedAt: new Date(),
        paymentVerifiedAt: new Date(),
        paymentProvider: "GOPAY",
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal memproses upgrade" }, { status: 500 });
  }
}
