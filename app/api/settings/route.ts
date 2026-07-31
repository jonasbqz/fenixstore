import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbConnected } from "../../../lib/db";
import { storeSettings } from "../../../lib/db/schema";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const newGroupUrl = searchParams.get("groupUrl");
  const newPhone = searchParams.get("phone");

  if (!isDbConnected()) {
    return NextResponse.json({ ok: false, error: "Base de datos no conectada" }, { status: 400 });
  }

  try {
    const db = getDb();

    if (newGroupUrl) {
      await db
        .insert(storeSettings)
        .values({ key: "whatsappGroupUrl", value: newGroupUrl.trim() })
        .onConflictDoUpdate({
          target: storeSettings.key,
          set: { value: newGroupUrl.trim(), updatedAt: new Date() },
        });
    }

    if (newPhone) {
      await db
        .insert(storeSettings)
        .values({ key: "whatsappNumber", value: newPhone.trim() })
        .onConflictDoUpdate({
          target: storeSettings.key,
          set: { value: newPhone.trim(), updatedAt: new Date() },
        });
    }

    const rows = await db.select().from(storeSettings);
    const map = new Map(rows.map((r) => [r.key, r.value]));

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");

    return NextResponse.json({
      ok: true,
      updated: !!(newGroupUrl || newPhone),
      settings: {
        whatsappGroupUrl: map.get("whatsappGroupUrl") || "https://chat.whatsapp.com/FXVkcnxJsnsKkbcV7GVmPW",
        whatsappNumber: map.get("whatsappNumber") || "351920331564",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
