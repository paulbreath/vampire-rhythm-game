import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { progressManager, STAGES, DIFFICULTY_CONFIGS, type DifficultyLevel, type PlayerProgress } from "@/lib/progressManager";
import { PlayerCard } from "@/components/PlayerCard";

export default function Stages() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('normal');

  useEffect(() => {
    const loadedProgress = progressManager.loadProgress();
    setProgress(loadedProgress);
    setSelectedDifficulty(loadedProgress.currentDifficulty);
  }, []);

  const handleStageClick = (stageIndex: number) => {
    if (!progress) return;
    
    // 检查关卡是否解锁
    if (!progressManager.isStageUnlocked(progress, stageIndex, selectedDifficulty)) {
      return;
    }

    const stage = STAGES[stageIndex];
    // 跳转到游戏页面，传递关卡ID和难度
    setLocation(`/game?stage=${stage.id}&difficulty=${selectedDifficulty}`);
  };

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
  };

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Player Card - Top Right */}
      <div className="absolute top-4 right-4 z-10 w-80">
        <PlayerCard />
      </div>
      {/* Header */}
      <div className="p-4 border-b-2 border-border flex items-center justify-between" style={{ paddingRight: '340px' }}>
        <Button
          onClick={() => setLocation("/")}
          className="pixel-button bg-secondary text-secondary-foreground text-xs"
          size="sm"
        >
          BACK
        </Button>
        
        <h1 className="text-2xl glow-purple" style={{ fontFamily: 'Creepster, cursive' }}>
          SELECT STAGE
        </h1>
        
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Difficulty Selector */}
      <div className="p-6 border-b-2 border-border bg-card/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg mb-4 text-center" style={{ fontFamily: 'Creepster, cursive' }}>
            DIFFICULTY
          </h2>
          <div className="flex gap-4 justify-center">
            {(['normal', 'hard', 'insane'] as DifficultyLevel[]).map((difficulty) => {
              const config = DIFFICULTY_CONFIGS[difficulty];
              const isUnlocked = progress.unlockedDifficulties.includes(difficulty);
              const isSelected = selectedDifficulty === difficulty;

              return (
                <button
                  key={difficulty}
                  onClick={() => isUnlocked && handleDifficultyChange(difficulty)}
                  disabled={!isUnlocked}
                  className={`
                    pixel-button px-6 py-3 text-sm transition-all
                    ${isSelected 
                      ? 'bg-primary text-primary-foreground border-4 border-primary scale-110' 
                      : isUnlocked
                        ? 'bg-secondary text-secondary-foreground border-2 border-border hover:border-primary'
                        : 'bg-muted text-muted-foreground border-2 border-border opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{config.name.toUpperCase()}</span>
                    {!isUnlocked && (
                      <span className="text-xs">🔒 LOCKED</span>
                    )}
                    {isUnlocked && (
                      <span className="text-xs opacity-70">
                        {config.speedMultiplier}x Speed • {config.densityMultiplier}x Density
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stages Grid */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {STAGES.map((stage, index) => {
            const stageProgress = progress.stages[index];
            const isUnlocked = progressManager.isStageUnlocked(progress, index, selectedDifficulty);
            const isCompleted = stageProgress.progress[selectedDifficulty].completed;
            const highScore = stageProgress.progress[selectedDifficulty].highScore;

            // 场景图标
            const sceneEmoji = {
              church: '⛪',
              graveyard: '🪦',
              castle: '🏰',
            }[stage.scene];

            return (
              <div
                key={stage.id}
                className={`
                  bg-card border-4 p-6 space-y-4 transition-all
                  ${isUnlocked 
                    ? 'border-border hover:border-primary cursor-pointer hover:scale-105' 
                    : 'border-muted opacity-50 cursor-not-allowed'
                  }
                  ${isCompleted ? 'bg-primary/10' : ''}
                `}
                onClick={() => isUnlocked && handleStageClick(index)}
              >
                {/* Stage Icon */}
                <div className="text-6xl text-center">
                  {isUnlocked ? sceneEmoji : '🔒'}
                </div>

                {/* Stage Name */}
                <h3 className="text-2xl text-center" style={{ fontFamily: 'Creepster, cursive' }}>
                  {stage.name}
                </h3>

                {/* Stage Info */}
                <div className="text-xs text-center space-y-2">
                  {isUnlocked ? (
                    <>
                      <p className="text-muted-foreground">
                        Stage {index + 1} • {stage.scene.charAt(0).toUpperCase() + stage.scene.slice(1)}
                      </p>
                      
                      {isCompleted && (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-primary">✓ COMPLETED</span>
                        </div>
                      )}
                      
                      {highScore > 0 && (
                        <p className="text-sm">
                          High Score: <span className="text-primary font-bold">{highScore}</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Complete Stage {index} to unlock
                    </p>
                  )}
                </div>

                {/* Play Button */}
                <Button
                  className={`
                    pixel-button w-full
                    ${isUnlocked 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }
                  `}
                  disabled={!isUnlocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    isUnlocked && handleStageClick(index);
                  }}
                >
                  {isUnlocked ? 'PLAY' : 'LOCKED'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex justify-center gap-8 text-sm">
            <div>
              <span className="text-muted-foreground">Normal: </span>
              <span className="text-primary font-bold">
                {progress.stages.filter(s => s.progress.normal.completed).length}/{STAGES.length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Hard: </span>
              <span className="text-primary font-bold">
                {progress.stages.filter(s => s.progress.hard.completed).length}/{STAGES.length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Insane: </span>
              <span className="text-primary font-bold">
                {progress.stages.filter(s => s.progress.insane.completed).length}/{STAGES.length}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Complete all stages in one difficulty to unlock the next!
          </p>
        </div>
      </div>
    </div>
  );
}
