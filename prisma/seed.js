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
  const defaultTiers = settings.tiers || [];

  // SIEMPRE eliminar tiers existentes para asegurar estructura correcta
  const existingTiers = await prisma.tier.count();

  if (existingTiers > 0) {
    console.log(`🗑️  Deleting ${existingTiers} existing tiers...`);
    await prisma.tier.deleteMany({});
    console.log('✅ Old tiers deleted');
  }

  if (defaultTiers.length > 0) {
    console.log('🌱 Creating universal tiers with service-specific descriptions...');
    for (const tierData of defaultTiers) {
      try {
        const tier = await prisma.tier.create({
          data: {
            name: tierData.name,
            order: tierData.order,
            price: tierData.price,
            numberOfRevisions: tierData.numberOfRevisions,
            stems: tierData.stems,
            deliveryDays: tierData.deliveryDays,
            serviceDescriptions: tierData.serviceDescriptions || null,
          },
        });
        console.log(`✅ Created tier: ${tier.name} (order: ${tier.order}) - $${tier.price}`);
      } catch (error) {
        console.error(`❌ Error creating tier ${tierData.name}:`, error.message);
      }
    }
    console.log(`🎉 All ${defaultTiers.length} universal tiers created successfully!`);
  } else {
    console.log('⚠️  No tiers found in settings.json');
  }

  // Crear Géneros por defecto
  const defaultGenres = settings.genres || [
    "Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Dance", "House",
    "Techno", "Trap", "Reggaeton", "Latin", "Jazz", "Blues", "Country",
    "Folk", "Classical", "Metal", "Punk", "Indie", "Alternative"
  ];

  const existingGenres = await prisma.genre.count();

  if (existingGenres === 0) {
    console.log('🎵 Creating default genres...');
    for (const genreName of defaultGenres) {
      const genre = await prisma.genre.create({
        data: { name: genreName },
      });
      console.log(`✅ Created genre: ${genre.name}`);
    }
    console.log('🎉 Genres created successfully!');
  } else {
    console.log(`✔ Genres already exist (${existingGenres} genres found)`);
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
