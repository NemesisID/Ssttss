import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { divisions: true },
  });

  if (!registration) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  const response: Record<string, unknown> = {
    paymentStatus: registration.paymentStatus,
    rejectionReason: registration.rejectionReason,
  };

  // If paid or free, include WA group links
  if (registration.paymentStatus === "PAID") {
    const divisionNames = registration.divisions.map((d) => d.division);
    const groups = await prisma.whatsAppGroup.findMany({
      where: { division: { in: divisionNames }, isActive: true },
    });

    response.waGroups = groups.map((g) => ({
      division: g.division,
      link: decrypt(g.link),
    }));
  }

  return NextResponse.json(response);
}
