/**
 * 序列帧动画配置
 * 定义所有BOSS和敌人的动画名称映射
 */

export interface FrameAnimationMapping {
  idle: string;
  attack?: string;
  hurt?: string;
  death?: string;
}

/**
 * BOSS动画映射
 */
export const bossFrameAnimations: Record<string, FrameAnimationMapping> = {
  'fallen-priest': {
    idle: 'boss-fallen-priest-idle',
    attack: 'boss-fallen-priest-attack',
    hurt: 'boss-fallen-priest-hurt',
    death: 'boss-fallen-priest-death',
  },
  'bat-king': {
    idle: 'boss-bat-king-idle',
    attack: 'boss-bat-king-attack',
    hurt: 'boss-bat-king-hurt',
    death: 'boss-bat-king-death',
  },
  'crypt-guardian': {
    idle: 'boss-crypt-guardian-idle',
    attack: 'boss-crypt-guardian-attack',
    hurt: 'boss-crypt-guardian-hurt',
    death: 'boss-crypt-guardian-death',
  },
  'graveyard-lord': {
    idle: 'boss-graveyard-lord-idle',
    attack: 'boss-graveyard-lord-attack',
    hurt: 'boss-graveyard-lord-hurt',
    death: 'boss-graveyard-lord-death',
  },
  'zombie-king': {
    idle: 'boss-zombie-king-idle',
    attack: 'boss-zombie-king-attack',
    hurt: 'boss-zombie-king-hurt',
    death: 'boss-zombie-king-death',
  },
  'werewolf-alpha': {
    idle: 'boss-werewolf-alpha-idle',
    attack: 'boss-werewolf-alpha-attack',
    hurt: 'boss-werewolf-alpha-hurt',
    death: 'boss-werewolf-alpha-death',
  },
  'castle-commander': {
    idle: 'boss-castle-commander-idle',
    attack: 'boss-castle-commander-attack',
    hurt: 'boss-castle-commander-hurt',
    death: 'boss-castle-commander-death',
  },
  'ancient-librarian': {
    idle: 'boss-ancient-librarian-idle',
    attack: 'boss-ancient-librarian-attack',
    hurt: 'boss-ancient-librarian-hurt',
    death: 'boss-ancient-librarian-death',
  },
  'succubus': {
    idle: 'boss-succubus-idle',
    attack: 'boss-succubus-attack',
    hurt: 'boss-succubus-hurt',
    death: 'boss-succubus-death',
  },
  'vampire-king': {
    idle: 'boss-vampire-king-idle',
    attack: 'boss-vampire-king-attack',
    hurt: 'boss-vampire-king-hurt',
    death: 'boss-vampire-king-death',
  },
};

/**
 * 敌人动画映射（单状态）
 */
export const enemyFrameAnimations: Record<string, string> = {
  '01-corrupted-believer': 'enemy-01-corrupted-believer',
  '01-evil-nun': 'enemy-01-evil-nun',
  '02-tower-ghost': 'enemy-02-tower-ghost',
  '02-vampire-bat': 'enemy-02-vampire-bat',
  '03-crawling-skeleton': 'enemy-03-crawling-skeleton',
  '03-crypt-zombie': 'enemy-03-crypt-zombie',
  '04-corpse': 'enemy-04-corpse',
  '04-graveyard-wraith': 'enemy-04-graveyard-wraith',
  '05-mummy': 'enemy-05-mummy',
  '05-skeleton-warrior': 'enemy-05-skeleton-warrior',
  '05-skeleton-warrior-new': 'enemy-05-skeleton-warrior-new',
  '06-cursed-wolf': 'enemy-06-cursed-wolf',
  '06-tree-demon': 'enemy-06-tree-demon',
  '07-armor-ghost': 'enemy-07-armor-ghost',
  '07-vampire-guard': 'enemy-07-vampire-guard',
  '08-flying-book': 'enemy-08-flying-book',
  '08-ink-demon': 'enemy-08-ink-demon',
  '09-charm-rose': 'enemy-09-charm-rose',
  '09-lesser-succubus': 'enemy-09-lesser-succubus',
  '10-blood-servant': 'enemy-10-blood-servant',
  '10-elite-vampire': 'enemy-10-elite-vampire',
  'bomb-bat': 'enemy-bomb-bat',
};

/**
 * 获取BOSS动画名称
 */
export function getBossAnimationName(bossId: string, state: 'idle' | 'attack' | 'hurt' | 'death'): string | null {
  const mapping = bossFrameAnimations[bossId];
  if (!mapping) {
    console.warn(`[FrameAnimationConfig] No animation mapping for BOSS: ${bossId}`);
    return null;
  }
  return mapping[state] || mapping.idle;
}

/**
 * 获取敌人动画名称
 */
export function getEnemyAnimationName(enemyId: string): string | null {
  const animName = enemyFrameAnimations[enemyId];
  if (!animName) {
    console.warn(`[FrameAnimationConfig] No animation mapping for enemy: ${enemyId}`);
    return null;
  }
  return animName;
}

/**
 * 检查BOSS是否有序列帧动画
 */
export function hasBossFrameAnimation(bossId: string): boolean {
  return bossId in bossFrameAnimations;
}

/**
 * 检查敌人是否有序列帧动画
 */
export function hasEnemyFrameAnimation(enemyId: string): boolean {
  return enemyId in enemyFrameAnimations;
}
