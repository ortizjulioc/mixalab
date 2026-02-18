import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
  // datasource is implicit from schema.prisma in standard setup,
  // but if explicitly required by CLI 7.x in config:
  datasource: {
    url: env("DATABASE_URL"),
  },
});
