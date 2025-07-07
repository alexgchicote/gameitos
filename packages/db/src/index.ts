// Create and export database connection
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Export schema
export * from './schema';

// Export services
export * from './services';
export * from './services/gameService';
export * from './services/leaderboardService';
export * from './services/playerService';