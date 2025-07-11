import { NextResponse } from 'next/server';
import { getAllPlayers, getRecentMatches } from '@gameitos/db';

export async function GET() {
  try {
    const [players, matches] = await Promise.all([
      getAllPlayers(),
      getRecentMatches(100), // Get more matches for better stats
    ]);
    
    const totalPlayers = players.length;
    const totalMatches = matches.length;
    const topScore = Math.max(...players.map(p => p.totalPoints || 0));
    
    // Calculate average points per match
    const totalPointsAwarded = players.reduce((sum, p) => sum + (p.totalPoints || 0), 0);
    const totalMatchesPlayed = players.reduce((sum, p) => sum + (p.gamesPlayed || 0), 0);
    const avgPointsPerMatch = totalMatchesPlayed > 0 ? totalPointsAwarded / totalMatchesPlayed : 0;
    
    const stats = {
      totalPlayers,
      totalMatches,
      topScore,
      avgPointsPerMatch: Math.round(avgPointsPerMatch * 10) / 10, // Round to 1 decimal
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