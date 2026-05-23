import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [total, free, paid, pending, uploaded, verified, rejected, divisions] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { plan: "FREE" } }),
    prisma.registration.count({ where: { plan: "PAID" } }),
    prisma.registration.count({ where: { paymentStatus: "PENDING" } }),
    prisma.registration.count({ where: { paymentStatus: "UPLOADED" } }),
    prisma.registration.count({ where: { paymentStatus: "PAID" } }),
    prisma.registration.count({ where: { paymentStatus: "REJECTED" } }),
    prisma.registrationDivision.groupBy({
      by: ["division"],
      _count: { division: true },
    }),
  ]);

  const divisionStats = Object.fromEntries(
    divisions.map((d: any) => [d.division, d._count.division])
  );

  return NextResponse.json({
    total,
    free,
    paid,
    pending,
    uploaded,
    verified,
    rejected,
    divisions: divisionStats,
  });
}
