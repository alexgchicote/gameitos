"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Award, Plus, Users, Target, TrendingUp, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { GameResultForm } from "@/components/leaderboard/GameResultForm";
import { PointDistributionPreview } from "@/components/leaderboard/PointDistributionPreview";

// Types
type Player = {
  id: string;
  name: string;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  podiums: number;
  winRate: number;
  podiumRate: number;
  averagePoints: number;
  recentForm: number[];
};

type GameResult = {
  playerId: string;
  position: number;
};

type Stats = {
  totalPlayers: number;
  totalGames: number;
  topScore: number;
  avgPointsPerGame: number;
};

type Game = {
  id: string;
  name: string;
  gameType: string | null;
  totalPlayers: number;
  completedAt: string | null;
};

// Default point distribution for preview (Fibonacci-based system)
const defaultPointDistribution = [
  { position: 1, points: 5 },
  { position: 2, points: 3 },
  { position: 3, points: 2 },
  { position: 4, points: 1 },
  { position: 5, points: -1 },
  { position: 6, points: -2 },
  { position: 7, points: -3 },
  { position: 8, points: -5 },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
  if (rank === 3) return <Award className="h-6 w-6 text-orange-500" />;
  return <span className="h-6 w-6 flex items-center justify-center text-lg font-bold text-muted-foreground">#{rank}</span>;
};

const getRankBadgeClass = (rank: number) => {
  if (rank === 1) return "bg-yellow-400 text-yellow-900";
  if (rank === 2) return "bg-gray-300 text-gray-800";
  if (rank === 3) return "bg-orange-400 text-orange-900";
  return "bg-gray-100 text-gray-800";
};

const getFormTrend = (recentForm: number[]) => {
  if (recentForm.length < 2) return "neutral";
  const recent = recentForm.slice(0, 3);
  const older = recentForm.slice(3);
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgOlder = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : avgRecent;
  
  if (avgRecent < avgOlder) return "up";
  if (avgRecent > avgOlder) return "down";
  return "neutral";
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "add-game" | "add-player">("leaderboard");
  const [newPlayerName, setNewPlayerName] = useState("");
  
  // State for data
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPlayers: 0, totalGames: 0, topScore: 0, avgPointsPerGame: 0 });
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [pointDistribution, setPointDistribution] = useState(defaultPointDistribution);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [playersRes, statsRes, gamesRes] = await Promise.all([
        fetch('/api/leaderboard'),
        fetch('/api/stats'),
        fetch('/api/games?limit=5')
      ]);
      
      if (!playersRes.ok || !statsRes.ok || !gamesRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const [playersData, statsData, gamesData] = await Promise.all([
        playersRes.json(),
        statsRes.json(),
        gamesRes.json()
      ]);
      
      setPlayers(playersData);
      setStats(statsData);
      setRecentGames(gamesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add player
  const addPlayer = async () => {
    if (!newPlayerName.trim()) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlayerName.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add player');
      }
      
      setNewPlayerName("");
      await fetchData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add player');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Record game
  const recordGame = async (gameName: string, gameType: string, results: GameResult[]) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gameName,
          gameType,
          results
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record game');
      }
      
      await fetchData(); // Refresh data
      setActiveTab("leaderboard"); // Switch to leaderboard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record game');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update point distribution preview with symmetric system
  const updatePointDistribution = (totalPlayers: number) => {
    if (totalPlayers > 0) {
      const newDistribution = generateSymmetricPointDistribution(totalPlayers);
      setPointDistribution(newDistribution);
    }
  };
  
  // Generate symmetric point distribution (matches backend logic)
  const generateSymmetricPointDistribution = (totalPlayers: number) => {
    if (totalPlayers <= 0) return [];
    
    // For 1 player, they get 0 points (they're the median)
    if (totalPlayers === 1) return [{ position: 1, points: 0 }];
    
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
        const positiveFib = [...fibSequence].reverse(); // First position gets highest Fibonacci value
        const negativeFib = [...fibSequence].map(f => -f); // Mirror: closest to middle gets smallest negative values
        
        points.push(...positiveFib); // Positive half
        points.push(0); // Middle position
        points.push(...negativeFib); // Negative half
      }
      
    } else {
      // Even number of players: invisible "true middle" between two middle players
      // Two middle players get +1 and -1
      const halfPlayers = totalPlayers / 2;
      
      if (halfPlayers === 1) {
        // Only 2 players
        points.push(1, -1);
      } else {
        // Generate Fibonacci sequence for the half
        const fibSequence = generateAdjustedFibonacci(halfPlayers);
        
        // Ensure the innermost values are 1 and -1
        fibSequence[fibSequence.length - 1] = 1;
        
        // Build the complete array: positive half + negative half
        const positiveFib = [...fibSequence].reverse(); // First position gets highest Fibonacci value
        const negativeFib = [...fibSequence].map(f => -f); // Mirror: closest to middle gets smallest negative values
        
        points.push(...positiveFib); // Positive half
        points.push(...negativeFib); // Negative half
      }
    }
    
    return points.map((pts, index) => ({
      position: index + 1,
      points: pts
    }));
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                fetchData();
              }}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-background border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-foreground">
                Gameitos
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {stats.totalPlayers} Players
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="bg-background border-b md:hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
              activeTab === "leaderboard"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("add-game")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
              activeTab === "add-game"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <Target className="h-4 w-4" />
            Add Game
          </button>
          <button
            onClick={() => setActiveTab("add-player")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
              activeTab === "add-player"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Add Player
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Players</p>
                      <p className="text-2xl font-bold">{stats.totalPlayers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Games</p>
                      <p className="text-2xl font-bold">{stats.totalGames}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Top Score</p>
                      <p className="text-2xl font-bold">{stats.topScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg/Game</p>
                      <p className="text-2xl font-bold">{stats.avgPointsPerGame}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard */}
            {activeTab === "leaderboard" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Current Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Rankings based on total points earned across all games
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2 p-6 pt-0">
                    {players.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No players yet!</p>
                        <p className="text-sm mt-2">Add some players to get started</p>
                      </div>
                    ) : (
                      players.map((player: Player, index: number) => {
                        const rank = index + 1;
                        const formTrend = getFormTrend(player.recentForm);
                        
                        return (
                          <div
                            key={player.id}
                            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            {/* Rank Icon */}
                            <div className="flex-shrink-0">
                              {getRankIcon(rank)}
                            </div>

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg truncate">{player.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRankBadgeClass(rank)}`}>
                                  #{rank}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-mono font-bold text-foreground">{player.totalPoints} pts</span>
                                <span>{player.gamesPlayed} games</span>
                                <span>{player.wins}W</span>
                                <span className="flex items-center gap-1">
                                  {formTrend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                                  {formTrend === "down" && <div className="h-3 w-3 text-red-500 transform rotate-180"><TrendingUp /></div>}
                                  <span className="hidden sm:inline">Form</span>
                                </span>
                              </div>
                            </div>

                            {/* Stats Panel (Desktop) */}
                            <div className="hidden md:flex flex-col items-end text-sm">
                              <div className="text-right">
                                <div className="font-mono text-foreground">{player.averagePoints.toFixed(1)} avg</div>
                                <div className="text-gray-600 dark:text-gray-400">{player.winRate.toFixed(0)}% win rate</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Game Form */}
            {activeTab === "add-game" && (
              <GameResultForm
                players={players}
                onSubmit={recordGame}
                onPointPreview={updatePointDistribution}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Add Player Form */}
            {activeTab === "add-player" && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Player</CardTitle>
                  <CardDescription>
                    Add a new player to the leaderboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Player Name</label>
                    <Input
                      placeholder="Enter player name"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    disabled={!newPlayerName.trim() || isSubmitting}
                    onClick={addPlayer}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Player
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Point Distribution */}
            <PointDistributionPreview 
              totalPlayers={pointDistribution.length} 
              pointDistribution={pointDistribution} 
            />

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentGames.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No games recorded yet</p>
                    </div>
                  ) : (
                    recentGames.map((game) => (
                      <div key={game.id} className="text-sm">
                        <div className="font-medium">{game.name}</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {game.gameType && `${game.gameType} • `}{game.totalPlayers} players
                        </div>
                        <div className="text-xs text-gray-500">
                          {game.completedAt ? new Date(game.completedAt).toLocaleDateString() : 'Recently completed'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
