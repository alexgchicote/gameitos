import { NextRequest, NextResponse } from 'next/server';
import { createGame, getAvailableGames } from '@gameitos/db';

export async function GET() {
  try {
    const games = await getAvailableGames();
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching available games:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, gameTypeId } = body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Game name is required' },
        { status: 400 }
      );
    }
    
    if (!gameTypeId || typeof gameTypeId !== 'string' || gameTypeId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Game type ID is required' },
        { status: 400 }
      );
    }
    
    // Create new game with the provided game type
    const game = await createGame({
      name: name.trim(),
      gameTypeId: gameTypeId.trim(),
      description: `Added by user`,
      minPlayers: 2,
      maxPlayers: null,
      isActive: true,
    });
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create game' },
      { status: 500 }
    );
  }
}