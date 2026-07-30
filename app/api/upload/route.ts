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

    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    // Asegurar que el directorio public/uploads exista en el servidor
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // ya existe
    }

    const savedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generar nombre único basado en marca de tiempo y extensión original/webp
      const fileExt = file.name.endsWith(".webp") ? ".webp" : path.extname(file.name) || ".webp";
      const fileName = `img_${Date.now()}_${i + 1}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);

      await writeFile(filePath, buffer);
      // Devolver la URL del handler dinamico que sirve imagenes en produccion
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
