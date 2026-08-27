import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSetting, setSetting, SETTING_KEYS } from "@/lib/settings";
import { prisma } from "@/lib/db";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MERCH_UPLOAD_DIR = "./uploads/merch";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** GET: ambil konfigurasi merchandise + statistik pemilih */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [imagePath, title, description, optionsStr, open, price] = await Promise.all([
    getSetting(SETTING_KEYS.MERCH_IMAGE_PATH),
    getSetting(SETTING_KEYS.MERCH_TITLE),
    getSetting(SETTING_KEYS.MERCH_DESCRIPTION),
    getSetting(SETTING_KEYS.MERCH_OPTIONS),
    getSetting(SETTING_KEYS.MERCH_OPEN),
    getSetting(SETTING_KEYS.MERCH_PRICE),
  ]);

  let options: string[] = [];
  try {
    options = optionsStr ? JSON.parse(optionsStr) : [];
  } catch {
    options = [];
  }

  // Hitung statistik pemilih per varian
  const stats: Record<string, number> = {};
  if (options.length > 0) {
    const counts = await prisma.registration.groupBy({
      by: ["merchChoice"],
      where: { merchChoice: { not: null } },
      _count: { merchChoice: true },
    });
    for (const c of counts) {
      if (c.merchChoice) {
        stats[c.merchChoice] = c._count.merchChoice;
      }
    }
  }

  return NextResponse.json({
    imagePath: imagePath || null,
    title: title || "ISCOM Welcome Kit",
    description: description || "Pilih varian merchandise eksklusif ISCOM",
    options,
    open: open !== "false",
    price: price || "15000",
    stats,
  }, {
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

/** PUT: simpan pengaturan merchandise (judul, deskripsi, varian, harga, status buka/tutup) */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, options, open, price } = body;

  if (title !== undefined) await setSetting(SETTING_KEYS.MERCH_TITLE, title);
  if (description !== undefined) await setSetting(SETTING_KEYS.MERCH_DESCRIPTION, description);
  if (options !== undefined) await setSetting(SETTING_KEYS.MERCH_OPTIONS, JSON.stringify(options));
  if (open !== undefined) await setSetting(SETTING_KEYS.MERCH_OPEN, String(open));
  if (price !== undefined) await setSetting(SETTING_KEYS.MERCH_PRICE, String(price));

  return NextResponse.json({ success: true });
}

/** POST: upload gambar/poster merchandise */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File harus berformat JPG, PNG, atau WebP" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran file maksimal 10MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await sharp(buffer).metadata();
  } catch {
    return NextResponse.json({ error: "File bukan gambar yang valid" }, { status: 400 });
  }

  // Compress ke webp
  const compressed = await sharp(buffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();

  // Hapus file lama jika ada
  try {
    const files = await fs.readdir(MERCH_UPLOAD_DIR);
    for (const f of files) {
      if (f.startsWith("merch-")) {
        await fs.unlink(path.join(MERCH_UPLOAD_DIR, f));
      }
    }
  } catch {
    // Folder belum ada, skip
  }

  await fs.mkdir(MERCH_UPLOAD_DIR, { recursive: true });
  const filename = `merch-${Date.now()}.webp`;
  const filePath = path.join(MERCH_UPLOAD_DIR, filename);
  await fs.writeFile(filePath, compressed);

  const publicPath = `/uploads/merch/${filename}`;
  await setSetting(SETTING_KEYS.MERCH_IMAGE_PATH, publicPath);

  return NextResponse.json({ imagePath: publicPath });
}

/** DELETE: hapus gambar merchandise */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const files = await fs.readdir(MERCH_UPLOAD_DIR);
    for (const f of files) {
      if (f.startsWith("merch-")) {
        await fs.unlink(path.join(MERCH_UPLOAD_DIR, f));
      }
    }
  } catch {
    // Folder belum ada, skip
  }

  await setSetting(SETTING_KEYS.MERCH_IMAGE_PATH, "");

  return NextResponse.json({ success: true });
}
