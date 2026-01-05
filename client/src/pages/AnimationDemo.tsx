/**
 * 吸血鬼主角动画演示页面
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { SpriteAnimation } from '../lib/spriteAnimation';
import { vampireHeroAnimations, vampireHeroSprites, preloadVampireHeroSprites } from '../data/vampireHeroAnimations';

export function AnimationDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<SpriteAnimation | null>(null);
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const [sprites, setSprites] = useState<Map<string, HTMLImageElement>>(new Map());
  const [currentAnimation, setCurrentAnimation] = useState<'idle' | 'walk' | 'attack' | 'hurt' | 'death'>('idle');
  const lastTimeRef = useRef<number>(0);

  // 预加载所有精灵图
  useEffect(() => {
    void preloadVampireHeroSprites()
      .then((loadedSprites) => {
        setSprites(loadedSprites);
        setSpritesLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load vampire hero sprites:', error);
      });
  }, []);

  // 初始化动画
  useEffect(() => {
    if (!spritesLoaded || !sprites.size) return;

    const idleImage = sprites.get('idle');
    if (!idleImage) return;

    animationRef.current = new SpriteAnimation(
      idleImage,
      vampireHeroAnimations.idle
    );
  }, [spritesLoaded, sprites]);

  // 切换动画
  useEffect(() => {
    if (!animationRef.current || !spritesLoaded) return;

    const animationState = vampireHeroAnimations[currentAnimation];
    const spriteImage = sprites.get(currentAnimation);

    if (animationState && spriteImage) {
      animationRef.current = new SpriteAnimation(spriteImage, animationState);
    }
  }, [currentAnimation, spritesLoaded, sprites]);

  // 渲染循环
  useEffect(() => {
    if (!spritesLoaded || !animationRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = (currentTime: number) => {
      const dt = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新并渲染动画
      if (animationRef.current) {
        animationRef.current.update(dt);
        // 根据实际帧尺寸调整缩放比例（344x1536 → 约100x450）
        animationRef.current.render(ctx, 200, 50, 0.3, false);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [spritesLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-red-900 to-black text-white p-8">
      {/* 返回按钮 */}
      <Link href="/">
        <button className="mb-8 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-pixel text-xl transition-colors">
          ← BACK
        </button>
      </Link>

      <div className="container mx-auto">
        <h1 className="text-5xl font-pixel text-center mb-8 text-yellow-400">
          VAMPIRE HERO ANIMATIONS
        </h1>

        {/* Canvas显示区域 */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/50 p-8 rounded-lg border-4 border-yellow-600">
            {spritesLoaded ? (
              <canvas
                ref={canvasRef}
                width={600}
                height={500}
                style={{
                  imageRendering: 'pixelated',
                }}
                className="bg-gradient-to-b from-purple-800/30 to-black/30"
              />
            ) : (
              <div className="w-[600px] h-[400px] flex items-center justify-center text-2xl font-pixel">
                LOADING SPRITES...
              </div>
            )}
          </div>
        </div>

        {/* 动画控制按钮 */}
        <div className="flex justify-center gap-4 flex-wrap">
          {(['idle', 'walk', 'attack', 'hurt', 'death'] as const).map((anim) => (
            <button
              key={anim}
              onClick={() => setCurrentAnimation(anim)}
              className={`px-8 py-4 font-pixel text-xl rounded-lg transition-all ${
                currentAnimation === anim
                  ? 'bg-yellow-600 text-black scale-110'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {anim.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 动画信息 */}
        <div className="mt-12 bg-black/50 p-6 rounded-lg border-2 border-yellow-600/50 max-w-2xl mx-auto">
          <h2 className="text-2xl font-pixel text-yellow-400 mb-4">ANIMATION INFO</h2>
          <div className="space-y-2 font-pixel text-lg">
            <p><span className="text-yellow-400">Current:</span> {currentAnimation.toUpperCase()}</p>
            <p><span className="text-yellow-400">Frame Count:</span> {vampireHeroAnimations[currentAnimation].config.frameSequence.length}</p>
            <p><span className="text-yellow-400">Frame Rate:</span> {vampireHeroAnimations[currentAnimation].config.frameRate} FPS</p>
            <p><span className="text-yellow-400">Loop:</span> {vampireHeroAnimations[currentAnimation].config.loop ? 'YES' : 'NO'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
