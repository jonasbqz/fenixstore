"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD || "Fenix1219**";

  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("fenix_admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    });
    
    redirect("/admin");
  }

  return { error: "Contraseña de administrador incorrecta" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("fenix_admin_session");
  redirect("/admin/login");
}
