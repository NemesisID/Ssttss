import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const division = url.searchParams.get("division") || "";
  const plan = url.searchParams.get("plan") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { nama: { contains: search } },
      { npm: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (status) where.paymentStatus = status;
  if (plan) where.plan = plan;
  if (division) {
    where.divisions = { some: { division } };
  }

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      include: { divisions: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.registration.count({ where }),
  ]);

  return NextResponse.json({
    data: registrations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
