import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/utils/lib/prisma";
import { UserRole } from "@prisma/client";



export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    // Validar rol
    if (!role || !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Rol inválido o no especificado." },
        { status: 400 }
      );
    }

    // Obtener sesión
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Usuario no autenticado." },
        { status: 401 }
      );
    }

    // Buscar usuario
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    // Actualizar rol
    await db.user.update({
      where: { email: session.user.email },
      data: { role },
    });

    // Definir redirección según el rol
    let redirectUrl;
    switch (role) {
      case UserRole.ARTIST:
        redirectUrl = "/artists/home";
        break;
      case UserRole.CREATOR:
        redirectUrl = "/creators/home";
        break;
      case UserRole.ADMIN:
        redirectUrl = "/admin/home"; // Puedes ajustarlo a tu ruta real
        break;
      default:
        redirectUrl = "/";
        break;
    }

    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    console.error("❌ Error en finalize:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
