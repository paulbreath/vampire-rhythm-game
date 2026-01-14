import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GameEngine } from "@/lib/gameEngine";
import { AudioManager } from "@/lib/audioManager";
import { ChartLoader } from "@/lib/chartLoader";
import { toast } from "sonner";
import { getSongById, SONGS } from "@/data/songs";
import { SoundEffectsManager } from "@/lib/soundEffects";
import { progressManager, DIFFICULTY_CONFIGS, type DifficultyLevel } from "@/lib/progressManager";
import { STAGES as NEW_STAGES } from "@/data/newMapSystem.ts";
import { STAGES } from "@/lib/progressManager"; // 保留旧的STAGES用于进度管理
import { experienceManager, type PlayerStats } from '@/lib/experienceManager';
import { newEquipmentManager } from '@/lib/newEquipmentManager';
import { equipmentDropManager, type DropResult } from '@/lib/equipmentDropManager';
import { leaderboardManager } from '@/lib/leaderboardManager';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const soundEffectsRef = useRef<SoundEffectsManager | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [, setLocation] = useLocation();
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [health, setHealth] = useState(newEquipmentManager.getMaxHearts());
  const [maxHealth, setMaxHealth] = useState(newEquipmentManager.getMaxHearts());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(experienceManager.loadStats());
  const [newEquipmentStats, setNewEquipmentStats] = useState(newEquipmentManager.getPlayerStats());
  const [equipmentDrops, setEquipmentDrops] = useState<DropResult[]>([]);
  const [showDropReward, setShowDropReward] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 从 URL 获取关卡和难度
    const urlParams = new URLSearchParams(window.location.search);
    const stageNumberParam = urlParams.get('stage');
    const difficulty = (urlParams.get('difficulty') as DifficultyLevel) || 'normal';
    
    // 使用新的地图系统：根据关卡编号加载关卡
    const stageNumber = stageNumberParam ? parseInt(stageNumberParam) : 1;
    const newStage = NEW_STAGES.find(s => s.stageNumber === stageNumber) || NEW_STAGES[0];
    
    // 为了兼容旧的进度管理系统，映射到旧的stage
    const legacyStage = STAGES[0]; // 使用第一个关卡作为默认
    const stageId = newStage.id;
    const songId = newStage.musicId;
    const backgroundImage = newStage.backgroundImage;
    
    console.log(`Loading Stage ${stageNumber}: ${newStage.nameZh} (${newStage.name})`);
    console.log('Background:', backgroundImage);
    console.log('Music:', songId);
    console.log('Difficulty:', difficulty);
    
    // 如果是BOSS关，显示BOSS信息
    if (newStage.isBossStage) {
      console.log('BOSS Stage! Boss Type:', newStage.bossType);
    }
    
    const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
    const currentSong = getSongById(songId) || SONGS[0];
    
    console.log('Playing music:', currentSong.title);

    // Initialize sound effects
    const soundEffects = new SoundEffectsManager();
    soundEffectsRef.current = soundEffects;

    // Initialize game engine with difficulty multipliers and stage ID
    const engine = new GameEngine(
      canvasRef.current,
      difficultyConfig.speedMultiplier,
      difficultyConfig.densityMultiplier,
      stageId // 传递关卡ID，用于加载对应的怪物类型
    );
    engine.setSoundEffects(soundEffects);
    
    // Set callbacks
    engine.setCallbacks({
      onScoreChange: setScore,
      onComboChange: setCombo,
      onLivesChange: setHealth,
      onExpChange: (stats) => {
        setPlayerStats(stats);
      },
      onLevelUp: (level, message) => {
        toast.success(`🎉 Level Up! Lv.${level} - ${message}`, {
          duration: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }
        });
      },
      onGameOver: () => {
        soundEffects.playGameOver();
        setIsGameOver(true);
        setIsPlaying(false);
        
        // 保存通关进度（如果有剩余生命值，表示通关成功）
        if (health > 0) {
          const stageIndex = STAGES.findIndex(s => s.id === stageId);
          if (stageIndex !== -1) {
            const currentProgress = progressManager.loadProgress();
            const newProgress = progressManager.completeStage(
              currentProgress,
              stageIndex,
              difficulty,
              score
            );
            console.log('Stage completed! Progress saved:', newProgress);
            toast.success(`Stage ${stageIndex + 1} completed on ${difficulty.toUpperCase()}!`);
          }
        }
      }
    });

    gameEngineRef.current = engine;

    // Game loop
    const gameLoop = () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.update();
        gameEngineRef.current.render();
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoop();

    // Load audio and chart
    const loadAudioAndChart = async () => {
      try {
        console.log('Loading audio and chart...');
        
        // Load audio with music end callback
        const audioManager = new AudioManager({
          onMusicEnd: () => {
            // 音乐结束，检查是否通关
            if (gameEngineRef.current && health > 0) {
              console.log('Music ended! Player survived - Stage Clear!');
              soundEffects.playGameOver(); // 播放结束音效
              setIsGameOver(true);
              setIsPlaying(false);
              
              // 保存通关进度
              const stageIndex = STAGES.findIndex(s => s.id === stageId);
              if (stageIndex !== -1) {
                const currentProgress = progressManager.loadProgress();
                const newProgress = progressManager.completeStage(
                  currentProgress,
                  stageIndex,
                  difficulty,
                  score
                );
                console.log('Stage completed! Progress saved:', newProgress);
                toast.success(`🎉 Stage ${stageIndex + 1} cleared on ${difficulty.toUpperCase()}!`);
                
                // 生成装备掉落（使用mapNode ID或stage ID）
                const dropStageId = stageId;
                const drops = equipmentDropManager.generateDrops(dropStageId, 2);
                setEquipmentDrops(drops);
                
                // 计算重复装备转换的积分
                const convertedScore = equipmentDropManager.calculateTotalConvertedScore(drops);
                if (convertedScore > 0) {
                  setScore(prev => prev + convertedScore);
                  console.log('Duplicate equipment converted to score:', convertedScore);
                }
                
                // 显示掉落奖励界面
                setShowDropReward(true);
                
                // 保存排行榜记录
                const stageName = newStage.name;
                leaderboardManager.saveScore({
                  playerName: 'Player', // 默认玩家名，后续可以让用户设置
                  playerAvatar: '🧛', // 吸血鬼 emoji
                  score: score + convertedScore, // 包含装备转换积分
                  combo: combo,
                  stageId: dropStageId,
                  stageName: stageName,
                  difficulty: difficulty,
                  timestamp: Date.now()
                });
              }
            }
          }
        });
        await audioManager.loadAudio(currentSong.audioPath);
        console.log('Audio loaded successfully:', currentSong.title);
        
        // Load chart
        const chartData = await ChartLoader.loadFromURL(currentSong.chartPath);
        console.log('Chart loaded:', chartData.notes.length, 'notes');
        
        // IMPORTANT: Save audio manager reference BEFORE setting to engine
        audioManagerRef.current = audioManager;
        
        // Set background, audio and chart to game engine
        if (gameEngineRef.current) {
          gameEngineRef.current.setBackgroundImage(backgroundImage);
          gameEngineRef.current.setAudioManager(audioManager);
          gameEngineRef.current.setChartData(chartData);
        }
        
        setIsLoading(false);
        toast.success(`Loaded ${chartData.notes.length} notes!`);
      } catch (error) {
        console.error('Failed to load audio/chart:', error);
        toast.error('Failed to load audio or chart');
        setIsLoading(false);
      }
    };

    loadAudioAndChart();

    // Handle pointer events
    const handlePointerDown = (e: PointerEvent) => {
      if (!canvasRef.current || !gameEngineRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
      const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
      gameEngineRef.current.handleSwipe(x, y);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!canvasRef.current || !gameEngineRef.current) return;
      if (e.buttons === 0) return; // Only track when pointer is down
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
      const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
      gameEngineRef.current.handleSwipe(x, y);
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const handleStart = () => {
    setShowDropReward(false);
    setEquipmentDrops([]);
    if (!gameEngineRef.current) {
      toast.error('Game engine not ready');
      return;
    }
    
    if (isLoading) {
      toast.error('Please wait for loading to complete');
      return;
    }
    
    gameEngineRef.current.start();
    soundEffectsRef.current?.playGameStart();
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setCombo(0);
    setHealth(3);
  };

  const handlePause = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause();
      soundEffectsRef.current?.playPause();
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
      <div className="flex justify-between items-center p-4 bg-transparent border-b-2 border-transparent">
        <Button
          onClick={() => setLocation("/")}
          className="pixel-button bg-secondary text-secondary-foreground text-xs"
          size="sm"
        >
          BACK
        </Button>

        <div className="flex gap-6 items-center text-sm">
          {/* Level & EXP */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground">LEVEL</div>
            <div className="text-xl glow-green font-bold">Lv.{playerStats.level}</div>
            <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${(playerStats.exp / playerStats.expToNextLevel) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {playerStats.exp}/{playerStats.expToNextLevel} EXP
            </div>
          </div>

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

          {/* Equipment Stats - 新装备系统 */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground">EQUIPMENT</div>
            <div className="text-xs">
              <span className="text-yellow-400">🛡️ {newEquipmentStats.maxHearts}❤️</span>
            </div>
          </div>

          {/* Health */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground">HEALTH</div>
            <div className="text-xl glow-red font-bold flex gap-1">
              {[...Array(Math.max(0, health))].map((_, i) => (
                <span key={i}>❤️</span>
              ))}
              {[...Array(Math.max(0, maxHealth - Math.max(0, health)))].map((_, i) => (
                <span key={i} className="opacity-30">💔</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isPlaying && !isGameOver && (
            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="pixel-button bg-primary text-primary-foreground text-xs"
              size="sm"
            >
              {isLoading ? 'LOADING...' : 'START'}
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
          className="border-4 border-border rounded-lg shadow-2xl touch-none"
          style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
        />

        {/* Game Over Overlay */}
        {isGameOver && !showDropReward && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90">
            <div className="text-center space-y-6 p-8 bg-card border-4 border-border rounded-lg">
              <h2 className="text-4xl glow-red" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                GAME OVER
              </h2>
              <div className="space-y-2">
                <p className="text-xl">Final Score: <span className="glow-gold">{score.toLocaleString()}</span></p>
                <p className="text-lg">Max Combo: <span className="glow-purple">{combo}x</span></p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleStart}
                  className="pixel-button bg-primary text-primary-foreground"
                >
                  RESTART
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
        
        {/* Equipment Drop Reward Overlay */}
        {showDropReward && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/95">
            <div className="text-center space-y-6 p-8 bg-card border-4 border-border rounded-lg max-w-2xl">
              <h2 className="text-4xl glow-gold" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                STAGE CLEAR!
              </h2>
              
              <div className="space-y-2">
                <p className="text-xl">Final Score: <span className="glow-gold">{score.toLocaleString()}</span></p>
                <p className="text-lg">Max Combo: <span className="glow-purple">{combo}x</span></p>
              </div>
              
              {/* Equipment Drops */}
              {equipmentDrops.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl glow-purple">Equipment Rewards</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {equipmentDrops.map((drop, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-background border-2 rounded-lg"
                        style={{ borderColor: drop.rarityColor }}
                      >
                        <div className="text-4xl mb-2">{drop.icon}</div>
                        <div className="text-lg font-bold" style={{ color: drop.rarityColor }}>
                          {drop.equipmentNameZh}
                        </div>
                        <div className="text-sm text-muted-foreground">{drop.equipmentName}</div>
                        {drop.isNew ? (
                          <div className="text-green-400 text-sm mt-2">✨ NEW!</div>
                        ) : (
                          <div className="text-yellow-400 text-sm mt-2">
                            💰 +{drop.convertedScore} pts
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleStart}
                  className="pixel-button bg-primary text-primary-foreground"
                >
                  RESTART
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
              <p className="text-sm text-muted-foreground">Hunt your kin to the rhythm!</p>
              <p className="text-sm text-muted-foreground">Avoid the bombs!</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-card border-t-2 border-border text-center text-xs text-muted-foreground">
        <p>Swipe to slash enemies • Avoid bombs • Keep your combo going!</p>
      </div>
    </div>
  );
}
