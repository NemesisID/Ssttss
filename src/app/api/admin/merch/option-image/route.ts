import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleMerchOptionImageUpload, deleteMerchOptionImage } from "@/lib/upload";

export const dynamic = "force-dynamic";

/**
 * POST: Upload gambar untuk satu opsi/varian merchandise
 * Body: FormData dengan field "image" (File) + "optionName" (string)
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  const optionName = formData.get("optionName") as string | null;

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }
  if (!optionName?.trim()) {
    return NextResponse.json({ error: "Nama opsi diperlukan" }, { status: 400 });
  }

  const result = await handleMerchOptionImageUpload(file, optionName.trim());
  if (!result.success || !result.filePath) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ imagePath: result.filePath });
}

/**
 * DELETE: Hapus gambar untuk satu opsi/varian merchandise
 * Body: { imagePath: string }
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { imagePath } = body;

  if (!imagePath) {
    return NextResponse.json({ error: "imagePath diperlukan" }, { status: 400 });
  }

  await deleteMerchOptionImage(imagePath);
  return NextResponse.json({ success: true });
}
