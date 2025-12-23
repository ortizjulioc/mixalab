// app/api/users/[id]/route.js
import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";

// 🧠 PUT: Update user info
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, email, role, status } = body;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { name, email, role, status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        deleted: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PUT /users error:", error);
    if (error.code === "P2025")
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

// 🧠 DELETE: Remove user (with transactional delete of profiles)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;


    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
      });

      if (!user || user.deleted === true) {
        throw new Error("User not found");
      }

      // Soft delete artist profile if it exists
      await tx.artistProfile.updateMany({
        where: { userId: id },
        data: { deleted: true },
      });

      // Soft delete creator profile if it exists
      await tx.creatorProfile.updateMany({
        where: { userId: id },
        data: { deleted: true },
      });

      // Soft delete the user
      const deletedUser = await tx.user.update({
        where: { id },
        data: { deleted: true },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          deleted: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return deletedUser;
    });

    return NextResponse.json({
      message: "User and associated profiles deleted successfully",
      user: result,
    });
  } catch (error) {
    console.error("DELETE /users error:", error);
    if (error.message === "User not found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}
