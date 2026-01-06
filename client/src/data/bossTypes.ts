// BOSS类型定义和配置
// 每个章节的最后一关会出现特色BOSS

export interface BossConfig {
  id: string;
  name: string;
  type: 'bat_king' | 'zombie_king' | 'alchemist_ghost';
  health: number;
  size: number;
  speed: number;
  damage: number;
  color: string;
  description: string;
}

// BOSS类型配置
export const BOSS_TYPES: Record<string, BossConfig> = {
  // 第一章BOSS - 钟楼的巨型蝙蝠王
  bat_king: {
    id: 'bat_king',
    name: '蝙蝠王',
    type: 'bat_king',
    health: 500,
    size: 120, // 比普通敌人大3倍
    speed: 0.8, // 比普通敌人慢一些
    damage: 30,
    color: '#8B0000', // 深红色
    description: '钟楼的霸主，巨大的蝙蝠之王'
  },
  
  // 第二章BOSS - 古老陵墓的僵尸王
  zombie_king: {
    id: 'zombie_king',
    name: '僵尸王',
    type: 'zombie_king',
    health: 800,
    size: 140,
    speed: 0.5, // 移动缓慢但血厚
    damage: 40,
    color: '#2F4F2F', // 深绿色
    description: '古老陵墓的统治者，不死的僵尸之王'
  },
  
  // 第三章BOSS - 炼金实验室的炼金术师幽灵
  alchemist_ghost: {
    id: 'alchemist_ghost',
    name: '炼金术师幽灵',
    type: 'alchemist_ghost',
    health: 1000,
    size: 100,
    speed: 1.2, // 移动快速且飘忽不定
    damage: 50,
    color: '#9370DB', // 紫色
    description: '疯狂的炼金术师死后的幽灵，掌握黑暗魔法'
  }
};

// 地图ID到BOSS类型的映射
export const MAP_BOSS_MAPPING: Record<string, string | null> = {
  // 第一章
  'abandoned-church': null,
  'bell-tower': 'bat_king', // 第一章最后一关
  'catacombs': null,
  
  // 第二章
  'misty-graveyard': null,
  'ancient-tomb': 'zombie_king', // 第二章最后一关
  'cursed-forest': null,
  
  // 第三章
  'castle-hall': null,
  'library': null,
  'alchemy-lab': 'alchemist_ghost', // 第三章最后一关
  
  // 最终BOSS战（王座厅）不在这里处理，有单独的最终BOSS系统
  'throne-room': null
};

// 获取地图的BOSS配置
export function getBossForMap(mapNodeId: string): BossConfig | null {
  const bossType = MAP_BOSS_MAPPING[mapNodeId];
  if (!bossType) return null;
  return BOSS_TYPES[bossType] || null;
}

// 检查地图是否有BOSS战
export function hasBoss(mapNodeId: string): boolean {
  return MAP_BOSS_MAPPING[mapNodeId] !== null;
}
