// BOSS动画配置
export interface BossSpriteConfig {
  idle: {
    path: string;
    frameCount: number;
    fps: number;
    loop: boolean;
    cols: number;
    rows: number;
    frameWidth?: number;
    frameHeight?: number;
  };
  attack?: {
    path: string;
    frameCount: number;
    fps: number;
    loop: boolean;
    cols: number;
    rows: number;
    frameWidth?: number;
    frameHeight?: number;
  };
  hurt?: {
    path: string;
    frameCount: number;
    fps: number;
    loop: boolean;
    cols: number;
    rows: number;
    frameWidth?: number;
    frameHeight?: number;
  };
  death?: {
    path: string;
    frameCount: number;
    fps: number;
    loop: boolean;
    cols: number;
    rows: number;
    frameWidth?: number;
    frameHeight?: number;
  };
}

export const BOSS_ANIMATION_CONFIGS: Record<string, BossSpriteConfig> = {
  'fallen-priest': {
    idle: {
      path: '/images/boss-fallen-priest-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-fallen-priest-attack.png',
      frameCount: 8,
      fps: 12,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-fallen-priest-hurt.png',
      frameCount: 6,
      fps: 10,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-fallen-priest-death.png',
      frameCount: 8,
      fps: 8,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  'bat-king': {
    idle: {
      path: '/images/boss-bat-king-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-bat-king-attack.png',
      frameCount: 8,
      fps: 12,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-bat-king-hurt.png',
      frameCount: 6,
      fps: 10,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-bat-king-death.png',
      frameCount: 8,
      fps: 8,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  'crypt-guardian': {
    idle: {
      path: '/images/boss-crypt-guardian-idle.png',
      frameCount: 8,
      fps: 6,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-crypt-guardian-attack.png',
      frameCount: 8,
      fps: 10,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-crypt-guardian-hurt.png',
      frameCount: 6,
      fps: 10,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-crypt-guardian-death.png',
      frameCount: 8,
      fps: 8,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  'graveyard-lord': {
    idle: {
      path: '/images/boss-graveyard-lord-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-graveyard-lord-attack.png',
      frameCount: 8,
      fps: 12,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-graveyard-lord-hurt.png',
      frameCount: 6,
      fps: 10,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-graveyard-lord-death.png',
      frameCount: 8,
      fps: 8,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  'zombie-king': {
    idle: {
      path: '/images/boss-zombie-king-idle.png',
      frameCount: 8,
      fps: 6,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-zombie-king-attack.png',
      frameCount: 8,
      fps: 10,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-zombie-king-hurt.png',
      frameCount: 6,
      fps: 10,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-zombie-king-death.png',
      frameCount: 8,
      fps: 8,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  'werewolf-alpha': {
    idle: {
      path: '/images/boss-werewolf-alpha-idle.png',
      frameCount: 8,
      fps: 10,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-werewolf-alpha-attack.png',
      frameCount: 8,
      fps: 15,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-werewolf-alpha-hurt.png',
      frameCount: 6,
      fps: 12,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-werewolf-alpha-death.png',
      frameCount: 8,
      fps: 8,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  'castle-commander': {
    idle: {
      path: '/images/boss-castle-commander-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-castle-commander-attack.png',
      frameCount: 8,
      fps: 12,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-castle-commander-hurt.png',
      frameCount: 6,
      fps: 10,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-castle-commander-death.png',
      frameCount: 8,
      fps: 8,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  'ancient-librarian': {
    idle: {
      path: '/images/boss-ancient-librarian-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-ancient-librarian-attack.png',
      frameCount: 8,
      fps: 12,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-ancient-librarian-hurt.png',
      frameCount: 6,
      fps: 10,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-ancient-librarian-death.png',
      frameCount: 8,
      fps: 8,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  'succubus': {
    idle: {
      path: '/images/boss-succubus-idle.png',
      frameCount: 8,
      fps: 10,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-succubus-attack.png',
      frameCount: 8,
      fps: 15,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-succubus-hurt.png',
      frameCount: 6,
      fps: 12,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-succubus-death.png',
      frameCount: 8,
      fps: 10,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  'vampire-king': {
    idle: {
      path: '/images/boss-vampire-king-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/boss-vampire-king-attack.png',
      frameCount: 8,
      fps: 12,
      loop: false,
      cols: 4,
      rows: 2,
    },
    hurt: {
      path: '/images/boss-vampire-king-hurt.png',
      frameCount: 6,
      fps: 10,
      loop: false,
      cols: 3,
      rows: 2,
    },
    death: {
      path: '/images/boss-vampire-king-death.png',
      frameCount: 8,
      fps: 8,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
};

// 辅助函数：获取BOSS动画配置
export function getBossAnimationConfig(bossType: string): BossSpriteConfig | undefined {
  return BOSS_ANIMATION_CONFIGS[bossType];
}

// 辅助函数：获取BOSS特定状态的动画配置
export function getBossAnimationState(
  bossType: string,
  state: 'idle' | 'attack' | 'hurt' | 'death'
): BossSpriteConfig[keyof BossSpriteConfig] | undefined {
  const config = BOSS_ANIMATION_CONFIGS[bossType];
  return config?.[state];
}
