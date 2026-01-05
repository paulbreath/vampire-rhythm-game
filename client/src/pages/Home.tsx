import { useLocation } from 'wouter';
import { newEquipmentManager } from '@/lib/newEquipmentManager';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { getUIIconStyle } from '@/lib/pixelIcons';

export default function Home() {
  const [, setLocation] = useLocation();
  const [bats, setBats] = useState<Array<{ id: number; x: number; y: number; speed: number; direction: number }>>([]);

  // 生成飘动的蝙蝠
  useEffect(() => {
    const newBats = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.3 + Math.random() * 0.4,
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
    <div className="min-h-screen relative overflow-hidden">
      {/* 主背景图 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/main-background.png)',
          filter: 'brightness(0.9)',
        }}
      />

      {/* 暗色遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* 飘动的蝙蝠 */}
      {bats.map(bat => (
        <div
          key={bat.id}
          className="absolute text-xl md:text-2xl transition-all duration-1000 ease-linear opacity-40"
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

      {/* 主内容 - 右侧按钮区域 */}
      <div className="relative z-10 min-h-screen flex items-center justify-end px-4 lg:px-16">
        {/* 右侧：菜单按钮 */}
        <div className="flex flex-col gap-6 w-full max-w-md lg:max-w-lg pb-20 lg:pb-0">
          {/* START GAME - 主要按钮 */}
          <GlassButton
            onClick={() => setLocation("/game")}
            size="lg"
            customIcon={<div style={getUIIconStyle('play')} />}
          >
            START GAME
          </GlassButton>
          
          {/* CASTLE MAP */}
          <GlassButton
            onClick={() => setLocation("/map")}
            size="md"
            customIcon={<div style={getUIIconStyle('castle')} />}
          >
            CASTLE MAP
          </GlassButton>
          
          {/* EQUIPMENT */}
          <GlassButton
            onClick={() => setLocation("/equipment")}
            size="md"
            customIcon={<div style={getUIIconStyle('swords')} />}
          >
            EQUIPMENT
          </GlassButton>
          
          {/* LEADERBOARD */}
          <GlassButton
            onClick={() => setLocation("/leaderboard")}
            size="md"
            customIcon={<div style={getUIIconStyle('trophy')} />}
          >
            LEADERBOARD
          </GlassButton>
          
          {/* 测试按钮 */}
          <GlassButton
            onClick={handleUnlockAll}
            size="sm"
            variant="danger"
            customIcon={<div style={getUIIconStyle('unlock')} />}
            className="mt-4"
          >
            UNLOCK ALL (TEST)
          </GlassButton>
        </div>
      </div>

      {/* 底部装饰文字 */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-20">
        <p 
          className="text-sm text-red-300/70 tracking-widest mb-2"
          style={{ 
            fontFamily: '"Press Start 2P", cursive',
            textShadow: '0 0 10px rgba(220, 20, 60, 0.5)',
          }}
        >
          ♪ Press START to begin your symphony ♪
        </p>
        <div className="flex justify-center gap-4 text-xs text-purple-400/50">
          <span>✝</span>
          <span>🦇</span>
          <span>♫</span>
          <span>🗡️</span>
          <span>✝</span>
        </div>
      </div>
    </div>
  );
}
