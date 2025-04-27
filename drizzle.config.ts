import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, ".dev.vars")});

export default defineConfig({
  out: "./drizzle",
  dialect: 'sqlite',
  schema: './src/db/schema',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!
  }
});
