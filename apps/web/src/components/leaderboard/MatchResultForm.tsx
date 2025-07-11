"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Using native select for now
import { Plus, X, Trophy, Medal, Award } from "lucide-react";

type Player = {
  id: string;
  name: string;
};

type MatchResult = {
  playerId: string;
  position: number;
};

type AvailableGame = {
  id: string;
  name: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number;
};

type GameType = {
  id: string;
  name: string;
  description?: string;
};

interface MatchResultFormProps {
  players: Player[];
  onSubmit: (gameId: string, matchName: string | undefined, results: MatchResult[], newGameName?: string, newGameTypeId?: string) => void;
  onPointPreview: (totalPlayers: number) => void;
  isSubmitting?: boolean;
}

const getPositionIcon = (position: number) => {
  if (position === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (position === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (position === 3) return <Award className="h-4 w-4 text-orange-500" />;
  return <span className="text-sm font-mono">#{position}</span>;
};

export function MatchResultForm({ players, onSubmit, onPointPreview, isSubmitting = false }: MatchResultFormProps) {
  const [selectedGameId, setSelectedGameId] = useState("");
  const [matchName, setMatchName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [availableGames, setAvailableGames] = useState<AvailableGame[]>([]);
  const [availableGameTypes, setAvailableGameTypes] = useState<GameType[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingGameTypes, setIsLoadingGameTypes] = useState(true);
  const [isCreatingNewGame, setIsCreatingNewGame] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [selectedGameTypeId, setSelectedGameTypeId] = useState("");
  const [isCreatingNewGameType, setIsCreatingNewGameType] = useState(false);
  const [newGameTypeName, setNewGameTypeName] = useState("");

  // Fetch available games and game types on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesResponse, gameTypesResponse] = await Promise.all([
          fetch('/api/games/available'),
          fetch('/api/game-types')
        ]);
        
        if (gamesResponse.ok) {
          const games = await gamesResponse.json();
          setAvailableGames(games);
        }
        
        if (gameTypesResponse.ok) {
          const gameTypes = await gameTypesResponse.json();
          setAvailableGameTypes(gameTypes);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoadingGames(false);
        setIsLoadingGameTypes(false);
      }
    };

    fetchData();
  }, []);

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

  const handleSubmit = async () => {
    if (isCreatingNewGame) {
      if (newGameName.trim() && selectedPlayers.length >= 2) {
        let gameTypeId = selectedGameTypeId;
        
        // If creating a new game type, create it first
        if (isCreatingNewGameType && newGameTypeName.trim()) {
          try {
            const response = await fetch('/api/game-types', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: newGameTypeName.trim() })
            });
            
            if (response.ok) {
              const newGameType = await response.json();
              gameTypeId = newGameType.id;
            } else {
              console.error('Failed to create game type');
              return;
            }
          } catch (error) {
            console.error('Error creating game type:', error);
            return;
          }
        }
        
        onSubmit("CREATE_NEW", matchName.trim() || undefined, results, newGameName.trim(), gameTypeId);
      }
    } else if (selectedGameId && selectedPlayers.length >= 2) {
      onSubmit(selectedGameId, matchName.trim() || undefined, results);
    }
  };

  const canSubmit = (isCreatingNewGame 
    ? (newGameName.trim() && (selectedGameTypeId || (isCreatingNewGameType && newGameTypeName.trim())))
    : selectedGameId.trim()) && selectedPlayers.length >= 2 && !isSubmitting;

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
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Game *</label>
            {isLoadingGames ? (
              <div className="text-sm text-muted-foreground">Loading games...</div>
            ) : (
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={isCreatingNewGame ? "CREATE_NEW" : selectedGameId}
                onChange={(e) => {
                  if (e.target.value === "CREATE_NEW") {
                    setIsCreatingNewGame(true);
                    setSelectedGameId("");
                  } else {
                    setIsCreatingNewGame(false);
                    setSelectedGameId(e.target.value);
                    setNewGameName("");
                    setSelectedGameTypeId("");
                    setIsCreatingNewGameType(false);
                    setNewGameTypeName("");
                  }
                }}
              >
                <option value="">Select a game...</option>
                <option value="CREATE_NEW">+ Add New Game</option>
                {availableGames.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name} {game.description && `- ${game.description}`}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {isCreatingNewGame && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">New Game Name *</label>
                <Input
                  placeholder="Enter game name (e.g., Monopoly, Risk, etc.)"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                {isLoadingGameTypes ? (
                  <div className="text-sm text-muted-foreground">Loading categories...</div>
                ) : (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={isCreatingNewGameType ? "CREATE_NEW" : selectedGameTypeId}
                    onChange={(e) => {
                      if (e.target.value === "CREATE_NEW") {
                        setIsCreatingNewGameType(true);
                        setSelectedGameTypeId("");
                      } else {
                        setIsCreatingNewGameType(false);
                        setSelectedGameTypeId(e.target.value);
                        setNewGameTypeName("");
                      }
                    }}
                  >
                    <option value="">Select a category...</option>
                    <option value="CREATE_NEW">+ Add New Category</option>
                    {availableGameTypes.map((gameType) => (
                      <option key={gameType.id} value={gameType.id}>
                        {gameType.name} {gameType.description && `- ${gameType.description}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {isCreatingNewGameType && (
                <div>
                  <label className="text-sm font-medium mb-2 block">New Category Name *</label>
                  <Input
                    placeholder="Enter category name (e.g., Cards, Board Games, etc.)"
                    value={newGameTypeName}
                    onChange={(e) => setNewGameTypeName(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}
          
          <div>
            <label className="text-sm font-medium mb-2 block">Match Name</label>
            <Input
              placeholder="Optional match name"
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
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