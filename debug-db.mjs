import { prisma } from "./utils/lib/prisma.js";

async function main() {
  console.log("--- Checking Service Requests ---");
  try {
    const requests = await prisma.serviceRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        projectName: true,
        status: true,
        creatorId: true,
        userId: true,
      },
    });
    console.log(`Found ${requests.length} Service Requests:`);
    requests.forEach((r) => console.log(JSON.stringify(r, null, 2)));

    console.log("\n--- Checking Projects ---");
    const projects = await prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, projectName: true, userId: true },
    });
    console.log(`Found ${projects.length} Projects:`);
    projects.forEach((p) => console.log(JSON.stringify(p, null, 2)));

    // Check ChatRooms
    console.log("\n--- Checking Chat Rooms ---");
    const chats = await prisma.chatRoom.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        serviceRequestId: true,
        artistId: true,
        creatorId: true,
      },
    });
    console.log(`Found ${chats.length} Chat Rooms:`);
    chats.forEach((c) => console.log(JSON.stringify(c, null, 2)));
  } catch (e) {
    console.error("Query Error:", e);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    // await prisma.$disconnect();
    // disconnecting adapter-based client might be tricky or unnecessary for script
    process.exit(0);
  });
