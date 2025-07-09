import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { games, gameMatches, gameTypes, players, gameResults } from '../schema';
import { calculatePointsForPosition, calculatePositionFromMedian } from './index';

export type CreateGameMatchInput = {
  gameId: string; // References the game definition (Kittens, Uno, etc.)
  matchName?: string; // Optional match name like "Friday Night Session"
  playerIds: string[];
};

export type CompleteGameMatchInput = {
  gameMatchId: string;
  results: {
    playerId: string;
    position: number;
  }[];
};

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
      gameTypeId: gameTypes.id,
      gameTypeName: gameTypes.name,
      minPlayers: games.minPlayers,
      maxPlayers: games.maxPlayers,
    })
    .from(games)
    .innerJoin(gameTypes, eq(games.gameTypeId, gameTypes.id))
    .where(eq(games.isActive, 'true'))
    .orderBy(games.name);
}

// Get players who have played a specific game, ordered by last game
export async function getPlayersForGame(gameId: string) {
  const playersInGame = await db
    .select({
      id: players.id,
      name: players.name,
      lastPlayed: sql<Date>`MAX(${gameMatches.completedAt})`.as('lastPlayed'),
    })
    .from(players)
    .innerJoin(gameResults, eq(gameResults.playerId, players.id))
    .innerJoin(gameMatches, eq(gameResults.gameMatchId, gameMatches.id))
    .where(eq(gameMatches.gameId, gameId))
    .groupBy(players.id, players.name)
    .orderBy(desc(sql`MAX(${gameMatches.completedAt})`));

  return playersInGame;
}

// Create a new game match
export async function createGameMatch(input: CreateGameMatchInput) {
  const [gameMatch] = await db
    .insert(gameMatches)
    .values({
      gameId: input.gameId,
      matchName: input.matchName,
      totalPlayers: input.playerIds.length,
      status: 'in_progress',
    })
    .returning();

  return gameMatch;
}

// Complete a game match with results
export async function completeGameMatch(input: CompleteGameMatchInput) {
  const [gameMatch] = await db
    .select()
    .from(gameMatches)
    .where(eq(gameMatches.id, input.gameMatchId));

  if (!gameMatch) {
    throw new Error('Game match not found');
  }

  // Validate results
  if (input.results.length !== gameMatch.totalPlayers) {
    throw new Error(`Expected ${gameMatch.totalPlayers} results, got ${input.results.length}`);
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
    gameMatchId: input.gameMatchId,
    playerId: result.playerId,
    position: result.position,
    pointsAwarded: calculatePointsForPosition(result.position, gameMatch.totalPlayers),
    positionFromMedian: calculatePositionFromMedian(result.position, gameMatch.totalPlayers),
  }));

  // Insert game results and update game status
  await db.transaction(async (tx) => {
    // Insert game results
    await tx.insert(gameResults).values(resultsWithPoints);

    // Update game match status
    await tx
      .update(gameMatches)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(gameMatches.id, input.gameMatchId));

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

  return await getGameMatchWithResults(input.gameMatchId);
}

// Get game match with results
export async function getGameMatchWithResults(gameMatchId: string) {
  const gameMatch = await db
    .select({
      id: gameMatches.id,
      matchName: gameMatches.matchName,
      totalPlayers: gameMatches.totalPlayers,
      status: gameMatches.status,
      startedAt: gameMatches.startedAt,
      completedAt: gameMatches.completedAt,
      createdAt: gameMatches.createdAt,
      gameId: games.id,
      gameName: games.name,
      gameTypeId: gameTypes.id,
      gameTypeName: gameTypes.name,
    })
    .from(gameMatches)
    .innerJoin(games, eq(gameMatches.gameId, games.id))
    .innerJoin(gameTypes, eq(games.gameTypeId, gameTypes.id))
    .where(eq(gameMatches.id, gameMatchId));

  if (!gameMatch.length) {
    throw new Error('Game match not found');
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
    .where(eq(gameResults.gameMatchId, gameMatchId))
    .orderBy(gameResults.position);

  return {
    ...gameMatch[0],
    results,
  };
}

// Get recent game matches
export async function getRecentGameMatches(limit: number = 10) {
  const recentMatches = await db
    .select({
      id: gameMatches.id,
      matchName: gameMatches.matchName,
      totalPlayers: gameMatches.totalPlayers,
      status: gameMatches.status,
      startedAt: gameMatches.startedAt,
      completedAt: gameMatches.completedAt,
      createdAt: gameMatches.createdAt,
      gameId: games.id,
      gameName: games.name,
      gameTypeId: gameTypes.id,
      gameTypeName: gameTypes.name,
    })
    .from(gameMatches)
    .innerJoin(games, eq(gameMatches.gameId, games.id))
    .innerJoin(gameTypes, eq(games.gameTypeId, gameTypes.id))
    .where(eq(gameMatches.status, 'completed'))
    .orderBy(desc(gameMatches.completedAt))
    .limit(limit);

  // Get winner and last place for each match
  const matchesWithResults = await Promise.all(
    recentMatches.map(async (match) => {
      const results = await db
        .select({
          position: gameResults.position,
          player: {
            id: players.id,
            name: players.name,
          },
        })
        .from(gameResults)
        .innerJoin(players, eq(gameResults.playerId, players.id))
        .where(eq(gameResults.gameMatchId, match.id))
        .orderBy(gameResults.position);

      const winner = results.find(r => r.position === 1);
      const lastPlace = results.find(r => r.position === match.totalPlayers);

      return {
        ...match,
        winner: winner ? winner.player : null,
        lastPlace: lastPlace ? lastPlace.player : null,
      };
    })
  );

  return matchesWithResults;
}

// Backward compatibility function
export const getRecentGames = getRecentGameMatches; 