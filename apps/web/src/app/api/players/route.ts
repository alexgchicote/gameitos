import { NextRequest, NextResponse } from 'next/server';
import { createPlayer, getAllPlayers, searchPlayers } from '@gameitos/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    if (search) {
      const players = await searchPlayers(search);
      return NextResponse.json(players);
    }
    
    const players = await getAllPlayers();
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }
    
    const player = await createPlayer({ name: name.trim() });
    
    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 