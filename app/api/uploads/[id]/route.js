import { deleteFile } from "@/utils/upload";
import { NextResponse } from "next/server";

export async function DELETE (_request, { params }) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      throw new BadRequestError("Invalid or missing file ID");
    }

    const fileToDelete = await prisma.file.findUnique({
      where: { id },
    });

    if (!fileToDelete) {
      throw new NotFoundError("File not found");
    }

    const isFileDeleted = await deleteFile(fileToDelete.path);

    if (!isFileDeleted) {
      throw new Error("File not deleted from filesystem");
    }

    await prisma.file.delete({
      where: { id },
    });

    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}