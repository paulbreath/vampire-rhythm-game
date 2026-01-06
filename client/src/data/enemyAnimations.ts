// 敌人精灵动画配置
export interface EnemySpriteConfig {
  idle: {
    path: string;
    frameCount: number;
    fps: number;
    loop: boolean;
    cols: number;
    rows: number;
  };
}

export const enemySpriteConfigs: Record<string, EnemySpriteConfig> = {
  skeleton: {
    idle: {
      path: '/images/enemy-skeleton-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
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
