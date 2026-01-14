import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { progressManager, DIFFICULTY_CONFIGS, type DifficultyLevel } from '@/lib/progressManager';
import { STAGES, SCENES, isStageUnlocked } from '@/data/newMapSystem.ts';
import { GlassButton } from '@/components/ui/glass-button';
import { Lock, CheckCircle, Crown, BookOpen, TreePine, Church, Clock, Skull, Beaker } from 'lucide-react';
import { newEquipmentManager } from '@/lib/newEquipmentManager';

export default function MapSelection() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(progressManager.loadProgress());
  const [selectedStageNumber, setSelectedStageNumber] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('normal');
  const [bats, setBats] = useState<Array<{ id: number; x: number; y: number; speed: number; direction: number }>>([]);

  useEffect(() => {
    setProgress(progressManager.loadProgress());
  }, []);

  // 生成飘动的蝙蝠
  useEffect(() => {
    const newBats = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.2 + Math.random() * 0.3,
      direction: Math.random() * Math.PI * 2,
    }));
    setBats(newBats);

    const interval = setInterval(() => {
      setBats(prevBats =>
        prevBats.map(bat => {
          let newX = bat.x + Math.cos(bat.direction) * bat.speed;
          let newY = bat.y + Math.sin(bat.direction) * bat.speed;
          let newDirection = bat.direction;

          if (newX < 0 || newX > 100) {
            newDirection = Math.PI - newDirection;
            newX = Math.max(0, Math.min(100, newX));
          }
          if (newY < 0 || newY > 100) {
            newDirection = -newDirection;
            newY = Math.max(0, Math.min(100, newY));
          }

          return { ...bat, x: newX, y: newY, direction: newDirection };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // 从localStorage获取已完成的关卡
  const completedStages = JSON.parse(localStorage.getItem('completedStages') || '[]');

  // 计算地图进度
  const mapProgress = {
    completed: completedStages.length,
    total: STAGES.length,
    percentage: Math.round((completedStages.length / STAGES.length) * 100)
  };

  // 获取选中的关卡信息
  const selectedStage = selectedStageNumber ? STAGES.find(s => s.stageNumber === selectedStageNumber) : null;

  // 获取场景图标
  const getSceneIcon = (sceneId: string) => {
    const iconMap: Record<string, any> = {
      'church': Church,
      'bell-tower': Clock,
      'catacombs': Skull,
      'graveyard': Skull,
      'ancient-tomb': Skull,
      'cursed-forest': TreePine,
      'castle-hall': Crown,
      'library': BookOpen,
      'torture-chamber': Beaker,
      'throne-room': Crown
    };
    return iconMap[sceneId] || Church;
  };

  // 处理关卡点击
  const handleStageClick = (stageNumber: number) => {
    const stage = STAGES.find(s => s.stageNumber === stageNumber);
    if (stage && isStageUnlocked(stage.id, completedStages)) {
      setSelectedStageNumber(stageNumber);
    }
  };

  // 开始游戏
  const handleStartGame = () => {
    if (selectedStageNumber) {
      setLocation(`/game?stage=${selectedStageNumber}&difficulty=${selectedDifficulty}`);
    }
  };

  // 返回主菜单
  const handleBack = () => {
    setLocation('/');
  };
  
  // 解锁所有装备和地图（测试功能）
  const handleUnlockAll = () => {
    // 解锁所有装备
    newEquipmentManager.unlockAllEquipment();
    // 解锁所有地图关卡
    const allStageIds = STAGES.map(s => s.id);
    localStorage.setItem('completedStages', JSON.stringify(allStageIds));
    // 解锁所有难度
    const newProgress = progressManager.unlockAll();
    setProgress(newProgress);
    alert('All equipment and stages unlocked!');
    window.location.reload();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex flex-col">
      {/* 暗色背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-black to-black" />

      {/* 飘动的蝙蝠 */}
      {bats.map(bat => (
        <div
          key={bat.id}
          className="absolute text-xl transition-all duration-1000 ease-linear opacity-30 z-10"
          style={{
            left: `${bat.x}%`,
            top: `${bat.y}%`,
            transform: `translate(-50%, -50%) scaleX(${Math.cos(bat.direction) > 0 ? 1 : -1})`,
            textShadow: '0 0 10px rgba(255, 0, 100, 0.5)',
          }}
        >
          🦇
        </div>
      ))}

      {/* 顶部信息栏 */}
      <div className="relative z-50 bg-black/80 backdrop-blur-sm border-b-2 border-yellow-600/30 py-2 px-4">
        <div className="container flex items-center justify-between">
          <GlassButton
            onClick={handleBack}
            size="sm"
            variant="secondary"
            icon="←"
          >
            BACK
          </GlassButton>
          
          <div className="text-center">
            <h1 
              className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500"
              style={{ fontFamily: '"Press Start 2P", cursive' }}
            >
              🏰 VAMPIRE CASTLE
            </h1>
            <p className="text-xs text-yellow-300/80">
              Progress: {mapProgress.completed}/{mapProgress.total} ({mapProgress.percentage}%)
            </p>
          </div>
          
          <button
            onClick={handleUnlockAll}
            className="px-3 py-1 text-xs bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 border border-gray-500 rounded transition-all"
            style={{ fontFamily: '"Press Start 2P", cursive' }}
          >
            🔓 TEST
          </button>
        </div>
      </div>

      {/* 地图滚动区域 */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 space-y-12">
          {/* 按场景分组显示关卡 */}
          {Object.values(SCENES).map((scene) => {
            const sceneStages = STAGES.filter(s => s.sceneId === scene.id);
            const Icon = getSceneIcon(scene.id);

            return (
              <div key={scene.id} className="relative">
                {/* 场景标题 */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8 text-yellow-500" />
                    <h2 
                      className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500"
                      style={{ fontFamily: '"Press Start 2P", cursive' }}
                    >
                      {scene.nameZh}
                    </h2>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                </div>

                {/* 关卡节点 */}
                <div className="grid grid-cols-3 gap-6">
                  {sceneStages.map((stage) => {
                    const isUnlocked = isStageUnlocked(stage.id, completedStages);
                    const isCompleted = completedStages.includes(stage.id);
                    const isSelected = selectedStageNumber === stage.stageNumber;

                    return (
                      <button
                        key={stage.id}
                        onClick={() => handleStageClick(stage.stageNumber)}
                        disabled={!isUnlocked}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all duration-300
                          ${isSelected 
                            ? 'bg-yellow-600/30 border-yellow-400 scale-105 shadow-2xl shadow-yellow-500/50' 
                            : isCompleted
                              ? 'bg-green-900/30 border-green-500 hover:scale-105'
                              : isUnlocked
                                ? 'bg-red-900/30 border-red-600 hover:scale-105 hover:shadow-xl'
                                : 'bg-gray-800/30 border-gray-600 opacity-50 cursor-not-allowed'
                          }
                        `}
                      >
                        {/* 背景图 */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-10 rounded-lg"
                          style={{ backgroundImage: `url(${stage.backgroundImage})` }}
                        ></div>

                        {/* 内容 */}
                        <div className="relative z-10">
                          {/* 关卡编号和状态 */}
                          <div className="flex justify-between items-start mb-3">
                            <div 
                              className="text-4xl font-bold text-red-500"
                              style={{ fontFamily: '"Press Start 2P", cursive' }}
                            >
                              {stage.stageNumber}
                            </div>
                            <div className="flex gap-2">
                              {!isUnlocked && <Lock className="w-5 h-5 text-gray-500" />}
                              {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {stage.isBossStage && <Skull className="w-5 h-5 text-red-500 animate-pulse" />}
                            </div>
                          </div>

                          {/* 关卡名称 */}
                          <h3 className="text-sm font-bold text-yellow-300 mb-1">
                            {stage.nameZh}
                          </h3>
                          <p className="text-xs text-gray-400 mb-2">
                            {stage.name}
                          </p>

                          {/* 标签 */}
                          <div className="flex gap-2 flex-wrap">
                            {stage.isBossStage && (
                              <span className="px-2 py-0.5 bg-red-600/80 text-white text-xs rounded-full font-bold">
                                BOSS
                              </span>
                            )}
                            <span className={`
                              px-2 py-0.5 text-xs rounded-full font-bold
                              ${stage.difficulty === 'easy' ? 'bg-green-600/80 text-white' : ''}
                              ${stage.difficulty === 'normal' ? 'bg-yellow-600/80 text-white' : ''}
                              ${stage.difficulty === 'hard' ? 'bg-red-600/80 text-white' : ''}
                            `}>
                              {stage.difficulty.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部详情面板 */}
      {selectedStage && (
        <div className="relative z-50 bg-black/95 backdrop-blur-md border-t-4 border-yellow-600/50 p-4">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 左侧：关卡信息 */}
              <div className="md:col-span-2">
                <h2 
                  className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-2"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                >
                  {selectedStage.nameZh}
                </h2>
                <p className="text-yellow-400/80 text-xs mb-1 italic">{selectedStage.name}</p>
                <p className="text-gray-300 text-sm mb-3">{selectedStage.description}</p>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-yellow-500">Stage:</span>{' '}
                    <span className="text-white font-bold">#{selectedStage.stageNumber}</span>
                  </div>
                  <div>
                    <span className="text-yellow-500">Scene:</span>{' '}
                    <span className="text-white">{selectedStage.sceneNameZh}</span>
                  </div>
                  {selectedStage.isBossStage && (
                    <div>
                      <span className="text-yellow-500">BOSS:</span>{' '}
                      <span className="text-red-300 font-bold">{selectedStage.bossType}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-yellow-500">Status:</span>{' '}
                    <span className={completedStages.includes(selectedStage.id) ? 'text-green-400 font-bold' : 'text-yellow-400'}>
                      {completedStages.includes(selectedStage.id) ? '✓ Completed' : 'Not Completed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 右侧：难度选择和操作按钮 */}
              <div className="flex flex-col gap-2 justify-center">
                {/* 难度选择器 */}
                <div className="mb-1">
                  <p className="text-yellow-400 text-xs mb-2 text-center font-bold">SELECT DIFFICULTY:</p>
                  <div className="flex gap-2">
                    {(['normal', 'hard', 'insane'] as DifficultyLevel[]).map((difficulty) => {
                      const config = DIFFICULTY_CONFIGS[difficulty];
                      const isUnlocked = progress.unlockedDifficulties.includes(difficulty);
                      const isSelected = selectedDifficulty === difficulty;

                      return (
                        <button
                          key={difficulty}
                          onClick={() => isUnlocked && setSelectedDifficulty(difficulty)}
                          disabled={!isUnlocked}
                          className={`
                            flex-1 px-2 py-1 text-xs rounded border-2 transition-all font-bold
                            ${isSelected 
                              ? 'bg-yellow-600 border-yellow-400 text-white' 
                              : isUnlocked
                                ? 'bg-red-900/50 border-red-600 text-yellow-300 hover:bg-red-800/70'
                                : 'bg-gray-800/50 border-gray-600 text-gray-500 cursor-not-allowed'
                            }
                          `}
                        >
                          {config.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 开始游戏按钮 */}
                <GlassButton
                  onClick={handleStartGame}
                  size="sm"
                  icon="▶"
                >
                  START
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
