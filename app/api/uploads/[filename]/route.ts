import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const safeFileName = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", safeFileName);

    const fileBuffer = await readFile(filePath);
    
    const fileExt = path.extname(safeFileName).toLowerCase();
    const contentType =
      fileExt === ".webp"
        ? "image/webp"
        : fileExt === ".jpg" || fileExt === ".jpeg"
        ? "image/jpeg"
        : fileExt === ".png"
        ? "image/png"
        : "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }
}
