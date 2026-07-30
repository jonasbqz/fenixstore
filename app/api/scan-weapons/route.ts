import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import {
  CODM_MYTHIC_WEAPONS,
  CODM_LEGENDARY_WEAPONS,
  CODM_MYTHIC_OPERATORS,
  CODM_LEGENDARY_OPERATORS,
  CODM_PRESTIGE_WEAPONS,
} from "../../../lib/constants/codmWeapons";

const ALL_KNOWN_WEAPONS = Array.from(
  new Set([
    ...CODM_MYTHIC_WEAPONS,
    ...CODM_LEGENDARY_WEAPONS,
    ...CODM_MYTHIC_OPERATORS,
    ...CODM_LEGENDARY_OPERATORS,
    ...CODM_PRESTIGE_WEAPONS,
    "KRM-262",
    "KRM",
    "BY15",
    "HS0405",
    "R9-0",
    "JAK-12",
    "DL Q33",
    "M13",
    "AK-47",
    "AK117",
    "Fennec",
    "QQ9",
    "Holger 26",
    "Locus",
    "Kilo 141",
    "Switchblade X9",
    "Oden",
    "CBR4",
    "Grau 5.56",
    "Type 19",
  ])
);

export async function POST(request: NextRequest) {
  try {
    const { imageUrls, description } = await request.json();
    const detectedWeapons: string[] = [];

    const searchText = (description || "").toLowerCase();
    
    for (const weapon of ALL_KNOWN_WEAPONS) {
      if (searchText.includes(weapon.toLowerCase())) {
        if (!detectedWeapons.includes(weapon)) {
          detectedWeapons.push(weapon);
        }
      }
    }

    if (Array.isArray(imageUrls)) {
      for (const url of imageUrls) {
        if (typeof url === "string" && (url.startsWith("/api/uploads/") || url.startsWith("/uploads/"))) {
          const fileName = path.basename(url);
          const filePath = path.join(process.cwd(), "public", "uploads", fileName);
          
          try {
            const buffer = await readFile(filePath);
            const rawContent = buffer.toString("utf8", 0, Math.min(buffer.length, 100000)).toLowerCase();

            for (const weapon of ALL_KNOWN_WEAPONS) {
              const cleanW = weapon.toLowerCase();
              if (rawContent.includes(cleanW)) {
                if (!detectedWeapons.includes(weapon)) {
                  detectedWeapons.push(weapon);
                }
              }
            }
          } catch {
            // Buffer read fallback
          }
        }
      }
    }

    return NextResponse.json({ ok: true, weapons: detectedWeapons });
  } catch (error) {
    return NextResponse.json({ ok: false, weapons: [] }, { status: 500 });
  }
}
