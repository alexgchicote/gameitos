import { relations } from 'drizzle-orm';
import { players } from './players';
import { games } from './games';
import { gameResults } from './game_results';

// RELATIONS (add this part to the same file)
export const playersRelations = relations(players, ({ many }) => ({
    gameResults: many(gameResults),
}));

export const gamesRelations = relations(games, ({ many }) => ({
    results: many(gameResults),
}));

export const gameResultsRelations = relations(gameResults, ({ one }) => ({
    game: one(games, {
        fields: [gameResults.gameId],
        references: [games.id],
    }),
    player: one(players, {
        fields: [gameResults.playerId],
        references: [players.id],
    }),
}));

// TYPES (add this too)
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GameResult = typeof gameResults.$inferSelect;
export type NewGameResult = typeof gameResults.$inferInsert;

export * from './players';
export * from './games';
export * from './game_results';