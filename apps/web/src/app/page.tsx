"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Award, Plus, Users, Target, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// Mock data for demonstration (in real app, this would come from database)
const mockPlayers = [
  {
    id: "1",
    name: "Alex Chen",
    totalPoints: 247,
    gamesPlayed: 12,
    wins: 4,
    podiums: 8,
    winRate: 33.3,
    podiumRate: 66.7,
    averagePoints: 20.6,
    recentForm: [2, 1, 3, 1, 2],
  },
  {
    id: "2", 
    name: "Maria Rodriguez",
    totalPoints: 198,
    gamesPlayed: 10,
    wins: 2,
    podiums: 6,
    winRate: 20.0,
    podiumRate: 60.0,
    averagePoints: 19.8,
    recentForm: [3, 4, 2, 1, 3],
  },
  {
    id: "3",
    name: "Jordan Kim", 
    totalPoints: 156,
    gamesPlayed: 8,
    wins: 1,
    podiums: 4,
    winRate: 12.5,
    podiumRate: 50.0,
    averagePoints: 19.5,
    recentForm: [1, 5, 3, 2, 4],
  },
  {
    id: "4",
    name: "Sam Taylor",
    totalPoints: 134,
    gamesPlayed: 9,
    wins: 1,
    podiums: 3,
    winRate: 11.1,
    podiumRate: 33.3,
    averagePoints: 14.9,
    recentForm: [4, 3, 5, 4, 6],
  },
];

const pointDistribution = [
  { position: 1, points: 25 },
  { position: 2, points: 18 },
  { position: 3, points: 15 },
  { position: 4, points: 12 },
  { position: 5, points: 10 },
  { position: 6, points: 8 },
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

  return (
    <div className="min-h-screen bg-background">
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
                {mockPlayers.length} Players
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
                      <p className="text-2xl font-bold">{mockPlayers.length}</p>
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
                      <p className="text-2xl font-bold">15</p>
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
                      <p className="text-2xl font-bold">{mockPlayers[0]?.totalPoints || 0}</p>
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
                      <p className="text-2xl font-bold">16.2</p>
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
                    {mockPlayers.map((player, index) => {
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
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Game Form */}
            {activeTab === "add-game" && (
              <Card>
                <CardHeader>
                  <CardTitle>Record Game Results</CardTitle>
                  <CardDescription>
                    Add players in order of their finishing position (1st to last)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Game recording form would go here</p>
                    <p className="text-sm mt-2">Connect to database to enable functionality</p>
                  </div>
                </CardContent>
              </Card>
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
                    />
                  </div>
                  <Button className="w-full" disabled={!newPlayerName.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Player
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Point Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Point Distribution</CardTitle>
                <CardDescription>
                  F1-style points for 6 players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pointDistribution.map(({ position, points }) => (
                    <div
                      key={position}
                      className="flex items-center justify-between p-2 rounded-lg border bg-card"
                    >
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRankBadgeClass(position)}`}>
                        #{position}
                      </span>
                      <span className="font-mono text-sm font-semibold">
                        {points}pt{points !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  Dynamic point system scales with player count
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium">Friday Night Poker</div>
                    <div className="text-gray-600 dark:text-gray-400">Alex Chen won • 6 players</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Blackjack Tournament</div>
                    <div className="text-gray-600 dark:text-gray-400">Maria Rodriguez won • 4 players</div>
                    <div className="text-xs text-gray-500">1 day ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Texas Hold'em</div>
                    <div className="text-gray-600 dark:text-gray-400">Jordan Kim won • 5 players</div>
                    <div className="text-xs text-gray-500">3 days ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
