import { NextResponse } from 'next/server';
import { getAvailableGames } from '@gameitos/db';

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