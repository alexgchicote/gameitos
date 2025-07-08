// Point calculation system with symmetric distribution around median
export function calculatePointsForPosition(position: number, totalPlayers: number): number {
  // Ensure we have valid inputs
  if (position < 1 || position > totalPlayers || totalPlayers < 1) {
    return 0;
  }

  // Generate symmetric point distribution
  const pointDistribution = generateSymmetricPointDistribution(totalPlayers);
  return pointDistribution[position - 1] || 0;
}

// Calculate position from median (distance from median position)
export function calculatePositionFromMedian(position: number, totalPlayers: number): number {
  // Position from median should match the Fibonacci point values exactly
  // since the Fibonacci sequence represents the distance from median in the correct direction
  return calculatePointsForPosition(position, totalPlayers);
}

function generateSymmetricPointDistribution(totalPlayers: number): number[] {
  if (totalPlayers <= 0) return [];
  
  // For 1 player, they get 0 points (they're the median)
  if (totalPlayers === 1) return [0];
  
  // Generate adjusted Fibonacci sequence (skip first consecutive 1)
  // Standard Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...
  // Adjusted Fibonacci: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...
  const generateAdjustedFibonacci = (count: number): number[] => {
    if (count <= 0) return [];
    if (count === 1) return [1];
    
    const fib = [1, 2]; // Start with 1, 2 instead of 1, 1
    
    for (let i = 2; i < count; i++) {
      fib.push(fib[i - 1] + fib[i - 2]);
    }
    
    return fib;
  };
  
  const points: number[] = [];
  
      if (totalPlayers % 2 === 1) {
      // Odd number of players: middle player gets exactly 0 (true middle)
      const middleIndex = Math.floor(totalPlayers / 2);
      const halfPlayers = middleIndex;
      
      if (halfPlayers === 0) {
        // Only 1 player
        points.push(0);
      } else {
        // Generate Fibonacci sequence for the half
        const fibSequence = generateAdjustedFibonacci(halfPlayers);
        
        // Build the complete array: positive half + middle (0) + negative half
        // Fibonacci increases as you move away from middle
        const positiveFib = [...fibSequence].reverse(); // First position gets highest Fibonacci value
        const negativeFib = [...fibSequence].map(f => -f); // Mirror: closest to middle gets smallest negative values
        
        points.push(...positiveFib); // Positive half
        points.push(0); // Middle position
        points.push(...negativeFib); // Negative half (already in correct order: -1, -2, -3, -5, etc.)
      }
      
    } else {
      // Even number of players: invisible "true middle" between two middle players
      const halfPlayers = totalPlayers / 2;
      
      if (halfPlayers === 1) {
        // Only 2 players
        points.push(1, -1);
      } else {
        // Generate Fibonacci sequence for the half
        const fibSequence = generateAdjustedFibonacci(halfPlayers);
        
        // Build the complete array: positive half + negative half
        const positiveFib = [...fibSequence].reverse(); // First position gets highest Fibonacci value
        const negativeFib = [...fibSequence].map(f => -f); // Mirror: closest to middle gets smallest negative values
        
        points.push(...positiveFib); // Positive half
        points.push(...negativeFib); // Negative half
      }
    }
  
  return points;
}

// Utility to get point distribution preview
export function getPointDistributionPreview(totalPlayers: number): Array<{position: number, points: number, positionFromMedian: number}> {
  const distribution = generateSymmetricPointDistribution(totalPlayers);
  return distribution.map((points, index) => ({
    position: index + 1,
    points,
    positionFromMedian: calculatePositionFromMedian(index + 1, totalPlayers)
  }));
} 