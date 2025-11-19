import { handleError } from "@/utils/error-handle";
import { BadRequestError } from "@/utils/errors";
import prisma from "@/utils/lib/prisma";
import { uploadFile } from "@/utils/upload";
import { NextResponse } from "next/server";
import * as yup from "yup";

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
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new BadRequestError("No file provided");
    }

    // TODO: Obtener el 'username' del usuario autenticado
    // Por ahora lo dejo fijo
    const fileData = await uploadFile(file, { username: "anderlfrias" });

    if (!fileData) {
      throw new Error("File upload failed");
    }

    const parsedFile = await fileSchema.validate(fileData, { abortEarly: false, stripUnknown: true });

    // TODO: Relacionar con el usuario
    const fileCreated = await prisma.file.create({
      data: parsedFile,
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
