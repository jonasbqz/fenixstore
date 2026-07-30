import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No se enviaron archivos de imagen." },
        { status: 400 }
      );
    }

    const possibleDirs = [
      path.join(process.cwd(), "public", "uploads"),
      path.join("/app", "public", "uploads"),
      path.join("/var/lib/fenix-uploads"),
    ];

    for (const dir of possibleDirs) {
      try {
        await mkdir(dir, { recursive: true });
      } catch {
        // ya existe o no perm
      }
    }

    const savedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileExt = file.name.endsWith(".webp") ? ".webp" : path.extname(file.name) || ".webp";
      const fileName = `img_${Date.now()}_${i + 1}${fileExt}`;

      for (const dir of possibleDirs) {
        try {
          const filePath = path.join(dir, fileName);
          await writeFile(filePath, buffer);
        } catch {
          // siguiente directorio de respaldo
        }
      }

      savedUrls.push(`/api/uploads/${fileName}`);
    }

    return NextResponse.json({ urls: savedUrls });
  } catch (error) {
    console.error("Error al guardar imágenes en el servidor:", error);
    return NextResponse.json(
      { error: "Error interno al guardar las imágenes en el servidor VPS." },
      { status: 500 }
    );
  }
}
