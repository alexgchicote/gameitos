import { eq } from 'drizzle-orm';
import { db } from '../index';
import { gameTypes } from '../schema';

export type CreateGameTypeInput = {
  name: string;
  description?: string;
};

// Get all available game types
export async function getAllGameTypes() {
  return await db
    .select({
      id: gameTypes.id,
      name: gameTypes.name,
      description: gameTypes.description,
      createdAt: gameTypes.createdAt,
    })
    .from(gameTypes)
    .orderBy(gameTypes.name);
}

// Create a new game type
export async function createGameType(input: CreateGameTypeInput) {
  const [gameType] = await db
    .insert(gameTypes)
    .values({
      name: input.name,
      description: input.description,
    })
    .returning();

  return gameType;
}

// Get game type by ID
export async function getGameTypeById(id: string) {
  const [gameType] = await db
    .select()
    .from(gameTypes)
    .where(eq(gameTypes.id, id));

  return gameType;
} 