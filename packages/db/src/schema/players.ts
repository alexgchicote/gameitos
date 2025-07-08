import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
// Players table - stores individual player information
export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  totalPoints: integer('total_points').default(0),
  gamesPlayed: integer('games_played').default(0),
  wins: integer('wins').default(0),
  podiums: integer('podiums').default(0),    // Top 3 finishes
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});