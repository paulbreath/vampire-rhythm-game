// 敌人精灵动画配置
export interface AnimationStateConfig {
  path: string;
  frameCount: number;
  fps: number;
  loop: boolean;
  cols: number;
  rows: number;
}

export interface EnemySpriteConfig {
  idle: AnimationStateConfig;
  attack?: AnimationStateConfig;
}

export const enemySpriteConfigs: Record<string, EnemySpriteConfig> = {
  skeleton: {
    idle: {
      path: '/images/enemy-skeleton-idle.png?v=2',  // 版本参数绕过缓存
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/enemy-skeleton-attack.png?v=2',  // 版本参数绕过缓存
      frameCount: 8,
      fps: 12, // 攻击动画更快
      loop: false, // 攻击动画不循环，播放一次后回到idle
      cols: 4,
      rows: 2,
    },
  },
  ghost: {
    idle: {
      path: '/images/enemy-ghost-idle.png',
      frameCount: 8,
      fps: 10,
      loop: true,
      cols: 4,
      rows: 2,
    },
  },
};
