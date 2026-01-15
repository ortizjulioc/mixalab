import prisma from '@/utils/lib/prisma';
import { uploadFile } from '@/utils/upload';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

/**
 * POST /api/service-requests
 * Create a new service request
 */
export async function POST(request) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse form data
    const formData = await request.formData();

    // Extract service request data
    const projectName = formData.get('projectName');
    const artistName = formData.get('artistName');
    const projectType = formData.get('projectType');
    const tier = formData.get('tier');
    const services = formData.get('services');
    const description = formData.get('description');
    const mixingType = formData.get('mixingType');
    const genreIdsJson = formData.get('genreIds'); // JSON string
    const addOnsJson = formData.get('addOns'); // JSON string
    const acceptanceJson = formData.get('acceptance'); // JSON string

    // Validate required fields
    if (!projectName || !artistName || !projectType || !tier || !services) {
      return NextResponse.json(
        { error: 'Missing required fields: projectName, artistName, projectType, tier, services' },
        { status: 400 }
      );
    }

    // Validate enums
    const validProjectTypes = ['SINGLE', 'EP', 'ALBUM'];
    const validTiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const validServices = ['MIXING', 'MASTERING', 'RECORDING'];

    if (!validProjectTypes.includes(projectType)) {
      return NextResponse.json(
        { error: `Invalid projectType. Must be one of: ${validProjectTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validServices.includes(services)) {
      return NextResponse.json(
        { error: `Invalid services. Must be one of: ${validServices.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse JSON fields
    let genreIds = [];
    if (genreIdsJson) {
      try {
        genreIds = JSON.parse(genreIdsJson);
        if (!Array.isArray(genreIds)) {
          genreIds = [];
        }
      } catch (e) {
        console.error('Error parsing genreIds:', e);
      }
    }

    let addOns = {};
    if (addOnsJson) {
      try {
        addOns = JSON.parse(addOnsJson);
      } catch (e) {
        console.error('Error parsing addOns:', e);
      }
    }

    let acceptance = {};
    if (acceptanceJson) {
      try {
        acceptance = JSON.parse(acceptanceJson);
      } catch (e) {
        console.error('Error parsing acceptance:', e);
      }
    }

    // Handle file uploads
    const fileUploadPromises = [];
    const fileKeys = [];

    // Get all files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        fileKeys.push(key);
        fileUploadPromises.push(
          uploadFile(value, userId, projectName).then(metadata => ({
            key,
            metadata
          }))
        );
      }
    }

    // Upload files
    let uploadedFiles = [];
    if (fileUploadPromises.length > 0) {
      try {
        uploadedFiles = await Promise.all(fileUploadPromises);
      } catch (error) {
        console.error('Error uploading files:', error);
        return NextResponse.json(
          { error: 'Error uploading files: ' + error.message },
          { status: 500 }
        );
      }
    }

    // Create service request with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create file records
      const fileRecords = [];
      for (const { metadata } of uploadedFiles) {
        const fileRecord = await tx.file.create({
          data: {
            ...metadata,
            userId: userId,
          }
        });
        fileRecords.push(fileRecord);
      }

      // Create service request
      const serviceRequest = await tx.serviceRequest.create({
        data: {
          user: {
            connect: { id: userId }
          },
          projectName,
          artistName,
          projectType,
          tier,
          services,
          mixingType: mixingType || null,
          description: description || null,
          addOns: addOns,
          acceptance: acceptance,
          status: 'PENDING',
          files: {
            connect: fileRecords.map(f => ({ id: f.id }))
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          files: true,
          genres: {
            include: {
              genre: true
            }
          }
        }
      });

      // Create genre relations if provided
      if (genreIds.length > 0) {
        await tx.serviceRequestGenre.createMany({
          data: genreIds.map(genreId => ({
            serviceRequestId: serviceRequest.id,
            genreId
          })),
          skipDuplicates: true
        });
      }

      return serviceRequest;
    });

    return NextResponse.json({
      message: 'Service request created successfully',
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
