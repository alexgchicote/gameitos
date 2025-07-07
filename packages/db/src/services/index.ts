// Point calculation system inspired by F1
export function calculatePointsForPosition(position: number, totalPlayers: number): number {
  // Ensure we have valid inputs
  if (position < 1 || position > totalPlayers || totalPlayers < 1) {
    return 0;
  }

  // Base point system inspired by F1 but scaled for any number of players
  const pointDistribution = generatePointDistribution(totalPlayers);
  return pointDistribution[position - 1] || 0;
}

function generatePointDistribution(totalPlayers: number): number[] {
  if (totalPlayers <= 0) return [];
  
  // F1-inspired base points for top positions
  const basePoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  
  if (totalPlayers <= 10) {
    // For 10 or fewer players, use F1 system directly
    return basePoints.slice(0, totalPlayers);
  }
  
  // For more than 10 players, extend the system
  const points: number[] = [...basePoints];
  
  // Add diminishing points for positions 11+
  for (let i = 11; i <= totalPlayers; i++) {
    // Gradually decrease points, ensuring last place gets at least 1 point
    const remainingPositions = totalPlayers - 10;
    const positionFromEleven = i - 10;
    const pointValue = Math.max(1, Math.ceil((remainingPositions - positionFromEleven + 1) * 0.5));
    points.push(pointValue);
  }
  
  return points;
}

// Utility to get point distribution preview
export function getPointDistributionPreview(totalPlayers: number): Array<{position: number, points: number}> {
  const distribution = generatePointDistribution(totalPlayers);
  return distribution.map((points, index) => ({
    position: index + 1,
    points
  }));
} 