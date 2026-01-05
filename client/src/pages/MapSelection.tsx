import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { progressManager, DIFFICULTY_CONFIGS, type DifficultyLevel } from '@/lib/progressManager';
import { MAP_NODES, isMapNodeUnlocked, getMapProgress, type MapNode } from '@/data/mapNodes';
import { GlassButton } from '@/components/ui/glass-button';
import { Lock, CheckCircle, Crown, BookOpen, TreePine, Church, Clock, Skull, Beaker } from 'lucide-react';

export default function MapSelection() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(progressManager.loadProgress());
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
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

  const completedStages = progress.stages
    .filter((s: any) => s.progress.normal.completed)
    .map((s: any) => s.id);

  const mapProgress = getMapProgress(completedStages);

  // 获取区域图标
  const getNodeIcon = (nodeId: string) => {
    const iconMap: Record<string, any> = {
      'abandoned-church': Church,
      'bell-tower': Clock,
      'catacombs': Skull,
      'misty-graveyard': Skull,
      'ancient-tomb': Skull,
      'cursed-forest': TreePine,
      'castle-hall': Crown,
      'library': BookOpen,
      'alchemy-lab': Beaker,
      'throne-room': Crown
    };
    return iconMap[nodeId] || Church;
  };

  // 处理节点点击
  const handleNodeClick = (node: MapNode) => {
    const isUnlocked = isMapNodeUnlocked(node.id, completedStages);
    if (isUnlocked) {
      setSelectedNode(node);
    }
  };

  // 开始游戏
  const handleStartGame = () => {
    if (selectedNode) {
      setLocation(`/game?stage=${selectedNode.id}&difficulty=${selectedDifficulty}`);
    }
  };

  // 返回主菜单
  const handleBack = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b-2 border-yellow-600/30 p-4">
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
              className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-1"
              style={{ fontFamily: '"Press Start 2P", cursive' }}
            >
              🏰 CASTLE MAP
            </h1>
            <p className="text-sm text-yellow-300/80">
              Progress: {mapProgress.completed}/{mapProgress.total} ({mapProgress.percentage}%)
            </p>
          </div>
          
          <div className="w-24" /> {/* 占位，保持居中 */}
        </div>
      </div>

      {/* 地图背景 */}
      <div className="relative w-full h-screen pt-20">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/images/map-system-background.png"
            alt="Castle Map"
            className="max-w-full max-h-full object-contain opacity-90"
          />
        </div>

        {/* 地图节点覆盖层 */}
        <div className="absolute inset-0 pt-20">
          {Object.values(MAP_NODES).map((node) => {
            const isUnlocked = isMapNodeUnlocked(node.id, completedStages);
            const isCompleted = completedStages.includes(node.id);
            const isHovered = hoveredNode === node.id;
            const Icon = getNodeIcon(node.id);

            return (
              <button
                key={node.id}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2
                  transition-all duration-300 z-20
                  ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                  ${isHovered && isUnlocked ? 'scale-125' : 'scale-100'}
                `}
                style={{
                  left: `${node.position.x}%`,
                  top: `${node.position.y}%`,
                }}
                disabled={!isUnlocked}
              >
                {/* 节点背景光晕 */}
                <div
                  className={`
                    absolute inset-0 rounded-full blur-xl -z-10
                    ${isCompleted ? 'bg-green-500/50' : isUnlocked ? 'bg-yellow-500/50' : 'bg-gray-500/30'}
                    ${isHovered && isUnlocked ? 'scale-150' : 'scale-100'}
                    transition-all duration-300
                  `}
                />

                {/* 节点主体 */}
                <div
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    border-4 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-900/80 border-green-500' 
                      : isUnlocked 
                        ? 'bg-red-900/80 border-yellow-600' 
                        : 'bg-gray-800/80 border-gray-600'
                    }
                    ${isHovered && isUnlocked ? 'shadow-2xl' : 'shadow-lg'}
                  `}
                  style={{
                    boxShadow: isHovered && isUnlocked 
                      ? '0 0 30px rgba(255, 215, 0, 0.8)' 
                      : '0 0 15px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-green-300" />
                  ) : isUnlocked ? (
                    <Icon className="w-8 h-8 text-yellow-300" />
                  ) : (
                    <Lock className="w-8 h-8 text-gray-500" />
                  )}
                </div>

                {/* 节点名称 */}
                <div
                  className={`
                    absolute top-full mt-2 whitespace-nowrap text-xs font-bold
                    px-2 py-1 rounded
                    ${isUnlocked ? 'bg-black/80 text-yellow-300' : 'bg-black/60 text-gray-500'}
                    ${isHovered && isUnlocked ? 'opacity-100' : 'opacity-0'}
                    transition-opacity duration-300
                  `}
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {node.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部详情面板 */}
      {selectedNode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t-4 border-yellow-600/50 p-6">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 左侧：关卡信息 */}
              <div className="md:col-span-2">
                <h2 
                  className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-2"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                >
                  {selectedNode.name}
                </h2>
                <p className="text-yellow-400/80 text-sm mb-1 italic">{selectedNode.nameEn}</p>
                <p className="text-gray-300 mb-4">{selectedNode.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-500">Chapter:</span>{' '}
                    <span className="text-white font-bold">#{selectedNode.chapter}</span>
                  </div>
                  <div>
                    <span className="text-yellow-500">BOSS:</span>{' '}
                    <span className="text-red-300 font-bold">{selectedNode.boss}</span>
                  </div>
                  <div>
                    <span className="text-yellow-500">Theme:</span>{' '}
                    <span className="text-white">{selectedNode.theme}</span>
                  </div>
                  <div>
                    <span className="text-yellow-500">Status:</span>{' '}
                    <span className={completedStages.includes(selectedNode.id) ? 'text-green-400 font-bold' : 'text-yellow-400'}>
                      {completedStages.includes(selectedNode.id) ? '✓ Completed' : 'Not Completed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 右侧：难度选择和操作按钮 */}
              <div className="flex flex-col gap-3 justify-center">
                {/* 难度选择器 */}
                <div className="mb-2">
                  <p className="text-yellow-400 text-sm mb-2 text-center font-bold">SELECT DIFFICULTY:</p>
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
                            flex-1 px-3 py-2 text-xs rounded-lg border-3 transition-all font-bold
                            ${isSelected 
                              ? 'bg-red-800/90 border-yellow-500 text-white scale-105 shadow-lg' 
                              : isUnlocked
                                ? 'bg-red-900/50 border-yellow-600/50 text-yellow-300 hover:border-yellow-500 hover:scale-105'
                                : 'bg-gray-800/50 border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
                            }
                          `}
                          style={{
                            boxShadow: isSelected ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none',
                          }}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <span>{config.name.toUpperCase()}</span>
                            {!isUnlocked && <span>🔒</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <GlassButton
                  onClick={handleStartGame}
                  size="lg"
                  icon="⚔️"
                >
                  START BATTLE
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
