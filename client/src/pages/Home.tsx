import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { newEquipmentManager } from '@/lib/newEquipmentManager';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [bats, setBats] = useState<Array<{ id: number; x: number; y: number; speed: number; direction: number }>>([]);

  // 生成飘动的蝙蝠
  useEffect(() => {
    const newBats = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.5 + Math.random() * 0.5,
      direction: Math.random() * Math.PI * 2,
    }));
    setBats(newBats);

    const interval = setInterval(() => {
      setBats(prevBats =>
        prevBats.map(bat => {
          let newX = bat.x + Math.cos(bat.direction) * bat.speed;
          let newY = bat.y + Math.sin(bat.direction) * bat.speed;
          let newDirection = bat.direction;

          // 边界反弹
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

  const handleUnlockAll = () => {
    newEquipmentManager.unlockAllEquipment();
    toast.success('🔓 All equipment unlocked!');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 像素网格背景 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(139, 0, 139, .3) 25%, rgba(139, 0, 139, .3) 26%, transparent 27%, transparent 74%, rgba(139, 0, 139, .3) 75%, rgba(139, 0, 139, .3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(139, 0, 139, .3) 25%, rgba(139, 0, 139, .3) 26%, transparent 27%, transparent 74%, rgba(139, 0, 139, .3) 75%, rgba(139, 0, 139, .3) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* 飘动的蝙蝠 */}
      {bats.map(bat => (
        <div
          key={bat.id}
          className="absolute text-2xl transition-all duration-1000 ease-linear"
          style={{
            left: `${bat.x}%`,
            top: `${bat.y}%`,
            transform: `translate(-50%, -50%) scaleX(${Math.cos(bat.direction) > 0 ? 1 : -1})`,
          }}
        >
          🦇
        </div>
      ))}

      {/* 主内容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* 城堡剪影装饰 */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-purple-950/50 to-transparent" />
        
        {/* 标题区域 */}
        <div className="text-center space-y-6 mb-16">
          {/* 主标题 */}
          <div className="relative">
            <h1 
              className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-purple-500 to-pink-500 animate-pulse"
              style={{ 
                fontFamily: 'Creepster, cursive',
                textShadow: '0 0 20px rgba(255, 0, 100, 0.5), 0 0 40px rgba(139, 0, 139, 0.3)',
              }}
            >
              VAMPIRE
            </h1>
            <h2 
              className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-pink-600"
              style={{ 
                fontFamily: 'Creepster, cursive',
                textShadow: '0 0 20px rgba(139, 0, 139, 0.5)',
              }}
            >
              RHYTHM
            </h2>
          </div>

          {/* 副标题 */}
          <p 
            className="text-sm md:text-base text-purple-300 tracking-widest"
            style={{ fontFamily: 'monospace' }}
          >
            ⚔️ Hybrid Hunter's Requiem ⚔️
          </p>

          {/* 装饰性十字架 */}
          <div className="flex justify-center gap-8 text-red-500/30 text-2xl">
            <span>✝</span>
            <span>🗡️</span>
            <span>✝</span>
          </div>
        </div>

        {/* 菜单按钮 - 像素风格 */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Button
            onClick={() => setLocation("/game")}
            className="pixel-button h-14 text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 border-4 border-red-400 shadow-lg shadow-red-500/50 transition-all hover:scale-105"
            style={{ fontFamily: 'monospace' }}
          >
            <span className="flex items-center justify-center gap-3">
              ▶ START GAME
            </span>
          </Button>
          
          <Button
            onClick={() => setLocation("/map")}
            className="pixel-button h-14 text-lg font-bold bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 border-4 border-purple-400 shadow-lg shadow-purple-500/50 transition-all hover:scale-105"
            style={{ fontFamily: 'monospace' }}
          >
            <span className="flex items-center justify-center gap-3">
              🏰 CASTLE MAP
            </span>
          </Button>
          
          <Button
            onClick={() => setLocation("/equipment")}
            className="pixel-button h-14 text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 border-4 border-amber-400 shadow-lg shadow-amber-500/50 transition-all hover:scale-105"
            style={{ fontFamily: 'monospace' }}
          >
            <span className="flex items-center justify-center gap-3">
              ⚔️ EQUIPMENT
            </span>
          </Button>
          
          <Button
            onClick={() => setLocation("/leaderboard")}
            className="pixel-button h-14 text-lg font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 border-4 border-yellow-400 shadow-lg shadow-yellow-500/50 transition-all hover:scale-105"
            style={{ fontFamily: 'monospace' }}
          >
            <span className="flex items-center justify-center gap-3">
              🏆 LEADERBOARD
            </span>
          </Button>
          
          {/* 测试按钮 */}
          <Button
            onClick={handleUnlockAll}
            className="pixel-button h-12 text-sm font-bold bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 border-2 border-gray-500 shadow-lg shadow-gray-500/30 transition-all hover:scale-105 mt-4"
            style={{ fontFamily: 'monospace' }}
          >
            <span className="flex items-center justify-center gap-2">
              🔓 UNLOCK ALL (TEST)
            </span>
          </Button>
        </div>

        {/* 底部装饰文字 */}
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-purple-400/50 tracking-wider" style={{ fontFamily: 'monospace' }}>
            Press START to begin your hunt
          </p>
          <p className="text-xs text-red-500/30 mt-2">🦇</p>
        </div>
      </div>

      {/* 月亮装饰 */}
      <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-200 to-gray-300 opacity-20 blur-sm" />
    </div>
  );
}
