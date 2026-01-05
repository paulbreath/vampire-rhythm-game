/**
 * 动画测试页面 - 用于测试主角精灵动画
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AnimationTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentAnimation, setCurrentAnimation] = useState<'idle' | 'attack' | 'hurt'>('idle');
  const [isPlaying, setIsPlaying] = useState(true);
  const animationSystemRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置Canvas尺寸
    canvas.width = 800;
    canvas.height = 600;

    // 动态导入动画系统
    import('@/lib/spriteAnimation').then(({ SpriteAnimation }) => {
      import('@/data/vampireHeroAnimations').then(({ vampireHeroAnimations }) => {
        // 加载精灵图
        const idleImg = new Image();
        const attackImg = new Image();
        const hurtImg = new Image();

        let loadedCount = 0;
        const totalImages = 3;

        const checkAllLoaded = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            console.log('All sprite sheets loaded!');
            
            // 创建动画实例
            const animations = {
              idle: new SpriteAnimation(idleImg, vampireHeroAnimations.idle),
              attack: new SpriteAnimation(attackImg, vampireHeroAnimations.attack),
              hurt: new SpriteAnimation(hurtImg, vampireHeroAnimations.hurt),
            };

            animationSystemRef.current = animations;

            // 开始渲染循环
            let lastTime = performance.now();
            const render = (currentTime: number) => {
              const deltaTime = (currentTime - lastTime) / 1000;
              lastTime = currentTime;

              // 清空画布
              ctx.fillStyle = '#1a1a2e';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // 绘制网格背景
              ctx.strokeStyle = '#2a2a3e';
              ctx.lineWidth = 1;
              for (let x = 0; x < canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
              }
              for (let y = 0; y < canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
              }

              // 更新和渲染当前动画
              if (isPlaying && animations[currentAnimation]) {
                animations[currentAnimation].update(deltaTime);
                
                // 清除Canvas背景(深色背景,不是棋盘格)
                ctx.fillStyle = '#1a1a2e'; // 深色背景
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 居中渲染
                const scale = 0.5; // 缩放到合适大小,让主角更清晰可见
                const spriteWidth = 688 * scale;
                const spriteHeight = 768 * scale;
                const x = (canvas.width - spriteWidth) / 2;
                const y = (canvas.height - spriteHeight) / 2;

                animations[currentAnimation].render(ctx, x, y, scale, false);

                // 显示动画信息
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px monospace';
                ctx.fillText(`Animation: ${currentAnimation.toUpperCase()}`, 20, 30);
                ctx.fillText(`Scale: ${scale.toFixed(2)}`, 20, 55);
                ctx.fillText(`Playing: ${isPlaying ? 'YES' : 'NO'}`, 20, 80);
              }

              requestAnimationFrame(render);
            };

            requestAnimationFrame(render);
          }
        };

        idleImg.onload = () => {
          console.log('IDLE sprite loaded');
          checkAllLoaded();
        };
        idleImg.onerror = () => console.error('Failed to load IDLE sprite');
        idleImg.src = '/images/alucard-idle-transparent.png';

        attackImg.onload = () => {
          console.log('ATTACK sprite loaded');
          checkAllLoaded();
        };
        attackImg.onerror = () => console.error('Failed to load ATTACK sprite');
        attackImg.src = '/images/alucard-attack-transparent.png';

        hurtImg.onload = () => {
          console.log('HURT sprite loaded');
          checkAllLoaded();
        };
        hurtImg.onerror = () => console.error('Failed to load HURT sprite');
        hurtImg.src = '/images/alucard-hurt-v2.png';
      });
    });
  }, [currentAnimation, isPlaying]);

  const handleAnimationChange = (anim: 'idle' | 'attack' | 'hurt') => {
    setCurrentAnimation(anim);
    // 重置动画
    if (animationSystemRef.current && animationSystemRef.current[anim]) {
      animationSystemRef.current[anim].reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🧛 Vampire Hero Animation Test
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas区域 */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700 p-4">
              <canvas
                ref={canvasRef}
                className="w-full border-2 border-gray-600 rounded"
                style={{ imageRendering: 'pixelated' }}
              />
            </Card>
          </div>

          {/* 控制面板 */}
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Animation Control</h2>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleAnimationChange('idle')}
                  variant={currentAnimation === 'idle' ? 'default' : 'outline'}
                  className="w-full"
                >
                  🧍 IDLE (闲置)
                </Button>
                
                <Button
                  onClick={() => handleAnimationChange('attack')}
                  variant={currentAnimation === 'attack' ? 'default' : 'outline'}
                  className="w-full"
                >
                  ⚔️ ATTACK (攻击)
                </Button>
                
                <Button
                  onClick={() => handleAnimationChange('hurt')}
                  variant={currentAnimation === 'hurt' ? 'default' : 'outline'}
                  className="w-full"
                >
                  💔 HURT (受伤)
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  variant="secondary"
                  className="w-full"
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </Button>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Animation Info</h2>
              <div className="text-sm space-y-2 text-gray-300">
                <p><strong>Sprite Size:</strong> 344 x 1536 px</p>
                <p><strong>Frame Count:</strong> 8 frames</p>
                <p><strong>Format:</strong> Horizontal sprite sheet</p>
                <p><strong>Background:</strong> Transparent PNG</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="px-8"
          >
            ← Back to Game
          </Button>
        </div>
      </div>
    </div>
  );
}
