import { pgTable, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { gameMatches } from './game_matches';
import { players } from './players';

// Game results table - links players to their performance in specific game matches
export const gameResults = pgTable('game_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameMatchId: uuid('game_match_id').references(() => gameMatches.id).notNull(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  position: integer('position').notNull(),    // 1st, 2nd, 3rd, etc.
  pointsAwarded: integer('points_awarded').notNull(),
  positionFromMedian: integer('position_from_median'), // Position relative to median: +3, +2, +1, 0, -1, -2, -3
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});