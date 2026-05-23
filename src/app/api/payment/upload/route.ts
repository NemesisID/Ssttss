import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handlePaymentProofUpload } from "@/lib/upload";
import { rateLimitByIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimitByIP(ip, "upload", 10, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak upload. Coba lagi nanti." }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const registrationId = formData.get("registrationId") as string | null;

  if (!file || !registrationId) {
    return NextResponse.json({ error: "File dan registrationId wajib diisi" }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registrasi tidak ditemukan" }, { status: 404 });
  }

  if (registration.plan !== "PAID") {
    return NextResponse.json({ error: "Plan gratis tidak perlu upload bukti" }, { status: 400 });
  }

  if (registration.paymentStatus === "PAID") {
    return NextResponse.json({ error: "Pembayaran sudah dikonfirmasi" }, { status: 400 });
  }

  const result = await handlePaymentProofUpload(file);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      paymentProofUrl: result.filePath,
      paymentStatus: "UPLOADED",
      paymentUploadedAt: new Date(),
      rejectionReason: null,
    },
  });

  return NextResponse.json({ success: true, status: "UPLOADED" });
}
