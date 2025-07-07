import { eq, like } from 'drizzle-orm';
import { db } from '../index';
import { players } from '../schema';

export type CreatePlayerInput = {
  name: string;
};

// Create a new player
export async function createPlayer(input: CreatePlayerInput) {
  const [player] = await db
    .insert(players)
    .values({
      name: input.name,
      totalPoints: 0,
      gamesPlayed: 0,
      wins: 0,
      podiums: 0,
    })
    .returning();

  return player;
}

// Get all players
export async function getAllPlayers() {
  return await db.select().from(players);
}

// Search players by name
export async function searchPlayers(query: string) {
  return await db
    .select()
    .from(players)
    .where(like(players.name, `%${query}%`));
}

// Get player by ID
export async function getPlayerById(id: string) {
  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.id, id));

  return player;
}

// Update player name
export async function updatePlayer(id: string, input: { name: string }) {
  const [player] = await db
    .update(players)
    .set({
      name: input.name,
      updatedAt: new Date(),
    })
    .where(eq(players.id, id))
    .returning();

  return player;
}

// Delete player (soft delete by setting name to include [DELETED])
export async function deletePlayer(id: string) {
  const player = await getPlayerById(id);
  if (!player) {
    throw new Error('Player not found');
  }

  const [deletedPlayer] = await db
    .update(players)
    .set({
      name: `[DELETED] ${player.name}`,
      updatedAt: new Date(),
    })
    .where(eq(players.id, id))
    .returning();

  return deletedPlayer;
} 