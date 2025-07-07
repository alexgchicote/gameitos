import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PointDistributionPreviewProps {
  totalPlayers: number;
  pointDistribution: Array<{ position: number; points: number }>;
}

export function PointDistributionPreview({ totalPlayers, pointDistribution }: PointDistributionPreviewProps) {
  const getPositionBadgeVariant = (position: number) => {
    if (position === 1) return "gold";
    if (position === 2) return "silver";
    if (position === 3) return "bronze";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Point Distribution</CardTitle>
        <CardDescription>
          F1-style points for {totalPlayers} players
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {pointDistribution.map(({ position, points }) => (
            <div
              key={position}
              className="flex items-center justify-between p-2 rounded-lg border bg-card"
            >
              <Badge 
                variant={getPositionBadgeVariant(position)}
                className="text-xs min-w-0"
              >
                #{position}
              </Badge>
              <span className="font-mono text-sm font-semibold">
                {points}pt{points !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
        
        {totalPlayers > 10 && (
          <div className="mt-3 text-xs text-muted-foreground">
            Point system extends beyond F1's top 10 with diminishing returns for positions 11+
          </div>
        )}
      </CardContent>
    </Card>
  );
} 