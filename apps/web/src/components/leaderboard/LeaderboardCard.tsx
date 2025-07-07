import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";

type LeaderboardPlayer = {
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

interface LeaderboardCardProps {
  player: LeaderboardPlayer;
  rank: number;
  showStats?: boolean;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
  if (rank === 3) return <Award className="h-6 w-6 text-orange-500" />;
  return <span className="h-6 w-6 flex items-center justify-center text-lg font-bold text-muted-foreground">#{rank}</span>;
};

const getRankBadgeVariant = (rank: number) => {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "secondary";
};

const getFormIcon = (positions: number[]) => {
  if (positions.length < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;
  
  const recent = positions.slice(0, 3);
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const older = positions.slice(3);
  const avgOlder = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : avgRecent;
  
  if (avgRecent < avgOlder) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (avgRecent > avgOlder) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export function LeaderboardCard({ player, rank, showStats = true }: LeaderboardCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank Icon */}
          <div className="flex-shrink-0">
            {getRankIcon(rank)}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{player.name}</h3>
              <Badge variant={getRankBadgeVariant(rank)} className="text-xs">
                #{rank}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono font-bold text-foreground">{player.totalPoints} pts</span>
              <span>{player.gamesPlayed} games</span>
              {showStats && (
                <>
                  <span>{player.wins}W</span>
                  <span className="flex items-center gap-1">
                    {getFormIcon(player.recentForm)}
                    <span className="hidden sm:inline">Form</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stats Panel (Desktop) */}
          {showStats && (
            <div className="hidden md:flex flex-col items-end text-sm">
              <div className="text-right">
                <div className="font-mono text-foreground">{player.averagePoints.toFixed(1)} avg</div>
                <div className="text-muted-foreground">{player.winRate.toFixed(0)}% win rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Stats Row */}
        {showStats && (
          <div className="md:hidden mt-3 pt-3 border-t flex justify-between text-sm">
            <div className="text-center">
              <div className="font-mono text-foreground">{player.averagePoints.toFixed(1)}</div>
              <div className="text-muted-foreground">Avg</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-foreground">{player.winRate.toFixed(0)}%</div>
              <div className="text-muted-foreground">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-foreground">{player.podiumRate.toFixed(0)}%</div>
              <div className="text-muted-foreground">Podiums</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {getFormIcon(player.recentForm)}
              </div>
              <div className="text-muted-foreground">Form</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 