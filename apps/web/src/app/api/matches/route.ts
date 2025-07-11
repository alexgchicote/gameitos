// apps/web/src/app/api/matches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMatch, getRecentMatches, completeMatch } from '@gameitos/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const matches = await getRecentMatches(limit);
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
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
        { error: 'Match results are required' },
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
    const match = await createMatch({
      gameId: gameId.trim(),
      matchName: matchName?.trim() || undefined,
      playerIds,
    });

    // Complete game match with results
    const completedMatch = await completeMatch({
      matchId: match.id,
      results: results.map(r => ({
        playerId: r.playerId,
        position: r.position,
      })),
    });

    return NextResponse.json(completedMatch, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create match' },
      { status: 500 }
    );
  }
}