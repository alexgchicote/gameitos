import { pgTable, text, uuid, timestamp, integer } from 'drizzle-orm/pg-core';
import { gameTypes } from './game_types';

// Games table - stores available games like "Kittens", "Uno", "Culo"
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),       // "Kittens", "Uno", "Culo", etc.
  gameTypeId: uuid('game_type_id').references(() => gameTypes.id).notNull(),
  description: text('description'),            // Optional description of the game
  minPlayers: integer('min_players').default(2),
  maxPlayers: integer('max_players'),          // Optional max players
  isActive: text('is_active').default('true'), // Whether this game is actively played
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert; 