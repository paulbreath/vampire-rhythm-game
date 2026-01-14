// 新装备数据配置 - 围绕音乐节奏+消除玩法设计
import { Weapon, Armor, DropConfig } from '../types/equipment';

// ========== 武器数据 ==========
export const WEAPONS: Weapon[] = [
  // 匕首 - 新手武器
  {
    id: 'dagger',
    name: 'Dagger',
    nameZh: '匕首',
    type: 'dagger',
    rarity: 'common',
    icon: '🗡️',
    description: '轻巧的匕首，攻击轨迹为细线，适合精准打击。',
    config: {
      trailType: 'single_line',
      lineWidth: 2,
      color: '#ffffff',
      damage: 1
    },
    unlockCondition: { type: 'default' }
  },
  
  // 双剑 - 扩大攻击范围
  {
    id: 'dual_swords',
    name: 'Dual Swords',
    nameZh: '双剑',
    type: 'dual_swords',
    rarity: 'rare',
    icon: '⚔️',
    description: '双手持剑，攻击轨迹为双线，大幅扩大攻击范围。',
    config: {
      trailType: 'dual_line',
      lineWidth: 3,
      color: '#FFD700', // 金黄色
      dualLineSpacing: 50,
      damage: 1
    },
    unlockCondition: { type: 'level', value: 5 }
  },
  
  // 链锤 - 粗线攻击
  {
    id: 'flail',
    name: 'Flail',
    nameZh: '链锤',
    type: 'flail',
    rarity: 'epic',
    icon: '🔨',
    description: '沉重的链锤，攻击轨迹为粗线，范围更大。',
    config: {
      trailType: 'thick_line',
      lineWidth: 8,
      color: '#FF8C00', // 橙色
      damage: 1
    },
    unlockCondition: { type: 'level', value: 10 }
  },
  
  // 巨剑 - 超粗线攻击
  {
    id: 'greatsword',
    name: 'Greatsword',
    nameZh: '巨剑',
    type: 'greatsword',
    rarity: 'epic',
    icon: '⚔️',
    description: '巨大的双手剑，攻击轨迹为超粗线，最大攻击范围。',
    config: {
      trailType: 'ultra_thick',
      lineWidth: 15,
      color: '#FF4500', // 红橙色
      damage: 2
    },
    unlockCondition: { type: 'level', value: 15 }
  },
  
  // 鞭子 - 波浪线攻击
  {
    id: 'whip',
    name: 'Vampire Killer',
    nameZh: '吸血鬼杀手',
    type: 'whip',
    rarity: 'legendary',
    icon: '🪢',
    description: '传说中的圣鞭，攻击轨迹为波浪线，可击中更多敌人。',
    config: {
      trailType: 'wave_line',
      lineWidth: 5,
      color: '#9370DB', // 紫色
      damage: 2
    },
    unlockCondition: { type: 'stage', value: 7 }
  },
  
  // 镰刀 - 弧形线攻击
  {
    id: 'scythe',
    name: "Death's Scythe",
    nameZh: '死神镰刀',
    type: 'scythe',
    rarity: 'legendary',
    icon: '🪓',
    description: '死神的镰刀，攻击轨迹为弧形线，横扫一切。',
    config: {
      trailType: 'arc_line',
      lineWidth: 10,
      color: '#8B0000', // 深红色
      damage: 3
    },
    unlockCondition: { type: 'stage', value: 10 }
  }
];

// ========== 防具数据 ==========
export const ARMORS: Armor[] = [
  // 布甲 - 新手防具
  {
    id: 'cloth_armor',
    name: 'Cloth Armor',
    nameZh: '布甲',
    type: 'cloth',
    rarity: 'common',
    icon: '👕',
    description: '简单的布制护甲，提供基础防护。',
    hpBonus: 1, // 3+1=4心
    unlockCondition: { type: 'default' }
  },
  
  // 皮甲
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    nameZh: '皮甲',
    type: 'leather',
    rarity: 'common',
    icon: '🦺',
    description: '坚韧的皮革护甲，增加生命上限。',
    hpBonus: 2, // 3+2=5心
    unlockCondition: { type: 'level', value: 3 }
  },
  
  // 锁甲
  {
    id: 'chain_mail',
    name: 'Chain Mail',
    nameZh: '锁甲',
    type: 'chain',
    rarity: 'rare',
    icon: '🛡️',
    description: '精密编织的锁子甲，大幅增加生命上限。',
    hpBonus: 3, // 3+3=6心
    unlockCondition: { type: 'level', value: 8 }
  },
  
  // 板甲
  {
    id: 'plate_armor',
    name: 'Plate Armor',
    nameZh: '板甲',
    type: 'plate',
    rarity: 'epic',
    icon: '🛡️',
    description: '厚重的板甲，提供强大的防护。',
    hpBonus: 5, // 3+5=8心
    unlockCondition: { type: 'level', value: 15 }
  },
  
  // 传说护甲
  {
    id: 'legendary_armor',
    name: "Dracula's Cloak",
    nameZh: '德古拉斗篷',
    type: 'legendary',
    rarity: 'legendary',
    icon: '🧥',
    description: '德古拉伯爵的斗篷，拥有恐怖的防护力。',
    hpBonus: 7, // 3+7=10心
    unlockCondition: { type: 'stage', value: 10 }
  }
];

// ========== 装备掉落配置 ==========
export const DROP_CONFIGS: DropConfig[] = [
  // 普通敌人掉落
  {
    enemyType: 'bat_blue',
    dropChance: 0.05, // 5%概率
    possibleDrops: ['cloth_armor', 'leather_armor']
  },
  {
    enemyType: 'bat_purple',
    dropChance: 0.08,
    possibleDrops: ['dual_swords', 'chain_mail']
  },
  {
    enemyType: 'skeleton',
    dropChance: 0.10,
    possibleDrops: ['flail', 'chain_mail']
  },
  {
    enemyType: 'ghost',
    dropChance: 0.10,
    possibleDrops: ['dual_swords', 'leather_armor']
  },
  {
    enemyType: 'werewolf',
    dropChance: 0.12,
    possibleDrops: ['greatsword', 'plate_armor']
  },
  
  // BOSS掉落（100%掉落稀有装备）
  {
    enemyType: 'vampire',
    dropChance: 1.0,
    possibleDrops: ['whip', 'scythe', 'legendary_armor']
  }
];

// ========== 稀有度配置 ==========
export const RARITY_CONFIG = {
  common: {
    color: '#9CA3AF',    // 灰色
    nameZh: '普通',
    glow: 'rgba(156, 163, 175, 0.3)'
  },
  rare: {
    color: '#3B82F6',    // 蓝色
    nameZh: '稀有',
    glow: 'rgba(59, 130, 246, 0.5)'
  },
  epic: {
    color: '#A855F7',    // 紫色
    nameZh: '史诗',
    glow: 'rgba(168, 85, 247, 0.6)'
  },
  legendary: {
    color: '#F59E0B',    // 橙色
    nameZh: '传说',
    glow: 'rgba(245, 158, 11, 0.8)'
  }
};

// ========== 辅助函数 ==========

// 获取武器by ID
export function getWeaponById(id: string): Weapon | undefined {
  return WEAPONS.find(w => w.id === id);
}

// 获取防具by ID
export function getArmorById(id: string): Armor | undefined {
  return ARMORS.find(a => a.id === id);
}

// 获取默认武器
export function getDefaultWeapon(): Weapon {
  return WEAPONS[0]; // 匕首
}

// 获取默认防具
export function getDefaultArmor(): Armor {
  return ARMORS[0]; // 布甲
}

// 根据敌人类型获取掉落配置
export function getDropConfig(enemyType: string): DropConfig | undefined {
  return DROP_CONFIGS.find(config => config.enemyType === enemyType);
}

// 随机掉落装备
export function rollDrop(enemyType: string): string | null {
  const config = getDropConfig(enemyType);
  if (!config) return null;
  
  // 掉落概率判定
  if (Math.random() > config.dropChance) return null;
  
  // 随机选择一个装备
  const randomIndex = Math.floor(Math.random() * config.possibleDrops.length);
  return config.possibleDrops[randomIndex];
}
