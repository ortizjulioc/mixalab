const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require("fs");

const prisma = new PrismaClient();

// Leer settings.json
const settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));

async function main() {
  const adminEmail = settings.admin.email;
  const adminPassword = settings.admin.password;
  const adminName = settings.admin.name;

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const exists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (exists) {
    console.log("✔ Admin already exists");
    return;
  }

  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
      status: "ACTIVE",
    },
  });

  console.log("✔ Admin created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
