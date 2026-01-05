import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { progressManager } from '@/lib/progressManager';
import { MAP_NODES, isMapNodeUnlocked, getMapProgress, type MapNode } from '@/data/mapNodes';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Crown, BookOpen, TreePine, Church, Clock, Skull, Beaker } from 'lucide-react';

export default function MapSelection() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(progressManager.loadProgress());
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    setProgress(progressManager.loadProgress());
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
      setLocation(`/game?stage=${selectedNode.id}&difficulty=normal`);
    }
  };

  // 返回主菜单
  const handleBack = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black text-white overflow-hidden">
      {/* 顶部信息栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="container flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-purple-500/50 hover:bg-purple-500/20"
          >
            ← 返回主菜单
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
              城堡地图
            </h1>
            <p className="text-sm text-purple-300">
              探索进度: {mapProgress.completed}/{mapProgress.total} ({mapProgress.percentage}%)
            </p>
          </div>
          
          <div className="w-32" /> {/* 占位，保持居中 */}
        </div>
      </div>

      {/* 地图背景 */}
      <div className="relative w-full h-screen pt-20">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/images/map-system-background.png"
            alt="Castle Map"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* 地图节点覆盖层 */}
        <div className="absolute inset-0 pt-20">
          {Object.values(MAP_NODES).map((node) => {
            const isUnlocked = isMapNodeUnlocked(node.id, completedStages);
            const isCompleted = completedStages.includes(node.id);
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;
            const Icon = getNodeIcon(node.id);

            return (
              <button
                key={node.id}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2
                  w-16 h-16 rounded-full
                  flex items-center justify-center
                  transition-all duration-300
                  ${isUnlocked 
                    ? 'bg-purple-600/80 hover:bg-purple-500 hover:scale-125 cursor-pointer' 
                    : 'bg-gray-800/80 cursor-not-allowed'
                  }
                  ${isCompleted ? 'ring-4 ring-green-500' : ''}
                  ${isSelected ? 'ring-4 ring-yellow-500 scale-125' : ''}
                  ${isHovered && isUnlocked ? 'shadow-lg shadow-purple-500/50' : ''}
                  border-2 border-purple-400/50
                `}
                style={{
                  left: `${node.position.x}%`,
                  top: `${node.position.y}%`
                }}
                disabled={!isUnlocked}
              >
                {isCompleted && (
                  <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-green-500" />
                )}
                {!isUnlocked && (
                  <Lock className="w-8 h-8 text-gray-500" />
                )}
                {isUnlocked && (
                  <Icon className="w-8 h-8 text-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* 节点连接线（可选，暂时注释） */}
        {/* <svg className="absolute inset-0 pointer-events-none">
          {Object.values(MAP_NODES).map((node) => {
            return node.connections.map((connId) => {
              const connNode = MAP_NODES[connId];
              if (!connNode) return null;
              
              const isUnlocked = isMapNodeUnlocked(node.id, completedStages);
              const isConnUnlocked = isMapNodeUnlocked(connId, completedStages);
              
              return (
                <line
                  key={`${node.id}-${connId}`}
                  x1={`${node.position.x}%`}
                  y1={`${node.position.y}%`}
                  x2={`${connNode.position.x}%`}
                  y2={`${connNode.position.y}%`}
                  stroke={isUnlocked && isConnUnlocked ? '#a855f7' : '#4b5563'}
                  strokeWidth="2"
                  strokeDasharray={isUnlocked && isConnUnlocked ? '0' : '5,5'}
                  opacity="0.5"
                />
              );
            });
          })}
        </svg> */}
      </div>

      {/* 底部详情面板 */}
      {selectedNode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-purple-500/30 p-6">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 左侧：关卡信息 */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
                  {selectedNode.name}
                </h2>
                <p className="text-purple-300 text-sm mb-1">{selectedNode.nameEn}</p>
                <p className="text-gray-300 mb-4">{selectedNode.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-400">章节:</span>{' '}
                    <span className="text-white">第{selectedNode.chapter}章</span>
                  </div>
                  <div>
                    <span className="text-purple-400">BOSS:</span>{' '}
                    <span className="text-white">{selectedNode.boss}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">主题:</span>{' '}
                    <span className="text-white">{selectedNode.theme}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">状态:</span>{' '}
                    <span className={completedStages.includes(selectedNode.id) ? 'text-green-400' : 'text-yellow-400'}>
                      {completedStages.includes(selectedNode.id) ? '✓ 已完成' : '未完成'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 右侧：操作按钮 */}
              <div className="flex flex-col gap-3 justify-center">
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg"
                >
                  开始游戏
                </Button>
                <Button
                  onClick={() => setSelectedNode(null)}
                  variant="outline"
                  size="lg"
                  className="w-full border-purple-500/50 hover:bg-purple-500/20"
                >
                  取消选择
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提示文字（未选择关卡时） */}
      {!selectedNode && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <p className="text-purple-300 text-center animate-pulse">
            点击地图上的区域开始探索
          </p>
        </div>
      )}
    </div>
  );
}
