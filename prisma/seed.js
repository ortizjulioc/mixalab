const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require("fs");

const prisma = new PrismaClient();

// Leer settings.json
const settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));

async function main() {
  // Crear Admin
  const adminEmail = settings.admin.email;
  const adminPassword = settings.admin.password;
  const adminName = settings.admin.name;

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const exists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!exists) {
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
  } else {
    console.log("✔ Admin already exists");
  }

  // Crear Tiers por defecto
  const defaultTiers = settings.tiers || [
    {
      name: 'BRONZE',
      description: '<p>Perfect for getting started with professional mixing and mastering services.</p>',
      order: 1,
      price: 199,
      numberOfRevisions: 2,
      stems: 10,
      deliveryDays: 7,
    },
    {
      name: 'SILVER',
      description: '<p>Enhanced service with more revisions and faster delivery for your projects.</p>',
      order: 2,
      price: 299,
      numberOfRevisions: 3,
      stems: 20,
      deliveryDays: 5,
    },
    {
      name: 'GOLD',
      description: '<p>Premium service with priority support and extended stem count.</p>',
      order: 3,
      price: 499,
      numberOfRevisions: 5,
      stems: 40,
      deliveryDays: 3,
    },
    {
      name: 'PLATINUM',
      description: '<p>Ultimate professional service with unlimited revisions and fastest delivery.</p>',
      order: 4,
      price: 799,
      numberOfRevisions: 10,
      stems: 100,
      deliveryDays: 2,
    },
  ];

  const existingTiers = await prisma.tier.count();

  if (existingTiers === 0) {
    console.log('🌱 Creating default tiers...');
    for (const tierData of defaultTiers) {
      const tier = await prisma.tier.create({
        data: tierData,
      });
      console.log(`✅ Created tier: ${tier.name} - $${tier.price}`);
    }
    console.log('🎉 Tiers created successfully!');
  } else {
    console.log(`✔ Tiers already exist (${existingTiers} tiers found)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
