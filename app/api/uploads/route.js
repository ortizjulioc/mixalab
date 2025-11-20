import { handleError } from "@/utils/error-handle";
import { BadRequestError, ForbiddenError } from "@/utils/errors";
import prisma from "@/utils/lib/prisma";
import { uploadFile } from "@/utils/upload";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as yup from "yup";
import { authOptions } from "../auth/[...nextauth]/route";

const fileSchema = yup.object().shape({
  name: yup
    .string()
    .required("El nombre del archivo es obligatorio"),

  mimeType: yup
    .string()
    .matches(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, "Debe ser un MIME válido")
    .required("El tipo MIME es obligatorio"),

  extension: yup
    .string()
    .matches(/^[a-z0-9]+$/i, "Extensión inválida")
    .required("La extensión es obligatoria"),

  size: yup
    .number()
    .integer("El tamaño debe ser un número entero")
    .positive("El tamaño debe ser mayor a 0")
    .required("El tamaño es obligatorio"),

  path: yup
    .string()
    .required("La ruta es obligatoria"),

  url: yup
    .string()
    .required("La URL es obligatoria"),

  folder: yup
    .string()
    .required("La carpeta es obligatoria"),
});

export async function POST(request) {
  try {

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new ForbiddenError("Forbidden. You must be logged in to upload files.");
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new BadRequestError("No file provided");
    }

    const fileData = await uploadFile(file, { username: session.user.id || undefined });

    if (!fileData) {
      throw new Error("File upload failed");
    }

    const parsedFile = await fileSchema.validate(fileData, { abortEarly: false, stripUnknown: true });

    const fileCreated = await prisma.file.create({
      data: { ...parsedFile, userId: session.user.id },
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      file: fileCreated,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const [files, totalFiles] = await Promise.all([
      prisma.file.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.file.count(),
    ]);

    return NextResponse.json({
      files,
      pagination: {
        total: totalFiles,
        page,
        pageSize,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
