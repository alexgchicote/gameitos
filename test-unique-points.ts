// Test to verify unique incremental point distribution
function testUniquePointDistribution() {
  console.log('Unique Incremental Point Distribution Test');
  console.log('=========================================');
  
  // Test cases for different numbers of players
  const testCases = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];
  
  testCases.forEach(totalPlayers => {
    console.log(`\n--- ${totalPlayers} Players ---`);
    
    // Calculate base points for first place
    const basePoints = Math.max(10, Math.floor(totalPlayers * 2.5));
    
    // Generate unique incremental values
    const points: number[] = [];
    
    if (totalPlayers % 2 === 1) {
      // Odd number of players: middle player gets exactly 0
      const middleIndex = Math.floor(totalPlayers / 2);
      const halfPlayers = middleIndex;
      
      // Generate positive half (decreasing from max to 1)
      const positiveHalf: number[] = [];
      for (let i = 0; i < halfPlayers; i++) {
        // Create exponential curve that's heavier on the tails
        const normalizedPosition = i / (halfPlayers - 1 || 1); // 0 to 1, avoid division by zero
        const exponentialFactor = Math.pow(1 - normalizedPosition, 2.5);
        let pointValue = Math.round(basePoints * exponentialFactor);
        
        // Ensure minimum increment of 1 between positions
        if (i > 0 && pointValue >= positiveHalf[i - 1]) {
          pointValue = positiveHalf[i - 1] - 1;
        }
        
        // Ensure we don't go below 1 for positive half
        pointValue = Math.max(pointValue, 1);
        positiveHalf.push(pointValue);
      }
      
      // Build the complete array: positive half + middle (0) + negative half
      points.push(...positiveHalf);
      points.push(0); // Middle position
      points.push(...positiveHalf.map(p => -p).reverse());
      
    } else {
      // Even number of players: two middle players get small +/- values
      const halfPlayers = totalPlayers / 2;
      
      // Generate positive half
      const positiveHalf: number[] = [];
      for (let i = 0; i < halfPlayers; i++) {
        if (i === halfPlayers - 1) {
          // Middle position gets smallest positive value
          positiveHalf.push(1);
        } else {
          // Create exponential curve
          const normalizedPosition = i / (halfPlayers - 1); // 0 to 1
          const exponentialFactor = Math.pow(1 - normalizedPosition, 2.5);
          let pointValue = Math.round(basePoints * exponentialFactor);
          
          // Ensure minimum increment of 1 between positions
          if (i > 0 && pointValue >= positiveHalf[i - 1]) {
            pointValue = positiveHalf[i - 1] - 1;
          }
          
          // Ensure we don't go too low
          const minValue = halfPlayers - i;
          pointValue = Math.max(pointValue, minValue);
          positiveHalf.push(pointValue);
        }
      }
      
      // Build the complete array: positive half + negative half
      points.push(...positiveHalf);
      points.push(...positiveHalf.map(p => -p).reverse());
    }
    
    // Verify uniqueness and fix any duplicates
    for (let i = 1; i < points.length; i++) {
      if (points[i] >= points[i - 1]) {
        points[i] = points[i - 1] - 1;
      }
    }
    
    // Display distribution
    points.forEach((pts, idx) => {
      const pos = idx + 1;
      console.log(`Position ${pos}: ${pts > 0 ? '+' : ''}${pts} points`);
    });
    
    // Validate uniqueness
    const uniqueValues = new Set(points);
    const hasUniqueValues = uniqueValues.size === points.length;
    console.log(`  ✅ All values unique: ${hasUniqueValues}`);
    
    // Validate decreasing order
    let isDecreasing = true;
    for (let i = 1; i < points.length; i++) {
      if (points[i] >= points[i - 1]) {
        isDecreasing = false;
        break;
      }
    }
    console.log(`  ✅ Decreasing order: ${isDecreasing}`);
    
    // Show the jumps between positions
    console.log('  Jumps between positions:');
    for (let i = 0; i < points.length - 1; i++) {
      const jump = points[i] - points[i + 1];
      console.log(`    ${i + 1}-${i + 2}: ${jump > 0 ? '+' : ''}${jump} points`);
    }
    
    const totalPoints = points.reduce((sum, pts) => sum + pts, 0);
    console.log(`  Total: ${totalPoints} (should be 0)`);
    
    if (!hasUniqueValues || !isDecreasing) {
      console.log('  ❌ FAILED: Not all values are unique or not in decreasing order');
    }
  });
}

testUniquePointDistribution(); 