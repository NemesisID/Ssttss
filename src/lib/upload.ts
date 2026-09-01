import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import jsqr from "jsqr";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads/payment-proofs";
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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Compress and convert to webp (failOnError: false tolerates truncated/warning images)
    const compressed = await sharp(buffer, { failOnError: false })
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
  } catch (error) {
    console.error("Payment proof upload error:", error);
    return { success: false, error: "File gambar rusak atau tidak dapat diproses. Pastikan file gambar utuh." };
  }
}

export async function deletePaymentProof(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), filePath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // File might not exist, ignore
  }
}

const QRIS_UPLOAD_DIR = process.env.QRIS_UPLOAD_DIR || "./uploads/qris";

interface QrisUploadResult {
  success: boolean;
  filePath?: string;
  qrisString?: string;
  error?: string;
}

/**
 * Decode string QRIS dari gambar menggunakan jsqr + sharp.
 * Mengembalikan null jika QR code tidak terdeteksi.
 */
async function decodeQrisFromImage(buffer: Buffer): Promise<string | null> {
  try {
    // Konversi ke raw RGBA pixel data menggunakan sharp
    const { data, info } = await sharp(buffer, { failOnError: false })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const code = jsqr(
      new Uint8ClampedArray(data),
      info.width,
      info.height
    );

    return code?.data ?? null;
  } catch {
    return null;
  }
}

export async function handleQrisImageUpload(file: File): Promise<QrisUploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "File harus berformat JPG, PNG, atau WebP" };
  }

  const maxQrisSize = 10 * 1024 * 1024; // 10MB untuk QRIS
  if (file.size > maxQrisSize) {
    return { success: false, error: "Ukuran file maksimal 10MB" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Decode QRIS string dari gambar sebelum dicompress
    const qrisString = await decodeQrisFromImage(buffer);
    if (!qrisString) {
      return { success: false, error: "QR Code tidak terdeteksi di gambar. Pastikan gambar berisi QR Code QRIS yang jelas." };
    }

    // Validasi format QRIS (harus mulai dengan "000201")
    if (!qrisString.startsWith("000201")) {
      return { success: false, error: "Gambar tidak mengandung QR Code QRIS yang valid. Pastikan menggunakan QRIS statis dari bank/e-wallet." };
    }

    // Simpan sebagai qris-[timestamp].webp (replace file lama)
    const compressed = await sharp(buffer, { failOnError: false })
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();

    // Hapus file qris lama jika ada
    try {
      const files = await fs.readdir(QRIS_UPLOAD_DIR);
      for (const f of files) {
        if (f.startsWith("qris")) {
          await fs.unlink(path.join(QRIS_UPLOAD_DIR, f));
        }
      }
    } catch {
      // Folder belum ada, skip
    }

    await fs.mkdir(QRIS_UPLOAD_DIR, { recursive: true });
    const filename = `qris-${Date.now()}.webp`;
    const filePath = path.join(QRIS_UPLOAD_DIR, filename);
    await fs.writeFile(filePath, compressed);

    return { success: true, filePath: `/uploads/qris/${filename}`, qrisString };
  } catch (error) {
    console.error("QRIS upload error:", error);
    return { success: false, error: "File gambar QRIS rusak atau tidak dapat diproses." };
  }
}

export async function deleteQrisImage(): Promise<void> {
  try {
    const files = await fs.readdir(QRIS_UPLOAD_DIR);
    for (const f of files) {
      if (f.startsWith("qris")) {
        await fs.unlink(path.join(QRIS_UPLOAD_DIR, f));
      }
    }
  } catch {
    // Folder might not exist, ignore
  }
}

const MERCH_OPTION_UPLOAD_DIR = "./uploads/merch-options";

interface MerchOptionUploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * Upload gambar untuk satu opsi/varian merchandise.
 * File disimpan sebagai opt-[timestamp]-[slug].webp
 */
export async function handleMerchOptionImageUpload(
  file: File,
  optionName: string
): Promise<MerchOptionUploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "File harus berformat JPG, PNG, atau WebP" };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "Ukuran file maksimal 10MB" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const compressed = await sharp(buffer, { failOnError: false })
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();

    await fs.mkdir(MERCH_OPTION_UPLOAD_DIR, { recursive: true });

    // Slug dari nama opsi untuk nama file yang lebih readable
    const slug = optionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 30);
    const filename = `opt-${Date.now()}-${slug}.webp`;
    const filePath = path.join(MERCH_OPTION_UPLOAD_DIR, filename);
    await fs.writeFile(filePath, compressed);

    return { success: true, filePath: `/uploads/merch-options/${filename}` };
  } catch (error) {
    console.error("Merch option image upload error:", error);
    return { success: false, error: "File gambar varian rusak atau tidak dapat diproses." };
  }
}

/**
 * Hapus file gambar opsi varian berdasarkan path yang tersimpan di database.
 */
export async function deleteMerchOptionImage(imagePath: string): Promise<void> {
  try {
    // imagePath contoh: /uploads/merch-options/opt-xxx.webp
    const filename = path.basename(imagePath);
    const fullPath = path.join(process.cwd(), MERCH_OPTION_UPLOAD_DIR, filename);
    await fs.unlink(fullPath);
  } catch {
    // File might not exist, ignore
  }
}
