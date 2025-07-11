// packages/db/src/services/matchService.ts
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { games, matches, gameTypes, players, gameResults } from '../schema';
import { calculatePointsForPosition, calculatePositionFromMedian } from './index';

// Types
export type CreateMatchInput = {
  gameId: string;
  matchName?: string;
  playerIds: string[];
};

export type CompleteMatchInput = {
  matchId: string;
  results: {
    playerId: string;
    position: number;
  }[];
};

// Create a new match
export async function createMatch(input: CreateMatchInput) {
  const [match] = await db
    .insert(matches)
    .values({
      gameId: input.gameId,
      matchName: input.matchName,
      totalPlayers: input.playerIds.length,
      status: 'in_progress',
    })
    .returning();

  return match;
}

// Complete a match with results
export async function completeMatch(input: CompleteMatchInput) {
  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, input.matchId));

  if (!match) throw new Error('Match not found');
  if (input.results.length !== match.totalPlayers) throw new Error(`Expected ${match.totalPlayers} results, got ${input.results.length}`);

  // Check for duplicate positions
  const positions = input.results.map(r => r.position);
  if (new Set(positions).size !== positions.length) throw new Error('Duplicate positions detected');

  // Check if all positions are valid (1 to totalPlayers)
  const sortedPositions = [...positions].sort((a, b) => a - b);
  for (let i = 0; i < sortedPositions.length; i++) {
    if (sortedPositions[i] !== i + 1) throw new Error(`Invalid position sequence. Expected ${i + 1}, got ${sortedPositions[i]}`);
  }

  // Calculate points for each result
  const resultsWithPoints = input.results.map(result => ({
    gameMatchId: input.matchId,
    playerId: result.playerId,
    position: result.position,
    pointsAwarded: calculatePointsForPosition(result.position, match.totalPlayers),
    positionFromMedian: calculatePositionFromMedian(result.position, match.totalPlayers),
  }));

  // Insert match results and update match status
  await db.transaction(async (tx) => {
    await tx.insert(gameResults).values(resultsWithPoints);
    await tx.update(matches).set({
      status: 'completed',
      completedAt: new Date(),
    }).where(eq(matches.id, input.matchId));
    for (const result of resultsWithPoints) {
      await tx.update(players).set({
        totalPoints: sql`${players.totalPoints} + ${result.pointsAwarded}`,
        gamesPlayed: sql`${players.gamesPlayed} + 1`,
        wins: result.position === 1 ? sql`${players.wins} + 1` : players.wins,
        podiums: result.position <= 3 ? sql`${players.podiums} + 1` : players.podiums,
        updatedAt: new Date(),
      }).where(eq(players.id, result.playerId));
    }
  });

  return await getMatchWithResults(input.matchId);
}

// Get match with results
export async function getMatchWithResults(matchId: string) {
  const match = await db
    .select({
      id: matches.id,
      matchName: matches.matchName,
      totalPlayers: matches.totalPlayers,
      status: matches.status,
      startedAt: matches.startedAt,
      completedAt: matches.completedAt,
      createdAt: matches.createdAt,
      gameId: games.id,
      gameName: games.name,
      gameTypeId: gameTypes.id,
      gameTypeName: gameTypes.name,
    })
    .from(matches)
    .innerJoin(games, eq(matches.gameId, games.id))
    .innerJoin(gameTypes, eq(games.gameTypeId, gameTypes.id))
    .where(eq(matches.id, matchId));

  if (!match.length) throw new Error('Match not found');

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
    .where(eq(gameResults.gameMatchId, matchId))
    .orderBy(gameResults.position);

  return {
    ...match[0],
    results,
  };
}

// Get recent game matches
export async function getRecentMatches(limit: number = 10) {
  const recentMatches = await db
    .select({
      id: matches.id,
      matchName: matches.matchName,
      totalPlayers: matches.totalPlayers,
      status: matches.status,
      startedAt: matches.startedAt,
      completedAt: matches.completedAt,
      createdAt: matches.createdAt,
      gameId: games.id,
      gameName: games.name,
      gameTypeId: gameTypes.id,
      gameTypeName: gameTypes.name,
    })
    .from(matches)
    .innerJoin(games, eq(matches.gameId, games.id))
    .innerJoin(gameTypes, eq(games.gameTypeId, gameTypes.id))
    .where(eq(matches.status, 'completed'))
    .orderBy(desc(matches.completedAt))
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