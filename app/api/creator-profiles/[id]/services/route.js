// app/api/creator/service/route.js
import { NextResponse } from "next/server";

import { uploadFile } from "@/utils/upload";
import prisma from "@/utils/lib/prisma";



export const dynamic = "force-dynamic";

export async function POST(req, res) {
  try {
    const form = await req.formData();

    const creatorId = res.params.id;
    const serviceId = form.get("serviceId");

    const title = form.get("title");
    const description = form.get("description");
    const turnaroundDays = form.get("turnaroundDays")
      ? Number(form.get("turnaroundDays"))
      : null;

    const yearsExperience = form.get("yearsExperience")
      ? Number(form.get("yearsExperience"))
      : null;

    const notableArtists = form.get("notableArtists");
    const tunesVocals = form.get("tunesVocals") === "true";

    const preferredLoudness = form.get("preferredLoudness");
    const instruments = form.get("instruments");
    const studioSetup = form.get("studioSetup");

    // Archivos
    const tunedExampleFile = form.get("tunedExampleFile");

    // Files múltiples
    const exampleFiles = [];
    form.forEach((value, key) => {
      if (key === "exampleFiles" && value instanceof File) {
        exampleFiles.push(value);
      }
    });

    // Datos para uploadFile
    const username = form.get("username");
    const project = form.get("project");

    if (!creatorId || !serviceId) {
      return NextResponse.json(
        { error: "creatorId y serviceId son obligatorios" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let tunedExampleId = null;

      // --------------------------------------------------------
      // Subir archivo tunedExample si existe
      // --------------------------------------------------------
      if (tunedExampleFile instanceof File) {
        const uploaded = await uploadFile(tunedExampleFile, { username, project });

        const tuned = await tx.file.create({
          data: {
            name: uploaded.name,
            mimeType: uploaded.mimeType,
            extension: uploaded.extension,
            size: uploaded.size,
            folder: uploaded.folder,
            path: uploaded.path,
            url: uploaded.url,
            userId: creatorId, // ajusta si el owner es el user real
          },
        });

        tunedExampleId = tuned.id;
      }

      // --------------------------------------------------------
      // Crear Offering
      // --------------------------------------------------------
      const offering = await tx.creatorServiceOffering.create({
        data: {
          creatorId,
          serviceId,
          title,
          description,
          turnaroundDays,
          yearsExperience,
          notableArtists,
          tunesVocals,
          preferredLoudness,
          instruments,
          studioSetup,
          tunedExampleId,
        },
      });

      // --------------------------------------------------------
      // Subir + vincular archivos de ejemplo
      // --------------------------------------------------------
      for (const file of exampleFiles) {
        const uploaded = await uploadFile(file, { username, project });

        const savedFile = await tx.file.create({
          data: {
            name: uploaded.name,
            mimeType: uploaded.mimeType,
            extension: uploaded.extension,
            size: uploaded.size,
            folder: uploaded.folder,
            path: uploaded.path,
            url: uploaded.url,
            userId: creatorId,
          },
        });

        await tx.creatorServiceExample.create({
          data: {
            offeringId: offering.id,
            fileId: savedFile.id,
            tag: "EXAMPLE", // ajusta a tu enum real
          },
        });
      }

      return offering;
    });

    return NextResponse.json({ success: true, offering: result });
  } catch (error) {
    console.error("Error en endpoint:", error);
    return NextResponse.json(
      {
        error: "Error interno",
        message: error?.message || "Algo falló",
      },
      { status: 500 }
    );
  }
}
