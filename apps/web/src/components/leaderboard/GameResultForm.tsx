"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trophy, Medal, Award } from "lucide-react";

type Player = {
  id: string;
  name: string;
};

type GameResult = {
  playerId: string;
  position: number;
};

interface GameResultFormProps {
  players: Player[];
  onSubmit: (gameName: string, gameType: string, results: GameResult[]) => void;
  onPointPreview: (totalPlayers: number) => void;
  isSubmitting?: boolean;
}

const getPositionIcon = (position: number) => {
  if (position === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (position === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (position === 3) return <Award className="h-4 w-4 text-orange-500" />;
  return <span className="text-sm font-mono">#{position}</span>;
};

export function GameResultForm({ players, onSubmit, onPointPreview, isSubmitting = false }: GameResultFormProps) {
  const [gameName, setGameName] = useState("");
  const [gameType, setGameType] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);

  const addPlayer = (playerId: string) => {
    if (!selectedPlayers.includes(playerId)) {
      const newPosition = selectedPlayers.length + 1;
      setSelectedPlayers([...selectedPlayers, playerId]);
      setResults([...results, { playerId, position: newPosition }]);
      onPointPreview(selectedPlayers.length + 1);
    }
  };

  const removePlayer = (playerId: string) => {
    const newSelectedPlayers = selectedPlayers.filter(id => id !== playerId);
    setSelectedPlayers(newSelectedPlayers);
    
    // Recalculate positions
    const newResults = newSelectedPlayers.map((id, index) => ({
      playerId: id,
      position: index + 1
    }));
    setResults(newResults);
    onPointPreview(newSelectedPlayers.length);
  };

  const movePlayerUp = (playerId: string) => {
    const currentIndex = selectedPlayers.indexOf(playerId);
    if (currentIndex > 0) {
      const newPlayers = [...selectedPlayers];
      [newPlayers[currentIndex], newPlayers[currentIndex - 1]] = 
        [newPlayers[currentIndex - 1], newPlayers[currentIndex]];
      
      setSelectedPlayers(newPlayers);
      const newResults = newPlayers.map((id, index) => ({
        playerId: id,
        position: index + 1
      }));
      setResults(newResults);
    }
  };

  const movePlayerDown = (playerId: string) => {
    const currentIndex = selectedPlayers.indexOf(playerId);
    if (currentIndex < selectedPlayers.length - 1) {
      const newPlayers = [...selectedPlayers];
      [newPlayers[currentIndex], newPlayers[currentIndex + 1]] = 
        [newPlayers[currentIndex + 1], newPlayers[currentIndex]];
      
      setSelectedPlayers(newPlayers);
      const newResults = newPlayers.map((id, index) => ({
        playerId: id,
        position: index + 1
      }));
      setResults(newResults);
    }
  };

  const handleSubmit = () => {
    if (gameName && selectedPlayers.length >= 2) {
      onSubmit(gameName, gameType, results);
    }
  };

  const canSubmit = gameName.trim() && selectedPlayers.length >= 2 && !isSubmitting;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Record Game Results</CardTitle>
        <CardDescription>
          Add players in order of their finishing position (1st to last)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Game Name *</label>
            <Input
              placeholder="Friday Night Poker"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Game Type</label>
            <Input
              placeholder="poker, blackjack, etc."
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
            />
          </div>
        </div>

        {/* Selected Players (Results Order) */}
        {selectedPlayers.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Final Rankings</label>
            <div className="space-y-2">
              {selectedPlayers.map((playerId, index) => {
                const player = players.find(p => p.id === playerId);
                const position = index + 1;
                
                return (
                  <div
                    key={playerId}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3">
                      {getPositionIcon(position)}
                      <span className="font-medium">{player?.name}</span>
                      <Badge variant={position <= 3 ? "secondary" : "outline"}>
                        {position === 1 ? "Winner" : `${position}${position === 2 ? "nd" : position === 3 ? "rd" : "th"} Place`}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => movePlayerUp(playerId)}
                        disabled={index === 0}
                        className="h-8 w-8 p-0"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => movePlayerDown(playerId)}
                        disabled={index === selectedPlayers.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(playerId)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Players */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Add Players {selectedPlayers.length > 0 && `(${selectedPlayers.length} selected)`}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {players
              .filter(player => !selectedPlayers.includes(player.id))
              .map(player => (
                <Button
                  key={player.id}
                  variant="outline"
                  onClick={() => addPlayer(player.id)}
                  className="justify-start h-auto p-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {player.name}
                </Button>
              ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Recording Game..." : "Record Game Results"}
          </Button>
          
          {selectedPlayers.length > 0 && selectedPlayers.length < 2 && (
            <p className="text-sm text-muted-foreground mt-2">
              Add at least 2 players to record a game
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 