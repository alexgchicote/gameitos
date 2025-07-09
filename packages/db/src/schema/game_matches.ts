import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { games } from './games';

// Game matches table - stores individual match sessions
export const gameMatches = pgTable('game_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  matchName: text('match_name'),             // "Friday Night Session", "Tournament Round 1", etc.
  totalPlayers: integer('total_players').notNull(),
  status: text('status').default('completed'), // 'in_progress', 'completed', 'cancelled'
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export type GameMatch = typeof gameMatches.$inferSelect;
export type InsertGameMatch = typeof gameMatches.$inferInsert; 