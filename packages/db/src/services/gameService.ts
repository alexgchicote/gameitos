// packages/db/src/services/gameService.ts
import { db } from '../index';
import { eq } from 'drizzle-orm';
import { games } from '../schema';

export type CreateGameInput = {
  name: string;
  gameTypeId: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number | null;
  isActive?: boolean;
};

// Create a new game definition
export async function createGame(input: CreateGameInput) {
  const [game] = await db
    .insert(games)
    .values({
      name: input.name,
      gameTypeId: input.gameTypeId,
      description: input.description,
      minPlayers: input.minPlayers || 2,
      maxPlayers: input.maxPlayers,
      isActive: input.isActive !== false ? 'true' : 'false',
    })
    .returning();

  return game;
}

// Get all available games for dropdown
export async function getAvailableGames() {
  return await db
    .select({
      id: games.id,
      name: games.name,
      gameTypeId: games.gameTypeId,
      minPlayers: games.minPlayers,
      maxPlayers: games.maxPlayers,
    })
    .from(games)
    .where(eq(games.isActive, 'true'))
    .orderBy(games.name);
}