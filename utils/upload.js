import { mkdir, writeFile, unlink } from 'fs/promises';

import { existsSync } from 'fs';

import { join, posix as pathPosix } from 'path';

import { BadRequestError } from './errors';

import { normalizeFileName } from './string';


/**
 * Construye la ruta de carpeta donde se guardará el archivo
 * Ej: "2025/10/01/johndoe/proyectoX"
 */
function buildUploadFolder(userName, project) {
  const now = new Date();
  const year = now.getFullYear().toString(); // año completo
  const month = String(now.getMonth() + 1).padStart(2, "0"); // mes con 2 dígitos
  const day = String(now.getDate()).padStart(2, "0"); // día con 2 dígitos

  let folder = pathPosix.join(year, month, day, userName);
  if (project) {
    folder = pathPosix.join(folder, project);
  }

  return folder;
}

/**
 * Sube un archivo al servidor y devuelve metadata para guardar en DB
 */
export async function uploadFile(file, options) {
  const {
    username = "developer",
    project,
    allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/acc",
      "audio/ogg",
      "application/pdf",
    ],
  } = options;

  if (!file) {
    throw new BadRequestError("No se proporcionó ningún archivo.");
  }

  if (!allowedTypes.includes(file.type)) {
    throw new BadRequestError(`Tipo de archivo no permitido: ${file.type}`);
  }

  if (!username) {
    throw new BadRequestError("No se proporcionó el nombre de usuario.");
  }

  // Convertir a buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Construir carpeta de destino
  const folder = buildUploadFolder(username, project);
  const uploadDir = join(process.cwd(), "public", "uploads", folder);

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Nombre único
  const fileName = normalizeFileName(file.name);
  const filePath = join(uploadDir, fileName);

  // Guardar archivo en disco
  await writeFile(filePath, buffer);

  // URL pública relativa
  const fileUrl = pathPosix.join("/uploads", folder, fileName);

  // Metadata
  const extension = file.name.split(".").pop() || "";
  const size = buffer.length;

  return {
    name: file.name,
    mimeType: file.type,
    extension,
    size,
    folder, // 👈 carpeta relativa (ej: "2025/10/01/johndoe/proyectoX")
    path: fileUrl, // 👈 ruta pública relativa
    url: fileUrl,  // 👈 igual que path, o podrías componer con dominio
  };
}

/**
 * Elimina un archivo previamente subido
 * @param fileUrl Ruta pública devuelta por uploadFile (ej. "/uploads/cursos/16944712345-portada.png")
 * @returns true si se eliminó, false si no existe
 */
export async function deleteFile(fileUrl) {
  try {
    // Quitar el prefijo "/" para evitar problemas con path
    const relativePath = fileUrl.startsWith("/")
      ? fileUrl.slice(1)
      : fileUrl;

    // Construir la ruta absoluta en el sistema de archivos
    const filePath = join(process.cwd(), 'public', relativePath);

    await unlink(filePath);

    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      // El archivo no existe
      return false;
    }

    throw error;
  }
}
