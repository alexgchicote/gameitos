import { NextResponse } from 'next/server';
import { getAllPlayers, getRecentGames } from '@gameitos/db';

export async function GET() {
  try {
    const [players, games] = await Promise.all([
      getAllPlayers(),
      getRecentGames(100), // Get more games for better stats
    ]);
    
    const totalPlayers = players.length;
    const totalGames = games.length;
    const topScore = Math.max(...players.map(p => p.totalPoints || 0));
    
    // Calculate average points per game
    const totalPointsAwarded = players.reduce((sum, p) => sum + (p.totalPoints || 0), 0);
    const totalGamesPlayed = players.reduce((sum, p) => sum + (p.gamesPlayed || 0), 0);
    const avgPointsPerGame = totalGamesPlayed > 0 ? totalPointsAwarded / totalGamesPlayed : 0;
    
    const stats = {
      totalPlayers,
      totalGames,
      topScore,
      avgPointsPerGame: Math.round(avgPointsPerGame * 10) / 10, // Round to 1 decimal
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 