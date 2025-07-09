import { NextRequest, NextResponse } from 'next/server';
import { createGameMatch, getRecentGameMatches, completeGameMatch } from '@gameitos/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const games = await getRecentGameMatches(limit);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, matchName, results } = body;
    
    if (!gameId || typeof gameId !== 'string' || gameId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Game results are required' },
        { status: 400 }
      );
    }
    
    // Validate results format
    for (const result of results) {
      if (!result.playerId || typeof result.position !== 'number') {
        return NextResponse.json(
          { error: 'Invalid result format. Each result must have playerId and position' },
          { status: 400 }
        );
      }
    }
    
    const playerIds = results.map(r => r.playerId);
    
    // Create game match
    const gameMatch = await createGameMatch({
      gameId: gameId.trim(),
      matchName: matchName?.trim() || undefined,
      playerIds,
    });
    
    // Complete game match with results
    const completedGameMatch = await completeGameMatch({
      gameMatchId: gameMatch.id,
      results: results.map(r => ({
        playerId: r.playerId,
        position: r.position,
      })),
    });
    
    return NextResponse.json(completedGameMatch, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create game' },
      { status: 500 }
    );
  }
} 