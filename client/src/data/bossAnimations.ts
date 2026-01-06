// BOSS精灵动画配置
export interface BossSpriteConfig {
  idle: {
    path: string;
    frameCount: number;
    fps: number;
    loop: boolean;
    cols: number;
    rows: number;
  };
}

export const bossSpriteConfigs: Record<string, BossSpriteConfig> = {
  bat_king: {
    idle: {
      path: '/images/boss-bat-king-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
  },
  zombie_king: {
    idle: {
      path: '/images/boss-zombie-king-idle.png',
      frameCount: 8,
      fps: 6,
      loop: true,
      cols: 4,
      rows: 2,
    },
  },
  alchemist_ghost: {
    idle: {
      path: '/images/boss-alchemist-ghost-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
  },
};
