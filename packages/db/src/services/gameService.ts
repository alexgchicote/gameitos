import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { games, players, gameResults } from '../schema';
import { calculatePointsForPosition, calculatePositionFromMedian } from './index';

export type CreateGameInput = {
  name: string;
  gameType?: string;
  playerIds: string[];
};

export type GameResultInput = {
  playerId: string;
  position: number;
};

export type CompleteGameInput = {
  gameId: string;
  results: GameResultInput[];
};

// Create a new game
export async function createGame(input: CreateGameInput) {
  const [game] = await db
    .insert(games)
    .values({
      name: input.name,
      gameType: input.gameType,
      totalPlayers: input.playerIds.length,
      status: 'in_progress',
    })
    .returning();

  return game;
}

// Complete a game with results
export async function completeGame(input: CompleteGameInput) {
  const [game] = await db
    .select()
    .from(games)
    .where(eq(games.id, input.gameId));

  if (!game) {
    throw new Error('Game not found');
  }

  // Validate results
  if (input.results.length !== game.totalPlayers) {
    throw new Error(`Expected ${game.totalPlayers} results, got ${input.results.length}`);
  }

  // Check for duplicate positions
  const positions = input.results.map(r => r.position);
  if (new Set(positions).size !== positions.length) {
    throw new Error('Duplicate positions detected');
  }

  // Check if all positions are valid (1 to totalPlayers)
  const sortedPositions = [...positions].sort((a, b) => a - b);
  for (let i = 0; i < sortedPositions.length; i++) {
    if (sortedPositions[i] !== i + 1) {
      throw new Error(`Invalid position sequence. Expected ${i + 1}, got ${sortedPositions[i]}`);
    }
  }

  // Calculate points for each result
  const resultsWithPoints = input.results.map(result => ({
    gameId: input.gameId,
    playerId: result.playerId,
    position: result.position,
    pointsAwarded: calculatePointsForPosition(result.position, game.totalPlayers),
    positionFromMedian: calculatePositionFromMedian(result.position, game.totalPlayers),
  }));

  // Insert game results and update game status
  await db.transaction(async (tx) => {
    // Insert game results
    await tx.insert(gameResults).values(resultsWithPoints);

    // Update game status
    await tx
      .update(games)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(games.id, input.gameId));

    // Update player statistics
    for (const result of resultsWithPoints) {
      await tx
        .update(players)
        .set({
          totalPoints: sql`${players.totalPoints} + ${result.pointsAwarded}`,
          gamesPlayed: sql`${players.gamesPlayed} + 1`,
          wins: result.position === 1 ? sql`${players.wins} + 1` : players.wins,
          podiums: result.position <= 3 ? sql`${players.podiums} + 1` : players.podiums,
          updatedAt: new Date(),
        })
        .where(eq(players.id, result.playerId));
    }
  });

  return await getGameWithResults(input.gameId);
}

// Get game with results
export async function getGameWithResults(gameId: string) {
  const game = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId));

  if (!game.length) {
    throw new Error('Game not found');
  }

  const results = await db
    .select({
      id: gameResults.id,
      position: gameResults.position,
      pointsAwarded: gameResults.pointsAwarded,
      positionFromMedian: gameResults.positionFromMedian,
      player: {
        id: players.id,
        name: players.name,
      },
    })
    .from(gameResults)
    .innerJoin(players, eq(gameResults.playerId, players.id))
    .where(eq(gameResults.gameId, gameId))
    .orderBy(gameResults.position);

  return {
    ...game[0],
    results,
  };
}

// Get recent games
export async function getRecentGames(limit: number = 10) {
  return await db
    .select()
    .from(games)
    .where(eq(games.status, 'completed'))
    .orderBy(desc(games.completedAt))
    .limit(limit);
} 