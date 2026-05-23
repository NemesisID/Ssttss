import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads/payment-proofs";
const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || "5") || 5) * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export async function handlePaymentProofUpload(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "File harus berformat JPG, PNG, atau WebP" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: `Ukuran file maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate it's actually an image by reading metadata
  try {
    await sharp(buffer).metadata();
  } catch {
    return { success: false, error: "File bukan gambar yang valid" };
  }

  // Compress and convert to webp
  const compressed = await sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // Generate random filename
  const filename = `${crypto.randomUUID()}.webp`;
  const filePath = path.join(UPLOAD_DIR, filename);

  // Ensure directory exists
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(filePath, compressed);

  return { success: true, filePath: `/uploads/payment-proofs/${filename}` };
}

export async function deletePaymentProof(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), filePath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // File might not exist, ignore
  }
}
