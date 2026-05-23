import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await prisma.whatsAppGroup.findMany();
  return NextResponse.json(
    groups.map((g: any) => ({ ...g, link: decrypt(g.link) }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { division, link } = await req.json();
  if (!division || !link) {
    return NextResponse.json({ error: "Division dan link wajib diisi" }, { status: 400 });
  }

  const group = await prisma.whatsAppGroup.upsert({
    where: { division },
    update: { link: encrypt(link) },
    create: { division, link: encrypt(link) },
  });

  return NextResponse.json({ ...group, link });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, link, isActive } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (link !== undefined) data.link = encrypt(link);
  if (isActive !== undefined) data.isActive = isActive;

  const group = await prisma.whatsAppGroup.update({ where: { id }, data });
  return NextResponse.json({ ...group, link: link || decrypt(group.link) });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.whatsAppGroup.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
