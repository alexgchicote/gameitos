import { NextRequest, NextResponse } from 'next/server';
import { getAllGameTypes, createGameType } from '@gameitos/db';

export async function GET() {
  try {
    const gameTypes = await getAllGameTypes();
    return NextResponse.json(gameTypes);
  } catch (error) {
    console.error('Error fetching game types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Game type name is required' },
        { status: 400 }
      );
    }
    
    const gameType = await createGameType({
      name: name.trim(),
      description: description?.trim() || undefined,
    });
    
    return NextResponse.json(gameType, { status: 201 });
  } catch (error) {
    console.error('Error creating game type:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create game type' },
      { status: 500 }
    );
  }
} 