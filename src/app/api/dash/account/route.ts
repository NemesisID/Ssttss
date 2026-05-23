import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username, currentPassword, newPassword } = body;

  if (!currentPassword) {
    return NextResponse.json({ error: "Password saat ini wajib diisi" }, { status: 400 });
  }

  // Get current admin
  const admin = await prisma.admin.findUnique({
    where: { username: session.user?.name || "" },
  });

  if (!admin) {
    return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
  }

  // Verify current password
  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Password saat ini salah" }, { status: 403 });
  }

  // Build update data
  const updateData: { username?: string; passwordHash?: string } = {};

  if (username && username !== admin.username) {
    // Check if username already taken
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
    }
    updateData.username = username;
  }

  if (newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
    }
    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: updateData,
  });

  return NextResponse.json({ success: true, message: "Akun berhasil diperbarui" });
}
