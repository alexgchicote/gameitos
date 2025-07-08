import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

// Games table - stores information about each game session
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),              // "Friday Night Poker"
  gameType: text('game_type'),               // "poker", "blackjack", etc.
  totalPlayers: integer('total_players').notNull(),
  status: text('status').default('completed'), // 'in_progress', 'completed', 'cancelled'
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});