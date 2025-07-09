import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

// Game types table - stores different types of games available
export const gameTypes = pgTable('game_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),                // "Poker", "Blackjack", "Hearts", etc.
  description: text('description'),            // Optional description
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export type GameType = typeof gameTypes.$inferSelect;
export type InsertGameType = typeof gameTypes.$inferInsert; 