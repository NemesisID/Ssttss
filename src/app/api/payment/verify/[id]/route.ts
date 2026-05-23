import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateSheetPaymentStatus } from "@/lib/google-sheets";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action, reason } = await req.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Action harus approve atau reject" }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  if (registration.paymentStatus !== "UPLOADED") {
    return NextResponse.json({ error: "Hanya bisa verify status UPLOADED" }, { status: 400 });
  }

  if (action === "approve") {
    await prisma.registration.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        paymentVerifiedAt: new Date(),
        rejectionReason: null,
      },
    });
    updateSheetPaymentStatus(registration.npm, "PAID").catch(() => {});
  } else {
    if (!reason) {
      return NextResponse.json({ error: "Alasan reject wajib diisi" }, { status: 400 });
    }
    await prisma.registration.update({
      where: { id },
      data: {
        paymentStatus: "REJECTED",
        rejectionReason: reason,
      },
    });
    updateSheetPaymentStatus(registration.npm, "REJECTED").catch(() => {});
  }

  return NextResponse.json({ success: true, action });
}
