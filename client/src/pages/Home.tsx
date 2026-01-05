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
            className="h-20"
            icon="▶"
          >
            START GAME
          </GlassButton>
          
          {/* CASTLE MAP */}
          <GlassButton
            onClick={() => setLocation("/map")}
            className="h-16"
            icon="🏰"
          >
            CASTLE MAP
          </GlassButton>
          
          {/* EQUIPMENT */}
          <GlassButton
            onClick={() => setLocation("/equipment")}
            className="h-16"
            icon="⚔️"
          >
            EQUIPMENT
          </GlassButton>
          
          {/* LEADERBOARD */}
          <GlassButton
            onClick={() => setLocation("/leaderboard")}
            className="h-16"
            icon="🏆"
          >
            LEADERBOARD
          </GlassButton>
          
          {/* 测试按钮 */}
          <button
            onClick={handleUnlockAll}
            className="mt-4 px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors border border-gray-600 hover:border-gray-400 rounded"
            style={{ fontFamily: 'monospace' }}
          >
            🔓 UNLOCK ALL (TEST)
          </button>
        </div>
      </div>

      {/* 底部装饰文字 */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-20">
        <p 
          className="text-sm text-red-300/70 tracking-widest mb-2"
          style={{ 
            fontFamily: 'serif',
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

// 血红玻璃风格按钮组件
function GlassButton({ 
  children, 
  onClick, 
  className = "", 
  icon 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  className?: string; 
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden ${className}`}
      style={{ fontFamily: 'serif' }}
    >
      {/* 血红玻璃背景 */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-red-900/70 via-red-800/80 to-red-900/70 backdrop-blur-sm group-hover:from-red-800/80 group-hover:via-red-700/90 group-hover:to-red-800/80 transition-all duration-300"
        style={{
          boxShadow: 'inset 0 0 30px rgba(139, 0, 0, 0.5)',
        }}
      />
      
      {/* 金色边框 */}
      <div 
        className="absolute inset-0 border-4 border-yellow-600 group-hover:border-yellow-400 transition-colors duration-300 rounded-lg"
        style={{
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.2)',
        }}
      />
      
      {/* 顶部高光 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-lg" />
      
      {/* 悬停发光效果 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)',
        }}
      />
      
      {/* 文字内容 */}
      <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8">
        {icon && (
          <span className="text-2xl md:text-3xl drop-shadow-lg">{icon}</span>
        )}
        <span 
          className="text-xl md:text-2xl font-bold text-white group-hover:text-yellow-50 transition-colors duration-300"
          style={{
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          {children}
        </span>
      </div>
      
      {/* 装饰角 - 蝙蝠翅膀 */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-600 group-hover:text-yellow-400 transition-colors text-2xl drop-shadow-lg">
        🦇
      </div>
    </button>
  );
}
