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

  if (!file) {
    return NextResponse.json({ error: "File wajib diisi" }, { status: 400 });
  }

  const result = await handlePaymentProofUpload(file);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, filePath: result.filePath });
}
