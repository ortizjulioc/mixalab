import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/utils/lib/prisma";
import { UserRole } from "@prisma/client";



export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role");

    console.log("🔍 Finalize endpoint called with role:", roleParam);

    // Normalizar y validar rol
    if (!roleParam) {
      return NextResponse.json(
        { error: "Rol no especificado." },
        { status: 400 }
      );
    }

    const normalizedRole = roleParam.toUpperCase();

    // Validar que sea ARTIST o CREATOR (no ADMIN)
    if (normalizedRole !== "ARTIST" && normalizedRole !== "CREATOR") {
      return NextResponse.json(
        { error: "Rol inválido. Solo se permite ARTIST o CREATOR." },
        { status: 400 }
      );
    }

    const role = UserRole[normalizedRole];

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

    console.log("🔄 Finalize: Updating role", {
      email: user.email,
      currentRole: user.role,
      newRole: role
    });

    // Actualizar rol en la base de datos
    await db.user.update({
      where: { email: session.user.email },
      data: { role },
    });

    // Redirigir a página intermedia que fuerza la actualización de la sesión
    const redirectUrl = `/role-switch?role=${normalizedRole}`;

    console.log("✅ Finalize: Role updated successfully, redirecting to", redirectUrl);

    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    console.error("❌ Error en finalize:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
