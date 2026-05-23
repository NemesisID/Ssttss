import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

/**
 * Serve static files dari folder uploads/qris/
 * Next.js tidak otomatis serve folder uploads/ dari file system,
 * sehingga perlu route handler ini.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params;
  const filePath = path.join(process.cwd(), "uploads", "qris", ...pathParts);

  // Security: pastikan path tidak keluar dari folder uploads/qris/
  const uploadsDir = path.join(process.cwd(), "uploads", "qris");
  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === ".webp"
      ? "image/webp"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".png"
          ? "image/png"
          : "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
