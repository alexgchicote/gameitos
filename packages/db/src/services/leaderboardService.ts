import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { players, games, gameMatches, gameResults } from '../schema';

export type LeaderboardPlayer = {
  id: string;
  name: string;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  podiums: number;
  winRate: number;
  podiumRate: number;
  averagePoints: number;
  recentForm: number[]; // Last 5 game positions
};

export type LeaderboardFilters = {
  gameType?: string;
  minGames?: number;
  period?: 'all' | 'month' | 'week';
};

// Get main leaderboard
export async function getLeaderboard(
  limit: number = 50,
  filters: LeaderboardFilters = {}
): Promise<LeaderboardPlayer[]> {
  const playersData = await db
    .select({
      id: players.id,
      name: players.name,
      totalPoints: players.totalPoints,
      gamesPlayed: players.gamesPlayed,
      wins: players.wins,
      podiums: players.podiums,
    })
    .from(players)
    .where(
      filters.minGames 
        ? sql`${players.gamesPlayed} >= ${filters.minGames}`
        : undefined
    )
    .orderBy(desc(players.totalPoints))
    .limit(limit);

  // Enhance with calculated fields and recent form
  const enhancedPlayers = await Promise.all(
    playersData.map(async (player) => {
      const recentForm = await getPlayerRecentForm(player.id, 5);
      const totalPoints = player.totalPoints ?? 0;
      const gamesPlayed = player.gamesPlayed ?? 0;
      const wins = player.wins ?? 0;
      const podiums = player.podiums ?? 0;
      
      return {
        id: player.id,
        name: player.name,
        totalPoints,
        gamesPlayed,
        wins,
        podiums,
        winRate: gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0,
        podiumRate: gamesPlayed > 0 ? (podiums / gamesPlayed) * 100 : 0,
        averagePoints: gamesPlayed > 0 ? totalPoints / gamesPlayed : 0,
        recentForm,
      };
    })
  );

  return enhancedPlayers;
}

// Get player recent form (last N positions)
export async function getPlayerRecentForm(playerId: string, gameCount: number = 5): Promise<number[]> {
  const recentResults = await db
    .select({
      position: gameResults.position,
    })
    .from(gameResults)
    .innerJoin(gameMatches, eq(gameResults.gameMatchId, gameMatches.id))
    .where(eq(gameResults.playerId, playerId))
    .orderBy(desc(gameMatches.completedAt))
    .limit(gameCount);

  return recentResults.map(r => r.position);
}

// Get player detailed stats
export async function getPlayerStats(playerId: string) {
  const player = await db
    .select()
    .from(players)
    .where(eq(players.id, playerId));

  if (!player.length) {
    throw new Error('Player not found');
  }

  // Get recent games
  const recentGames = await db
    .select({
      gameMatchId: gameResults.gameMatchId,
      gameName: games.name,
      matchName: gameMatches.matchName,
      position: gameResults.position,
      pointsAwarded: gameResults.pointsAwarded,
      totalPlayers: gameMatches.totalPlayers,
      completedAt: gameMatches.completedAt,
    })
    .from(gameResults)
    .innerJoin(gameMatches, eq(gameResults.gameMatchId, gameMatches.id))
    .innerJoin(games, eq(gameMatches.gameId, games.id))
    .where(eq(gameResults.playerId, playerId))
    .orderBy(desc(gameMatches.completedAt))
    .limit(10);

  // Calculate position statistics
  const positionStats = await db
    .select({
      position: gameResults.position,
      count: sql<number>`count(*)`,
    })
    .from(gameResults)
    .where(eq(gameResults.playerId, playerId))
    .groupBy(gameResults.position)
    .orderBy(gameResults.position);

  return {
    player: player[0],
    recentGames,
    positionStats: positionStats.map(stat => ({
      position: stat.position,
      count: Number(stat.count),
    })),
  };
}

// Get game specific leaderboard
export async function getGameLeaderboard(gameId: string, limit: number = 20) {
  const results = await db
    .select({
      playerId: gameResults.playerId,
      playerName: players.name,
      totalPoints: sql<number>`sum(${gameResults.pointsAwarded})`,
      gamesPlayed: sql<number>`count(*)`,
      wins: sql<number>`sum(case when ${gameResults.position} = 1 then 1 else 0 end)`,
      podiums: sql<number>`sum(case when ${gameResults.position} <= 3 then 1 else 0 end)`,
    })
    .from(gameResults)
    .innerJoin(gameMatches, eq(gameResults.gameMatchId, gameMatches.id))
    .innerJoin(games, eq(gameMatches.gameId, games.id))
    .innerJoin(players, eq(gameResults.playerId, players.id))
    .where(eq(games.id, gameId))
    .groupBy(gameResults.playerId, players.name)
    .orderBy(desc(sql`sum(${gameResults.pointsAwarded})`))
    .limit(limit);

  return results.map(result => ({
    playerId: result.playerId,
    playerName: result.playerName,
    totalPoints: Number(result.totalPoints),
    gamesPlayed: Number(result.gamesPlayed),
    wins: Number(result.wins),
    podiums: Number(result.podiums),
    winRate: Number(result.gamesPlayed) > 0 ? (Number(result.wins) / Number(result.gamesPlayed)) * 100 : 0,
    podiumRate: Number(result.gamesPlayed) > 0 ? (Number(result.podiums) / Number(result.gamesPlayed)) * 100 : 0,
    averagePoints: Number(result.gamesPlayed) > 0 ? Number(result.totalPoints) / Number(result.gamesPlayed) : 0,
  }));
} 