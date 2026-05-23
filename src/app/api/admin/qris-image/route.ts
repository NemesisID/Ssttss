import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSetting, setSetting, SETTING_KEYS } from "@/lib/settings";
import { handleQrisImageUpload, deleteQrisImage } from "@/lib/upload";

/** GET: ambil info gambar QRIS yang aktif */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const imagePath = await getSetting(SETTING_KEYS.QRIS_IMAGE_PATH);
  return NextResponse.json({ imagePath: imagePath || null });
}

/** POST: upload gambar QRIS baru */
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

  const result = await handleQrisImageUpload(file);
  if (!result.success || !result.filePath) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await setSetting(SETTING_KEYS.QRIS_IMAGE_PATH, result.filePath);

  return NextResponse.json({ imagePath: result.filePath });
}

/** DELETE: hapus gambar QRIS */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteQrisImage();
  await setSetting(SETTING_KEYS.QRIS_IMAGE_PATH, "");

  return NextResponse.json({ success: true });
}
