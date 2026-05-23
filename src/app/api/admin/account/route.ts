import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, currentPassword, newPassword } = await req.json();

  const admin = await prisma.admin.findFirst({
    where: { username: session.user?.name || "" },
  });

  if (!admin) {
    return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
  }

  if (!currentPassword) {
    return NextResponse.json({ error: "Password saat ini wajib diisi" }, { status: 400 });
  }

  const validPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Password saat ini salah" }, { status: 403 });
  }

  const updateData: { username?: string; passwordHash?: string } = {};

  if (username && username !== admin.username) {
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username sudah dipakai" }, { status: 409 });
    }
    updateData.username = username;
  }

  if (newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
    }
    updateData.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: updateData,
  });

  return NextResponse.json({
    success: true,
    message: "Akun berhasil diupdate. Silakan login ulang.",
  });
}
