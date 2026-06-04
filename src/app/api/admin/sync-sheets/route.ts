import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { syncAllToSheet } from "@/lib/google-sheets";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const registrations = await prisma.registration.findMany({
      include: { divisions: true },
      orderBy: { createdAt: "asc" },
    });

    await syncAllToSheet(registrations);

    return NextResponse.json({ success: true, count: registrations.length });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Gagal mensinkronisasi data ke spreadsheet" }, { status: 500 });
  }
}
