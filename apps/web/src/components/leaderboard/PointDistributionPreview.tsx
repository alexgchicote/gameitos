import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PointDistributionPreviewProps {
  totalPlayers: number;
  pointDistribution: Array<{ position: number; points: number }>;
}

export function PointDistributionPreview({ totalPlayers, pointDistribution }: PointDistributionPreviewProps) {
  const getPositionBadgeVariant = (position: number, points: number) => {
    if (points > 0) {
      if (position === 1) return "gold";
      if (position === 2) return "silver";
      if (position === 3) return "bronze";
      return "default";
    } else if (points < 0) {
      return "destructive";
    }
    return "secondary"; // For 0 points
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Point Distribution</CardTitle>
        <CardDescription>
          Fibonacci-based distribution for {totalPlayers} players
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pointDistribution.length <= 8 ? (
            // Grid layout for smaller groups
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {pointDistribution.map(({ position, points }) => (
                <div
                  key={position}
                  className="flex items-center justify-between p-2 rounded-lg border bg-card"
                >
                  <Badge 
                    variant={getPositionBadgeVariant(position, points)}
                    className="text-xs min-w-0"
                  >
                    #{position}
                  </Badge>
                  <span className={`font-mono text-sm font-semibold ${
                    points > 0 ? 'text-green-600 dark:text-green-400' : 
                    points < 0 ? 'text-red-600 dark:text-red-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {points > 0 ? '+' : ''}{points}pt{Math.abs(points) !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            // List layout for larger groups
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {pointDistribution.map(({ position, points }) => (
                <div
                  key={position}
                  className="flex items-center justify-between p-2 rounded-lg border bg-card"
                >
                  <Badge 
                    variant={getPositionBadgeVariant(position, points)}
                    className="text-xs min-w-0"
                  >
                    #{position}
                  </Badge>
                  <span className={`font-mono text-sm font-semibold ${
                    points > 0 ? 'text-green-600 dark:text-green-400' : 
                    points < 0 ? 'text-red-600 dark:text-red-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {points > 0 ? '+' : ''}{points}pt{Math.abs(points) !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {totalPlayers > 1 && (
          <div className="mt-3 text-xs text-muted-foreground">
            {totalPlayers % 2 === 1 
              ? `Middle player (position ${Math.ceil(totalPlayers / 2)}) gets 0 points` 
              : `Middle players get small +/- points`
                         } • Fibonacci sequence mirrored around the true middle position
          </div>
        )}
      </CardContent>
    </Card>
  );
} 