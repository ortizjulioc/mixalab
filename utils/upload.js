import { mkdir, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, posix as pathPosix } from 'path';

import { BadRequestError } from './errors';


/**
 * Sube un archivo al servidor
 * @param {*} file 
 * @param {*} options 
 * @returns 
 */
export async function uploadFile(file, options) {
  const { folder, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] } = options;

  if (!file) {
    throw new BadRequestError('No se proporcionó ningún archivo.');
  }

  // Validar tipo de archivo
  if (!allowedTypes.includes(file.type)) {
    throw new BadRequestError('Tipo de archivo no permitido.');
  }

  // Convertir el archivo a buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Definir la ruta donde se guardará la imagen
  const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = join(uploadDir, fileName);

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Guardar el archivo en el servidor
  await writeFile(filePath, buffer);

  // URL pública del archivo
  const fileUrl = pathPosix.join('/uploads', folder, fileName);

  return fileUrl;
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
