import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@gameitos/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const gameType = searchParams.get('gameType') || undefined;
    const minGames = searchParams.get('minGames') ? parseInt(searchParams.get('minGames')!) : undefined;
    
    const leaderboard = await getLeaderboard(limit, {
      gameType,
      minGames,
    });
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
} 