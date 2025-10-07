import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/utils/lib/prisma";
import { UserRole } from "@prisma/client";



export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    // Validar el rol recibido
    if (!role || !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Rol inválido o no especificado." },
        { status: 400 }
      );
    }

    // Obtener sesión activa
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

    // Actualizar el rol del usuario
    await db.user.update({
      where: { email: session.user.email },
      data: { role },
    });

    // Redirigir al dashboard correspondiente
    return NextResponse.redirect(new URL(`/dashboard?role=${role}`, req.url));
  } catch (error) {
    console.error("❌ Error en finalize:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
