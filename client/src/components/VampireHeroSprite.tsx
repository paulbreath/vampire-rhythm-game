import { useEffect, useRef, useState } from 'react';
import { SpriteAnimation } from '../lib/spriteAnimation';
import { vampireHeroAnimations, preloadVampireHeroSprites } from '../data/vampireHeroAnimations';

interface VampireHeroSpriteProps {
  /** 当前动画状态 */
  animation?: 'idle' | 'walk' | 'attack' | 'hurt' | 'death';
  /** 显示宽度（像素） */
  width?: number;
  /** 显示高度（像素） */
  height?: number;
  /** 是否水平翻转 */
  flipX?: boolean;
  /** 额外的CSS类名 */
  className?: string;
  /** 动画播放完成回调（仅对非循环动画有效） */
  onAnimationComplete?: () => void;
}

/**
 * 吸血鬼主角精灵组件
 * 用于在游戏场景中渲染主角角色动画
 */
export function VampireHeroSprite({
  animation = 'idle',
  width = 200,
  height = 300,
  flipX = false,
  className = '',
  onAnimationComplete
}: VampireHeroSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<SpriteAnimation | null>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement> | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const [isLoaded, setIsLoaded] = useState(false);

  // 预加载精灵图
  useEffect(() => {
    let mounted = true;
    let animationFrameId: number;

    preloadVampireHeroSprites()
      .then((images) => {
        if (!mounted) return;

        imagesRef.current = images;

        // 创建初始动画实例
        const initialImage = images.get(animation);
        if (!initialImage) {
          console.error('Failed to get initial image for animation:', animation);
          return;
        }

        const initialState = vampireHeroAnimations[animation];
        animationRef.current = new SpriteAnimation(initialImage, initialState);

        console.log('VampireHeroSprite: Animation loaded', animation, initialImage.width, 'x', initialImage.height);

        setIsLoaded(true);

        // 开始渲染循环
        const render = () => {
          if (!mounted) return;

          const canvas = canvasRef.current;
          const anim = animationRef.current;
          if (!canvas || !anim) {
            animationFrameId = requestAnimationFrame(render);
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            animationFrameId = requestAnimationFrame(render);
            return;
          }

          // 计算delta time
          const now = Date.now();
          const dt = (now - lastTimeRef.current) / 1000; // 转换为秒
          lastTimeRef.current = now;

          // 更新动画
          anim.update(dt);

          // 清空画布
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 计算缩放比例以适配容器
          const state = vampireHeroAnimations[animation];
          const scaleX = width / state.config.frameWidth;
          const scaleY = height / state.config.frameHeight;
          const scale = Math.min(scaleX, scaleY);

          // 计算居中位置
          const x = (width - state.config.frameWidth * scale) / 2;
          const y = (height - state.config.frameHeight * scale) / 2;

          // 渲染动画
          anim.render(ctx, x, y, scale, flipX);

          // 检查动画是否完成
          if (anim.isAnimationFinished() && onAnimationComplete) {
            onAnimationComplete();
          }

          animationFrameId = requestAnimationFrame(render);
        };

        // 立即开始渲染
        animationFrameId = requestAnimationFrame(render);
      })
      .catch((error) => {
        console.error('Failed to load vampire hero sprites:', error);
      });

    return () => {
      mounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // 只在组件挂载时执行一次

  // 切换动画
  useEffect(() => {
    if (!isLoaded || !imagesRef.current) return;

    const newImage = imagesRef.current.get(animation);
    if (!newImage) return;

    const newState = vampireHeroAnimations[animation];
    
    // 创建新的动画实例
    animationRef.current = new SpriteAnimation(newImage, newState);
    lastTimeRef.current = Date.now(); // 重置时间
  }, [animation, isLoaded]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        imageRendering: 'pixelated',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'transparent',
      }}
    />
  );
}
