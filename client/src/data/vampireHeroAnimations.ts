/**
 * Alucard主角动画配置
 * 精灵图布局: 2行 × 4列 (8帧)
 * 每帧尺寸: 688x768像素
 * 总尺寸: 2752x1536像素
 */

import type { AnimationState } from '../lib/spriteAnimation';

/**
 * 将2D网格坐标(行,列)转换为帧序号
 * @param row 行号 (0-1)
 * @param col 列号 (0-3)
 * @returns 帧序号 (0-7)
 */
function gridToFrame(row: number, col: number): number {
  return row * 4 + col;
}

/**
 * 精灵图路径配置
 */
export const vampireHeroSprites = {
  idle: '/images/alucard-idle-final.png',
  walk: '/images/alucard-walk-final.png',
  attack: '/images/alucard-attack-final.png',
  hurt: '/images/alucard-hurt-final.png',
  death: '/images/alucard-death-final.png',
};

/**
 * 动画状态配置
 */
export const vampireHeroAnimations: Record<string, AnimationState> = {
  idle: {
    name: 'idle',
    config: {
      frameWidth: 688,
      frameHeight: 768,
      frameSequence: [
        gridToFrame(0, 0), // 第1行第1列
        gridToFrame(0, 1), // 第1行第2列
        gridToFrame(0, 2), // 第1行第3列
        gridToFrame(0, 3), // 第1行第4列
        gridToFrame(1, 0), // 第2行第1列
        gridToFrame(1, 1), // 第2行第2列
        gridToFrame(1, 2), // 第2行第3列
        gridToFrame(1, 3), // 第2行第4列
      ],
      frameRate: 8, // 8帧/秒，缓慢呼吸
      loop: true,
      direction: 'horizontal', // 横向排列
      columns: 4, // 2行4列网格布局
    },
  },

  walk: {
    name: 'walk',
    config: {
      frameWidth: 688,
      frameHeight: 768,
      frameSequence: [
        gridToFrame(0, 0),
        gridToFrame(0, 1),
        gridToFrame(0, 2),
        gridToFrame(0, 3),
        gridToFrame(1, 0),
        gridToFrame(1, 1),
        gridToFrame(1, 2),
        gridToFrame(1, 3),
      ],
      frameRate: 10, // 10帧/秒，流畅行走
      loop: true,
      direction: 'horizontal',
      columns: 4, // 2行4列网格布局
    },
  },

  attack: {
    name: 'attack',
    config: {
      frameWidth: 688,
      frameHeight: 768,
      frameSequence: [
        gridToFrame(0, 0),
        gridToFrame(0, 1),
        gridToFrame(0, 2),
        gridToFrame(0, 3),
        gridToFrame(1, 0),
        gridToFrame(1, 1),
      ],
      frameRate: 12, // 12帧/秒，快速攻击
      loop: false, // 攻击动画不循环
      direction: 'horizontal',
      columns: 4, // 2行4列网格布局
    },
  },

  hurt: {
    name: 'hurt',
    config: {
      frameWidth: 688,
      frameHeight: 768,
      frameSequence: [
        gridToFrame(0, 0),
        gridToFrame(0, 1),
        gridToFrame(0, 2),
        gridToFrame(0, 3),
        gridToFrame(1, 0),
      ],
      frameRate: 10, // 10帧/秒
      loop: false, // 受伤动画不循环
      direction: 'horizontal',
      columns: 4, // 2行4列网格布局
    },
  },

  death: {
    name: 'death',
    config: {
      frameWidth: 688,
      frameHeight: 768,
      frameSequence: [
        gridToFrame(0, 0),
        gridToFrame(0, 1),
        gridToFrame(0, 2),
        gridToFrame(0, 3),
        gridToFrame(1, 0),
        gridToFrame(1, 1),
        gridToFrame(1, 2),
        gridToFrame(1, 3),
      ],
      frameRate: 6, // 6帧/秒，慢速死亡
      loop: false, // 死亡动画不循环
      direction: 'horizontal',
      columns: 4, // 2行4列网格布局
    },
  },
};
