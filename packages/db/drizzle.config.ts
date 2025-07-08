import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

// Load .env.local from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

export default defineConfig({
  out: './drizzle',
  schema: './src/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});