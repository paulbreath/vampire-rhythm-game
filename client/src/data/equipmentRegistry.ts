/**
 * 统一的装备数据注册表
 * 所有装备信息的单一来源，确保所有地方使用相同的数据
 */

export type EquipmentType = 'weapon' | 'armor';
export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface EquipmentInfo {
  id: string;
  type: EquipmentType;
  name: string;
  nameZh: string;
  rarity: EquipmentRarity;
  icon: string;
  description: string;
  descriptionZh: string;
}

/**
 * 统一的装备数据库
 * 这是所有装备信息的唯一来源
 */
export const EQUIPMENT_REGISTRY: Record<string, EquipmentInfo> = {
  // ========== 武器 ==========
  dagger: {
    id: 'dagger',
    type: 'weapon',
    name: 'Dagger',
    nameZh: '匕首',
    rarity: 'common',
    icon: '🗡️',
    description: 'A nimble dagger with a thin attack trail, perfect for precise strikes.',
    descriptionZh: '轻巧的匕首，攻击轨迹为细线，适合精准打击。',
  },
  dual_swords: {
    id: 'dual_swords',
    type: 'weapon',
    name: 'Dual Swords',
    nameZh: '双剑',
    rarity: 'rare',
    icon: '⚔️',
    description: 'Twin blades with dual attack trails, greatly expanding attack range.',
    descriptionZh: '双手持剑，攻击轨迹为双线，大幅扩大攻击范围。',
  },
  flail: {
    id: 'flail',
    type: 'weapon',
    name: 'Flail',
    nameZh: '链锤',
    rarity: 'epic',
    icon: '🔨',
    description: 'A heavy chain flail with a thick attack trail and larger range.',
    descriptionZh: '沉重的链锤，攻击轨迹为粗线，范围更大。',
  },
  greatsword: {
    id: 'greatsword',
    type: 'weapon',
    name: 'Greatsword',
    nameZh: '巨剑',
    rarity: 'epic',
    icon: '⚔️',
    description: 'A massive two-handed sword with ultra-thick attack trail and maximum range.',
    descriptionZh: '巨大的双手剑，攻击轨迹为超粗线，最大攻击范围。',
  },
  whip: {
    id: 'whip',
    type: 'weapon',
    name: 'Vampire Killer',
    nameZh: '吸血鬼杀手',
    rarity: 'legendary',
    icon: '🪢',
    description: 'The legendary holy whip with wave attack trail, striking multiple enemies.',
    descriptionZh: '传说中的圣鞭，攻击轨迹为波浪线，可击中更多敌人。',
  },
  scythe: {
    id: 'scythe',
    type: 'weapon',
    name: "Death's Scythe",
    nameZh: '死神镰刀',
    rarity: 'legendary',
    icon: '🪓',
    description: "The Reaper's scythe with arc attack trail, sweeping all enemies.",
    descriptionZh: '死神的镰刀，攻击轨迹为弧形线，横扫一切。',
  },

  // ========== 防具 ==========
  cloth_armor: {
    id: 'cloth_armor',
    type: 'armor',
    name: 'Cloth Armor',
    nameZh: '布甲',
    rarity: 'common',
    icon: '👕',
    description: 'Simple cloth protection providing basic defense.',
    descriptionZh: '简单的布制护甲，提供基础防护。',
  },
  leather_armor: {
    id: 'leather_armor',
    type: 'armor',
    name: 'Leather Armor',
    nameZh: '皮甲',
    rarity: 'common',
    icon: '🦺',
    description: 'Tough leather armor increasing maximum health.',
    descriptionZh: '坚韧的皮革护甲，增加生命上限。',
  },
  chain_mail: {
    id: 'chain_mail',
    type: 'armor',
    name: 'Chain Mail',
    nameZh: '锁甲',
    rarity: 'rare',
    icon: '🛡️',
    description: 'Intricately woven chainmail greatly increasing maximum health.',
    descriptionZh: '精密编织的锁子甲，大幅增加生命上限。',
  },
  plate_armor: {
    id: 'plate_armor',
    type: 'armor',
    name: 'Plate Armor',
    nameZh: '板甲',
    rarity: 'epic',
    icon: '🛡️',
    description: 'Heavy plate armor providing powerful protection.',
    descriptionZh: '厚重的板甲，提供强大的防护。',
  },
  legendary_armor: {
    id: 'legendary_armor',
    type: 'armor',
    name: "Dracula's Cloak",
    nameZh: '德古拉斗篷',
    rarity: 'legendary',
    icon: '🧥',
    description: "Count Dracula's cloak with terrifying protective power.",
    descriptionZh: '德古拉伯爵的斗篷，拥有恐怖的防护力。',
  },
};

/**
 * 稀有度配置
 */
export const RARITY_CONFIG: Record<EquipmentRarity, { color: string; nameZh: string; glow: string }> = {
  common: {
    color: '#9CA3AF',
    nameZh: '普通',
    glow: 'rgba(156, 163, 175, 0.3)',
  },
  rare: {
    color: '#3B82F6',
    nameZh: '稀有',
    glow: 'rgba(59, 130, 246, 0.5)',
  },
  epic: {
    color: '#A855F7',
    nameZh: '史诗',
    glow: 'rgba(168, 85, 247, 0.6)',
  },
  legendary: {
    color: '#F59E0B',
    nameZh: '传说',
    glow: 'rgba(245, 158, 11, 0.8)',
  },
};

/**
 * 装备稀有度对应的积分（重复装备转换）
 */
export const EQUIPMENT_RARITY_SCORES: Record<EquipmentRarity, number> = {
  common: 100,
  rare: 300,
  epic: 800,
  legendary: 2000,
};

/**
 * 关卡装备掉落池
 * 确保与MAP_EQUIPMENT_DROPS中的ID一致
 */
export const STAGE_DROP_POOLS: Record<string, string[]> = {
  'abandoned-church': ['dagger', 'cloth_armor', 'leather_armor'],
  'bell-tower': ['dual_swords', 'leather_armor', 'chain_mail'],
  'catacombs': ['dual_swords', 'flail', 'chain_mail'],
  'misty-graveyard': ['flail', 'leather_armor', 'chain_mail'],
  'ancient-tomb': ['flail', 'greatsword', 'chain_mail', 'plate_armor'],
  'cursed-forest': ['greatsword', 'whip', 'plate_armor'],
  'castle-hall': ['flail', 'greatsword', 'chain_mail', 'plate_armor'],
  'library': ['whip', 'scythe', 'plate_armor', 'legendary_armor'],
  'alchemy-lab': ['greatsword', 'whip', 'plate_armor'],
  'throne-room': ['scythe', 'whip', 'legendary_armor'],
};

/**
 * 辅助函数
 */

export function getEquipmentInfo(id: string): EquipmentInfo | undefined {
  return EQUIPMENT_REGISTRY[id];
}

export function getEquipmentName(id: string, lang: 'en' | 'zh' = 'en'): string {
  const equipment = getEquipmentInfo(id);
  if (!equipment) return 'Unknown';
  return lang === 'zh' ? equipment.nameZh : equipment.name;
}

export function getEquipmentRarity(id: string): EquipmentRarity {
  const equipment = getEquipmentInfo(id);
  return equipment?.rarity || 'common';
}

export function getEquipmentIcon(id: string): string {
  const equipment = getEquipmentInfo(id);
  return equipment?.icon || '❓';
}

export function getRarityColor(rarity: EquipmentRarity): string {
  return RARITY_CONFIG[rarity]?.color || '#ffffff';
}

export function getRarityScore(rarity: EquipmentRarity): number {
  return EQUIPMENT_RARITY_SCORES[rarity] || 100;
}

export function getAllWeapons(): EquipmentInfo[] {
  return Object.values(EQUIPMENT_REGISTRY).filter(eq => eq.type === 'weapon');
}

export function getAllArmors(): EquipmentInfo[] {
  return Object.values(EQUIPMENT_REGISTRY).filter(eq => eq.type === 'armor');
}

export function getStageDropPool(stageId: string): EquipmentInfo[] {
  const ids = STAGE_DROP_POOLS[stageId] || [];
  return ids
    .map(id => getEquipmentInfo(id))
    .filter((eq): eq is EquipmentInfo => eq !== undefined);
}
