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
  const status = url.searchParams.get("status") || "";
  const plan = url.searchParams.get("plan") || "";

  const where: Record<string, unknown> = {};
  if (status) where.paymentStatus = status;
  if (plan) where.plan = plan;

  const registrations = await prisma.registration.findMany({
    where,
    include: { divisions: true },
    orderBy: { createdAt: "desc" },
  });

  const header = "Timestamp,Nama,NPM,Prodi,Email,No WhatsApp,Divisi,Plan,Status Pembayaran\n";
  const rows = registrations.map((r: any) =>
    [
      new Date(r.createdAt).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).replace(/\./g, ":"),
      `"${r.nama}"`,
      r.npm,
      r.prodi,
      r.email,
      r.noWhatsapp,
      `"${r.divisions.map((d: any) => d.division).join(", ")}"`,
      r.plan,
      r.paymentStatus,
    ].join(",")
  );

  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="pendaftaran-iscom-${Date.now()}.csv"`,
    },
  });
}
