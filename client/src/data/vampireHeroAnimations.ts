/**
 * 吸血鬼主角动画配置
 * 使用生成的像素精灵图
 */

import { AnimationState } from '../lib/spriteAnimation';

/**
 * 吸血鬼主角的所有动画状态
 */
export const vampireHeroAnimations = {
  /**
   * 闲置动画 - 8帧呼吸动画
   * 精灵图尺寸：2752x1536 (8帧 × 344x1536)
   */
  idle: {
    name: 'idle',
    config: {
      frameWidth: 344,
      frameHeight: 1536,
      frameSequence: [0, 1, 2, 3, 4, 5, 6, 7], // 8帧循环
      frameRate: 8, // 8帧/秒，缓慢呼吸
      loop: true,
      direction: 'horizontal' as const
    }
  } as AnimationState,

  /**
   * 行走动画 - 8帧行走循环
   * 精灵图尺寸：2752x1536 (8帧 × 344x1536)
   */
  walk: {
    name: 'walk',
    config: {
      frameWidth: 344,
      frameHeight: 1536,
      frameSequence: [0, 1, 2, 3, 4, 5, 6, 7], // 8帧行走循环
      frameRate: 12, // 12帧/秒，流畅行走
      loop: true,
      direction: 'horizontal' as const
    }
  } as AnimationState,

  /**
   * 攻击动画 - 6帧双武器攻击
   * 精灵图尺寸：2752x1536 (6帧 × 458x1536)
   */
  attack: {
    name: 'attack',
    config: {
      frameWidth: 458,
      frameHeight: 1536,
      frameSequence: [0, 1, 2, 3, 4, 5], // 6帧攻击序列
      frameRate: 15, // 15帧/秒，快速攻击
      loop: false, // 不循环，播放一次
      direction: 'horizontal' as const
    }
  } as AnimationState,

  /**
   * 受击动画 - 4帧受击反应
   * 精灵图尺寸：2752x1536 (4帧 × 688x1536)
   */
  hurt: {
    name: 'hurt',
    config: {
      frameWidth: 688,
      frameHeight: 1536,
      frameSequence: [0, 1, 2, 3], // 4帧受击序列
      frameRate: 12, // 12帧/秒
      loop: false, // 不循环
      direction: 'horizontal' as const
    }
  } as AnimationState,

  /**
   * 死亡动画 - 8帧死亡序列
   * 精灵图尺寸：2752x1536 (8帧 × 344x1536)
   */
  death: {
    name: 'death',
    config: {
      frameWidth: 344,
      frameHeight: 1536,
      frameSequence: [0, 1, 2, 3, 4, 5, 6, 7], // 8帧死亡序列
      frameRate: 10, // 10帧/秒，缓慢死亡
      loop: false, // 不循环，停在最后一帧
      direction: 'horizontal' as const
    }
  } as AnimationState,
};

/**
 * 精灵图路径配置（使用v2版本）
 */
export const vampireHeroSprites = {
  idle: '/images/vampire-hero-idle-v3.png',
  walk: '/images/vampire-hero-walk-v3.png',
  attack: '/images/vampire-hero-attack-v2.png',
  hurt: '/images/vampire-hero-hurt-v2.png',
  death: '/images/vampire-hero-death-v2.png',
};

/**
 * 预加载所有精灵图
 */
export async function preloadVampireHeroSprites(): Promise<Map<string, HTMLImageElement>> {
  const images = new Map<string, HTMLImageElement>();
  
  const loadPromises = Object.entries(vampireHeroSprites).map(([key, path]) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        images.set(key, img);
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load sprite: ${path}`));
      };
      img.src = path;
    });
  });

  await Promise.all(loadPromises);
  return images;
}
