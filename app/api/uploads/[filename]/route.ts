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
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    const possiblePaths = [
      path.join(uploadsDir, safeFileName),
      path.join("/app", "public", "uploads", safeFileName),
      path.join("/var/lib/fenix-uploads", safeFileName),
    ];

    let fileBuffer: Buffer | null = null;
    for (const filePath of possiblePaths) {
      try {
        fileBuffer = await readFile(filePath);
        if (fileBuffer) break;
      } catch {
        // siguiente ruta
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
    }

    const fileExt = path.extname(safeFileName).toLowerCase();
    const contentType =
      fileExt === ".webp"
        ? "image/webp"
        : fileExt === ".jpg" || fileExt === ".jpeg"
        ? "image/jpeg"
        : fileExt === ".png"
        ? "image/png"
        : "application/octet-stream";

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }
}
