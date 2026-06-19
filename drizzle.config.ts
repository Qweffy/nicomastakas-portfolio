import { defineConfig } from "drizzle-kit";

// Run with the connection string in the environment, e.g.
//   DATABASE_URL="postgres://..." pnpm db:push
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
