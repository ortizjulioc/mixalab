const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSIS START ---');

    // 1. Get all Service Requests
    const requests = await prisma.serviceRequest.findMany({
        select: {
            id: true,
            projectName: true,
            status: true,
            creatorId: true,
            tier: true
        }
    });
    console.log('REQUESTS:', JSON.stringify(requests, null, 2));

    // 2. Get all Creator Profiles
    const creators = await prisma.creatorProfile.findMany({
        select: {
            id: true,
            userId: true,
            brandName: true,
            status: true,
            CreatorTier: {
                include: { tier: true }
            }
        }
    });
    console.log('CREATORS:', JSON.stringify(creators, null, 2));

    console.log('--- DIAGNOSIS END ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
