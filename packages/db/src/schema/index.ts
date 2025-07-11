import { relations } from 'drizzle-orm';
import { players } from './players';
import { games } from './games';
import { matches } from './game_matches';
import { gameResults } from './game_results';
import { gameTypes } from './game_types';

// RELATIONS (add this part to the same file)
export const playersRelations = relations(players, ({ many }) => ({
    gameResults: many(gameResults),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
    gameType: one(gameTypes, {
        fields: [games.gameTypeId],
        references: [gameTypes.id],
    }),
    matches: many(matches),
}));

export const gameResultsRelations = relations(gameResults, ({ one }) => ({
    gameMatch: one(matches, {
        fields: [gameResults.gameMatchId],
        references: [matches.id],
    }),
    player: one(players, {
        fields: [gameResults.playerId],
        references: [players.id],
    }),
}));

export const gameTypesRelations = relations(gameTypes, ({ many }) => ({
    games: many(games),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
    game: one(games, {
        fields: [matches.gameId],
        references: [games.id],
    }),
    results: many(gameResults),
}));

// TYPES (add this too)
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type GameResult = typeof gameResults.$inferSelect;
export type NewGameResult = typeof gameResults.$inferInsert;
export type GameType = typeof gameTypes.$inferSelect;
export type NewGameType = typeof gameTypes.$inferInsert;
export type GameMatch = typeof matches.$inferSelect;
export type NewGameMatch = typeof matches.$inferInsert;

// Re-export specific items to avoid conflicts
export { games, type Game, type InsertGame } from './games';
export { matches, type Match, type InsertMatch } from './game_matches';
export * from './players';
export * from './game_results';
export * from './game_types';