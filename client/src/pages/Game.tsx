import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GameEngine } from "@/lib/gameEngine";
import { AudioManager } from "@/lib/audioManager";
import { ChartLoader } from "@/lib/chartLoader";
import { toast } from "sonner";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [, setLocation] = useLocation();
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [health, setHealth] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine
    const engine = new GameEngine(canvasRef.current, {
      onScoreUpdate: setScore,
      onComboUpdate: setCombo,
      onHealthUpdate: setHealth,
      onGameOver: () => {
        setIsGameOver(true);
        setIsPlaying(false);
      }
    });

    gameEngineRef.current = engine;

    // Load audio and chart
    const loadAudioAndChart = async () => {
      try {
        // Load audio
        const audioManager = new AudioManager();
        await audioManager.loadAudio('/audio/NocturnalHunger.mp3');
        
        // Load chart
        const chartData = await ChartLoader.loadFromURL('/charts/NocturnalHunger.json');
        
        // Set audio and chart to game engine
        engine.setAudioAndChart(audioManager, chartData);
        
        toast.success('Audio and chart loaded!');
      } catch (error) {
        console.error('Failed to load audio/chart:', error);
        toast.error('Failed to load audio or chart');
      }
    };

    loadAudioAndChart();

    return () => {
      engine.destroy();
    };
  }, []);

  const handleStart = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
      setIsPlaying(true);
      setIsGameOver(false);
      setScore(0);
      setCombo(0);
      setHealth(3);
    }
  };

  const handlePause = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleResume = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resume();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top UI Bar */}
      <div className="flex justify-between items-center p-4 bg-card border-b-2 border-border">
        <Button
          onClick={() => setLocation("/")}
          className="pixel-button bg-secondary text-secondary-foreground text-xs"
          size="sm"
        >
          BACK
        </Button>

        <div className="flex gap-8 items-center text-sm">
          {/* Score */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground">SCORE</div>
            <div className="text-xl glow-gold font-bold">{score.toLocaleString()}</div>
          </div>

          {/* Combo */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground">COMBO</div>
            <div className="text-xl glow-purple font-bold">{combo}x</div>
          </div>

          {/* Health */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground">HEALTH</div>
            <div className="text-xl glow-red font-bold flex gap-1">
              {[...Array(health)].map((_, i) => (
                <span key={i}>❤️</span>
              ))}
              {[...Array(Math.max(0, 3 - health))].map((_, i) => (
                <span key={i} className="opacity-30">🖤</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isPlaying && !isGameOver && (
            <Button
              onClick={handleStart}
              className="pixel-button bg-primary text-primary-foreground text-xs"
              size="sm"
            >
              START
            </Button>
          )}
          {isPlaying && (
            <Button
              onClick={handlePause}
              className="pixel-button bg-accent text-accent-foreground text-xs"
              size="sm"
            >
              PAUSE
            </Button>
          )}
          {!isPlaying && !isGameOver && score > 0 && (
            <Button
              onClick={handleResume}
              className="pixel-button bg-primary text-primary-foreground text-xs"
              size="sm"
            >
              RESUME
            </Button>
          )}
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-4 border-border rounded-lg shadow-2xl"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90">
            <div className="text-center space-y-6 p-8 bg-card border-4 border-border rounded-lg">
              <h2 className="text-4xl glow-red" style={{ fontFamily: 'Creepster, cursive' }}>
                GAME OVER
              </h2>
              <div className="space-y-2">
                <p className="text-xl">Final Score: <span className="glow-gold">{score.toLocaleString()}</span></p>
                <p className="text-lg">Max Combo: <span className="glow-purple">{combo}x</span></p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleStart}
                  className="pixel-button bg-primary text-primary-foreground"
                >
                  RETRY
                </Button>
                <Button
                  onClick={() => setLocation("/")}
                  className="pixel-button bg-secondary text-secondary-foreground"
                >
                  MENU
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Start Prompt */}
        {!isPlaying && !isGameOver && score === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center space-y-4">
              <p className="text-xl animate-pulse">Press START to begin</p>
              <p className="text-sm text-muted-foreground">Slash the vampires and bats!</p>
              <p className="text-sm text-muted-foreground">Avoid the bombs!</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-card border-t-2 border-border text-center text-xs text-muted-foreground">
        <p>Click or touch to slash enemies • Avoid bombs • Keep your combo going!</p>
      </div>
    </div>
  );
}
