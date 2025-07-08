import { pgTable, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { games } from './games';
import { players } from './players';

// Game results table - links players to their performance in specific games
export const gameResults = pgTable('game_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  position: integer('position').notNull(),    // 1st, 2nd, 3rd, etc.
  pointsAwarded: integer('points_awarded').notNull(),
  positionFromMedian: integer('position_from_median'), // Position relative to median: +3, +2, +1, 0, -1, -2, -3
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});