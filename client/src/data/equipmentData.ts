import type { Equipment } from '../types/equipment';

// 装备配置数据
export const EQUIPMENT_DATA: Equipment[] = [
  // ========== 武器 ==========
  {
    id: 'starter_sword',
    name: 'Starter Sword',
    nameZh: '新手剑',
    type: 'weapon',
    rarity: 'common',
    icon: '⚔️',
    description: '一把简单的铁剑，适合初学者使用。',
    attack: 10,
    unlockCondition: { type: 'default' }
  },
  {
    id: 'vampire_blade',
    name: 'Vampire Blade',
    nameZh: '吸血剑',
    type: 'weapon',
    rarity: 'rare',
    icon: '🗡️',
    description: '浸染着鲜血的利刃，击杀敌人时有概率回复生命。',
    attack: 20,
    effects: [
      {
        type: 'lifesteal',
        value: 20,
        description: '击杀敌人时20%概率回复1生命'
      }
    ],
    unlockCondition: { type: 'level', value: 10 }
  },
  {
    id: 'thunder_blade',
    name: 'Thunder Blade',
    nameZh: '雷电之刃',
    type: 'weapon',
    rarity: 'epic',
    icon: '⚡',
    description: '蕴含雷电之力的魔剑，攻击会产生连锁闪电。',
    attack: 30,
    effects: [
      {
        type: 'aoe',
        value: 2,
        description: '攻击会跳跃到附近2个敌人'
      }
    ],
    unlockCondition: { type: 'stage', value: 5 }
  },
  {
    id: 'dracula_fang',
    name: "Dracula's Fang",
    nameZh: '德古拉之牙',
    type: 'weapon',
    rarity: 'legendary',
    icon: '🦷',
    description: '德古拉伯爵的獠牙铸成的神器，拥有恐怖的力量。',
    attack: 50,
    effects: [
      {
        type: 'pierce',
        value: 3,
        description: '攻击穿透3个敌人'
      },
      {
        type: 'lifesteal',
        value: 50,
        description: '击杀敌人时50%概率回复1生命'
      },
      {
        type: 'critical',
        value: 20,
        description: '20%暴击率，暴击伤害200%'
      }
    ],
    unlockCondition: { type: 'level', value: 30 }
  },

  // ========== 头盔 ==========
  {
    id: 'leather_cap',
    name: 'Leather Cap',
    nameZh: '皮革帽',
    type: 'helmet',
    rarity: 'common',
    icon: '🎩',
    description: '简单的皮革头盔，提供基础防护。',
    defense: 5,
    unlockCondition: { type: 'default' }
  },
  {
    id: 'bat_helm',
    name: 'Bat Helm',
    nameZh: '蝙蝠头盔',
    type: 'helmet',
    rarity: 'rare',
    icon: '🦇',
    description: '蝙蝠形状的头盔，增强夜视能力。',
    defense: 10,
    hp: 1,
    unlockCondition: { type: 'level', value: 5 }
  },
  {
    id: 'crimson_crown',
    name: 'Crimson Crown',
    nameZh: '深红王冠',
    type: 'helmet',
    rarity: 'epic',
    icon: '👑',
    description: '吸血鬼贵族的王冠，象征着至高无上的权力。',
    defense: 15,
    hp: 2,
    effects: [
      {
        type: 'exp_bonus',
        value: 50,
        description: '经验值获取+50%'
      }
    ],
    unlockCondition: { type: 'level', value: 20 }
  },

  // ========== 胸甲 ==========
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    nameZh: '皮革护甲',
    type: 'armor',
    rarity: 'common',
    icon: '🛡️',
    description: '基础的皮革护甲。',
    hp: 1,
    defense: 5,
    unlockCondition: { type: 'default' }
  },
  {
    id: 'knight_armor',
    name: 'Knight Armor',
    nameZh: '骑士铠甲',
    type: 'armor',
    rarity: 'rare',
    icon: '⚔️',
    description: '厚重的骑士铠甲，提供可靠的防护。',
    hp: 2,
    defense: 15,
    unlockCondition: { type: 'level', value: 8 }
  },
  {
    id: 'vampire_cloak',
    name: 'Vampire Cloak',
    nameZh: '吸血鬼斗篷',
    type: 'armor',
    rarity: 'epic',
    icon: '🧥',
    description: '神秘的吸血鬼斗篷，赋予闪避能力。',
    hp: 3,
    defense: 20,
    effects: [
      {
        type: 'dodge',
        value: 10,
        description: '10%概率闪避伤害'
      }
    ],
    unlockCondition: { type: 'stage', value: 10 }
  },
  {
    id: 'dracula_armor',
    name: "Dracula's Armor",
    nameZh: '德古拉战甲',
    type: 'armor',
    rarity: 'legendary',
    icon: '🦇',
    description: '德古拉伯爵的战甲，免疫大部分伤害。',
    hp: 5,
    defense: 40,
    effects: [
      {
        type: 'dodge',
        value: 20,
        description: '20%概率闪避伤害'
      }
    ],
    unlockCondition: { type: 'level', value: 25 }
  },

  // ========== 护腿 ==========
  {
    id: 'leather_boots',
    name: 'Leather Boots',
    nameZh: '皮革靴',
    type: 'legs',
    rarity: 'common',
    icon: '👢',
    description: '简单的皮革靴子。',
    speed: 5,
    unlockCondition: { type: 'default' }
  },
  {
    id: 'swift_boots',
    name: 'Swift Boots',
    nameZh: '迅捷之靴',
    type: 'legs',
    rarity: 'rare',
    icon: '👟',
    description: '轻便的靴子，提升移动速度。',
    speed: 15,
    defense: 5,
    unlockCondition: { type: 'level', value: 12 }
  },

  // ========== 饰品 ==========
  {
    id: 'speed_ring',
    name: 'Speed Ring',
    nameZh: '速度之戒',
    type: 'accessory',
    rarity: 'rare',
    icon: '💍',
    description: '增加移动速度的魔法戒指。',
    speed: 20,
    unlockCondition: { type: 'level', value: 8 }
  },
  {
    id: 'combo_amulet',
    name: 'Combo Amulet',
    nameZh: '连击护符',
    type: 'accessory',
    rarity: 'epic',
    icon: '📿',
    description: '增强连击奖励的神秘护符。',
    effects: [
      {
        type: 'combo_bonus',
        value: 50,
        description: '连击奖励+50%'
      }
    ],
    unlockCondition: { type: 'achievement', value: 'combo_50' }
  },
  {
    id: 'exp_gem',
    name: 'Experience Gem',
    nameZh: '经验宝石',
    type: 'accessory',
    rarity: 'rare',
    icon: '💎',
    description: '蕴含知识之力的宝石，加速成长。',
    effects: [
      {
        type: 'exp_bonus',
        value: 100,
        description: '经验值获取+100%'
      }
    ],
    unlockCondition: { type: 'level', value: 15 }
  },
  {
    id: 'time_hourglass',
    name: 'Time Hourglass',
    nameZh: '时间沙漏',
    type: 'accessory',
    rarity: 'legendary',
    icon: '⏳',
    description: '操控时间的神器，延长慢动作效果。',
    effects: [
      {
        type: 'slow_motion',
        value: 5,
        description: '慢动作持续时间+5秒'
      }
    ],
    unlockCondition: { type: 'level', value: 20 }
  },
  {
    id: 'blood_ring',
    name: 'Blood Ring',
    nameZh: '鲜血之戒',
    type: 'accessory',
    rarity: 'epic',
    icon: '💍',
    description: '浸染鲜血的戒指，增强攻击力。',
    attack: 20,
    hp: 1,
    unlockCondition: { type: 'stage', value: 7 }
  }
];

// 获取装备的稀有度颜色
export function getRarityColor(rarity: Equipment['rarity']): string {
  const colors = {
    common: '#9CA3AF',    // 灰色
    rare: '#3B82F6',      // 蓝色
    epic: '#A855F7',      // 紫色
    legendary: '#F97316'  // 橙色
  };
  return colors[rarity];
}

// 获取装备的稀有度文本
export function getRarityText(rarity: Equipment['rarity']): string {
  const texts = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  };
  return texts[rarity];
}
