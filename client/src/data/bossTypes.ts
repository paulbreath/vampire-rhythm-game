/**
 * BOSS类型配置
 * 
 * 包含10个BOSS的完整配置信息：
 * - 基础属性（名称、速度、尺寸）
 * - 战斗属性（血量、攻击力、护卫数量）
 * - 视觉属性（颜色、动画）
 * 
 * 参考：CHARACTER_SIZE_DESIGN.md
 * 尺寸梯度：BOSS是主角的2-3倍（720-1000px高度）
 */

import { type SizeType } from './sizeConfig';

export type BossType =
  | 'fallen-priest'
  | 'bat-king'
  | 'crypt-guardian'
  | 'graveyard-lord'
  | 'zombie-king'
  | 'werewolf-alpha'
  | 'castle-commander'
  | 'ancient-librarian'
  | 'succubus'
  | 'vampire-king';

export interface BossConfig {
  id: string;
  type: BossType;
  name: string;
  nameZh: string;
  speed: number;
  sizeType: SizeType;
  color: string;
  health: number;
  damage: number;
  guardCount: number; // 初始护卫（炸弹蝙蝠）数量（已废弃，改为召唤技能）
  description: string;
  spriteSheet: {
    idle: string;
    attack: string;
    hurt: string;
    death: string;
  };
  // BOSS召唤技能配置
  summonInterval: number; // 召唤间隔（毫秒）
  summonCount: number; // 每次召唤的数量
}

/**
 * 10个BOSS配置数据
 */
export const BOSS_TYPES: Record<BossType, BossConfig> = {
  'fallen-priest': {
    id: 'fallen-priest',
    type: 'fallen-priest',
    name: 'Fallen Priest',
    nameZh: '堕落牧师',
    speed: 1.0,
    sizeType: 'small',
    color: '#4B0082',
    health: 4000,
    damage: 20,
    guardCount: 1,
    description: '手持镰刀的骷髅死神，教堂的堕落守护者',
    spriteSheet: {
      idle: '/boss-characters/boss-fallen-priest-render-pixel-processed.png',
      attack: '/boss-characters/boss-fallen-priest-render-pixel-processed.png',
      hurt: '/boss-characters/boss-fallen-priest-render-pixel-processed.png',
      death: '/boss-characters/boss-fallen-priest-render-pixel-processed.png',
    },
    summonInterval: 8000,
    summonCount: 1,
  },

  'bat-king': {
    id: 'bat-king',
    type: 'bat-king',
    name: 'Bat King',
    nameZh: '蝙蝠之王',
    speed: 1.5,
    sizeType: 'small',
    color: '#8B00FF',
    health: 4500,
    damage: 25,
    guardCount: 2,
    description: '拥有双头的紫色恶魔王，力量强大',
    spriteSheet: {
      idle: '/boss-characters/boss-bat-king-render-pixel-processed.png',
      attack: '/boss-characters/boss-bat-king-render-pixel-processed.png',
      hurt: '/boss-characters/boss-bat-king-render-pixel-processed.png',
      death: '/boss-characters/boss-bat-king-render-pixel-processed.png',
    },
    summonInterval: 7000,
    summonCount: 2,
  },

  'crypt-guardian': {
    id: 'crypt-guardian',
    type: 'crypt-guardian',
    name: 'Crypt Guardian',
    nameZh: '墓穴守卫',
    speed: 0.8,
    sizeType: 'medium',
    color: '#708090',
    health: 5000,
    damage: 30,
    guardCount: 2,
    description: '巨大的石头巨人，墓穴的永恒守护者',
    spriteSheet: {
      idle: '/boss-characters/boss-crypt-guardian-render-pixel-processed.png',
      attack: '/boss-characters/boss-crypt-guardian-render-pixel-processed.png',
      hurt: '/boss-characters/boss-crypt-guardian-render-pixel-processed.png',
      death: '/boss-characters/boss-crypt-guardian-render-pixel-processed.png',
    },
    summonInterval: 9000,
    summonCount: 2,
  },

  'graveyard-lord': {
    id: 'graveyard-lord',
    type: 'graveyard-lord',
    name: 'Graveyard Lord',
    nameZh: '墓地领主',
    speed: 1.2,
    sizeType: 'medium',
    color: '#00FF00',
    health: 5500,
    damage: 35,
    guardCount: 3,
    description: '燃烧着绿色火焰的骷髅法师，亡灵魔法的主宰',
    spriteSheet: {
      idle: '/boss-characters/boss-graveyard-lord-render-pixel-processed.png',
      attack: '/boss-characters/boss-graveyard-lord-render-pixel-processed.png',
      hurt: '/boss-characters/boss-graveyard-lord-render-pixel-processed.png',
      death: '/boss-characters/boss-graveyard-lord-render-pixel-processed.png',
    },
    summonInterval: 8000,
    summonCount: 3,
  },

  'zombie-king': {
    id: 'zombie-king',
    type: 'zombie-king',
    name: 'Zombie King',
    nameZh: '僵尸之王',
    speed: 1.0,
    sizeType: 'large',
    color: '#2F4F2F',
    health: 6000,
    damage: 40,
    guardCount: 3,
    description: '手持狼牙棒的骷髅战士，墓地的统治者',
    spriteSheet: {
      idle: '/boss-characters/boss-shadow-dragon-render-pixel-processed.png',
      attack: '/boss-characters/boss-shadow-dragon-render-pixel-processed.png',
      hurt: '/boss-characters/boss-shadow-dragon-render-pixel-processed.png',
      death: '/boss-characters/boss-shadow-dragon-render-pixel-processed.png',
    },
    summonInterval: 7500,
    summonCount: 3,
  },

  'werewolf-alpha': {
    id: 'werewolf-alpha',
    type: 'werewolf-alpha',
    name: 'Werewolf Alpha',
    nameZh: '狼人首领',
    speed: 1.8,
    sizeType: 'large',
    color: '#C0C0C0',
    health: 6500,
    damage: 45,
    guardCount: 4,
    description: '白色的狼人首领，速度极快的野兽',
    spriteSheet: {
      idle: '/boss-characters/boss-alchemist-ghost-render-pixel-processed.png',
      attack: '/boss-characters/boss-alchemist-ghost-render-pixel-processed.png',
      hurt: '/boss-characters/boss-alchemist-ghost-render-pixel-processed.png',
      death: '/boss-characters/boss-alchemist-ghost-render-pixel-processed.png',
    },
    summonInterval: 6000,
    summonCount: 4,
  },

  'castle-commander': {
    id: 'castle-commander',
    type: 'castle-commander',
    name: 'Castle Commander',
    nameZh: '城堡统帅',
    speed: 1.3,
    sizeType: 'large',
    color: '#2F4F4F',
    health: 7000,
    damage: 50,
    guardCount: 4,
    description: '身穿黑色铠甲的骑士统帅，城堡的最强战士',
    spriteSheet: {
      idle: '/boss-characters/boss-castle-commander-render-pixel-processed.png',
      attack: '/boss-characters/boss-castle-commander-render-pixel-processed.png',
      hurt: '/boss-characters/boss-castle-commander-render-pixel-processed.png',
      death: '/boss-characters/boss-castle-commander-render-pixel-processed.png',
    },
    summonInterval: 7000,
    summonCount: 4,
  },

  'ancient-librarian': {
    id: 'ancient-librarian',
    type: 'ancient-librarian',
    name: 'Ancient Librarian',
    nameZh: '古代图书管理员',
    speed: 1.0,
    sizeType: 'large',
    color: '#4682B4',
    health: 7500,
    damage: 55,
    guardCount: 5,
    description: '白发苍苍的古代贤者，掌握着禁忌魔法',
    spriteSheet: {
      idle: '/boss-characters/boss-ancient-librarian-render-pixel-processed.png',
      attack: '/boss-characters/boss-ancient-librarian-render-pixel-processed.png',
      hurt: '/boss-characters/boss-ancient-librarian-render-pixel-processed.png',
      death: '/boss-characters/boss-ancient-librarian-render-pixel-processed.png',
    },
    summonInterval: 6500,
    summonCount: 5,
  },

  'succubus': {
    id: 'succubus',
    type: 'succubus',
    name: 'Succubus Queen',
    nameZh: '魅魔女王',
    speed: 1.5,
    sizeType: 'xlarge',
    color: '#9370DB',
    health: 8000,
    damage: 60,
    guardCount: 5,
    description: '紫色的魅魔女王，诱惑与毁灭的化身',
    spriteSheet: {
      idle: '/boss-characters/boss-succubus-queen-render-pixel-processed.png',
      attack: '/boss-characters/boss-succubus-queen-render-pixel-processed.png',
      hurt: '/boss-characters/boss-succubus-queen-render-pixel-processed.png',
      death: '/boss-characters/boss-succubus-queen-render-pixel-processed.png',
    },
    summonInterval: 6000,
    summonCount: 5,
  },

  'vampire-king': {
    id: 'vampire-king',
    type: 'vampire-king',
    name: 'Vampire King',
    nameZh: '吸血鬼之王',
    speed: 1.5,
    sizeType: 'xlarge',
    color: '#8B0000',
    health: 10000,
    damage: 80,
    guardCount: 6,
    description: '白发的吸血鬼之王，城堡的最终BOSS',
    spriteSheet: {
      idle: '/boss-characters/boss-vampire-king-render-pixel-processed.png',
      attack: '/boss-characters/boss-vampire-king-render-pixel-processed.png',
      hurt: '/boss-characters/boss-vampire-king-render-pixel-processed.png',
      death: '/boss-characters/boss-vampire-king-render-pixel-processed.png',
    },
    summonInterval: 5000,
    summonCount: 6,
  },
};

/**
 * 根据关卡获取BOSS类型
 */
export function getBossTypeByStage(stage: number): BossType | null {
  const bossStages: Record<number, BossType> = {
    3: 'fallen-priest',
    6: 'bat-king',
    9: 'crypt-guardian',
    12: 'graveyard-lord',
    15: 'zombie-king',
    18: 'werewolf-alpha',
    21: 'castle-commander',
    24: 'ancient-librarian',
    27: 'succubus',
    30: 'vampire-king',
  };

  return bossStages[stage] || null;
}

/**
 * 获取BOSS配置
 */
export function getBossConfig(type: BossType): BossConfig {
  return BOSS_TYPES[type];
}

/**
 * 根据地图ID获取BOSS（兼容旧代码）
 */
export function getBossForMap(mapId: string): BossConfig | null {
  // 从mapId提取关卡号（例如："church-stage-3" -> 3）
  const match = mapId.match(/stage-(\d+)/);
  if (!match) return null;
  
  const stage = parseInt(match[1]);
  const bossType = getBossTypeByStage(stage);
  
  return bossType ? BOSS_TYPES[bossType] : null;
}

/**
 * 判断关卡是否有BOSS
 */
export function hasBoss(stage: number): boolean {
  return getBossTypeByStage(stage) !== null;
}
