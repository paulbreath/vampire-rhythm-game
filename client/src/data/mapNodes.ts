// 装备掉落池配置（每个关卡可掉落的装备ID列表）
export const MAP_EQUIPMENT_DROPS: Record<string, string[]> = {
  'abandoned-church': ['dagger', 'cloth_armor', 'leather_armor'],
  'bell-tower': ['dual_swords', 'leather_armor', 'chain_mail'],
  'catacombs': ['dual_swords', 'flail', 'chain_mail'],
  'misty-graveyard': ['flail', 'leather_armor', 'chain_mail'],
  'ancient-tomb': ['flail', 'greatsword', 'chain_mail', 'plate_armor'],
  'cursed-forest': ['greatsword', 'whip', 'plate_armor'],
  'castle-hall': ['flail', 'greatsword', 'chain_mail', 'plate_armor'],
  'library': ['whip', 'scythe', 'plate_armor', 'legendary_armor'],
  'alchemy-lab': ['greatsword', 'whip', 'plate_armor'],
  'throne-room': ['scythe', 'whip', 'legendary_armor']
};

// 装备稀有度对应的积分（重复装备转换）
export const EQUIPMENT_RARITY_SCORES: Record<string, number> = {
  common: 100,
  rare: 300,
  epic: 800,
  legendary: 2000
};

// 地图节点数据结构
export interface MapNode {
  id: string;
  name: string;
  nameEn: string;
  chapter: number; // 章节：1=教堂, 2=墓地, 3=城堡
  theme: string;
  music: string; // 对应songs.ts中的歌曲ID
  position: { x: number; y: number }; // 在地图上的坐标（百分比）
  connections: string[]; // 连接的区域ID
  unlockConditions: string[]; // 需要通关的前置区域（满足任一即可）
  boss: string;
  description: string;
}

export const MAP_NODES: Record<string, MapNode> = {
  // 第一章：教堂区域
  'abandoned-church': {
    id: 'abandoned-church',
    name: '废弃教堂',
    nameEn: 'Abandoned Church',
    chapter: 1,
    theme: '破败的圣地，月光透过彩色玻璃',
    music: 'nocturnal-hunger',
    position: { x: 20, y: 58 },
    connections: ['bell-tower', 'catacombs'],
    unlockConditions: [], // 起始关卡，无需解锁
    boss: '堕落牧师',
    description: '曾经神圣的教堂如今被黑暗笼罩，蝙蝠在破碎的彩色玻璃间飞舞。'
  },
  
  'bell-tower': {
    id: 'bell-tower',
    name: '教堂钟楼',
    nameEn: 'Bell Tower',
    chapter: 1,
    theme: '高耸的钟楼，齿轮和钟摆',
    music: 'blood-moon-rises',
    position: { x: 15, y: 25 },
    connections: ['abandoned-church', 'misty-graveyard'],
    unlockConditions: ['abandoned-church'],
    boss: '钟楼怪兽',
    description: '古老的钟楼机械仍在运转，齿轮的转动声回荡在空中。'
  },
  
  'catacombs': {
    id: 'catacombs',
    name: '地下墓穴',
    nameEn: 'Catacombs',
    chapter: 1,
    theme: '阴暗的地下墓室，骷髅和棺材',
    music: 'cathedral-of-hollow-echoes',
    position: { x: 18, y: 72 },
    connections: ['abandoned-church', 'ancient-tomb'],
    unlockConditions: ['abandoned-church'],
    boss: '墓穴守护者',
    description: '深埋地下的墓穴中，死者的灵魂永不安息。'
  },
  
  // 第二章：墓地区域
  'misty-graveyard': {
    id: 'misty-graveyard',
    name: '迷雾墓地',
    nameEn: 'Misty Graveyard',
    chapter: 2,
    theme: '月光下的墓地，浓雾弥漫',
    music: 'crimson-moon-siege',
    position: { x: 48, y: 65 },
    connections: ['bell-tower', 'ancient-tomb'],
    unlockConditions: ['bell-tower'],
    boss: '墓地领主',
    description: '浓雾笼罩的墓地，月光下墓碑投下诡异的影子。'
  },
  
  'ancient-tomb': {
    id: 'ancient-tomb',
    name: '古老陵墓',
    nameEn: 'Ancient Tomb',
    chapter: 2,
    theme: '古代贵族的陵墓，华丽而诡异',
    music: 'blood-moon-rises-2',
    position: { x: 65, y: 75 },
    connections: ['catacombs', 'misty-graveyard', 'cursed-forest', 'castle-hall'],
    unlockConditions: ['catacombs', 'misty-graveyard'], // 二选一
    boss: '不死骑士',
    description: '古代吸血鬼贵族的安息之地，华丽的装饰掩盖不住死亡的气息。'
  },
  
  'cursed-forest': {
    id: 'cursed-forest',
    name: '诅咒森林',
    nameEn: 'Cursed Forest',
    chapter: 2,
    theme: '被黑暗笼罩的森林，扭曲的树木',
    music: 'highlands-breath',
    position: { x: 85, y: 55 },
    connections: ['ancient-tomb', 'library'],
    unlockConditions: ['ancient-tomb'],
    boss: '森林狼王',
    description: '被诅咒的森林，扭曲的树木在月光下投下恐怖的影子。'
  },
  
  // 第三章：城堡区域
  'castle-hall': {
    id: 'castle-hall',
    name: '城堡大厅',
    nameEn: 'Grand Castle Hall',
    chapter: 3,
    theme: '宏伟的城堡大厅，红地毯和吊灯',
    music: 'eternal-bloodlust',
    position: { x: 65, y: 40 },
    connections: ['ancient-tomb', 'library', 'alchemy-lab', 'throne-room'],
    unlockConditions: ['ancient-tomb'],
    boss: '城堡统帅',
    description: '吸血鬼城堡的宏伟大厅，红地毯通向未知的黑暗深处。'
  },
  
  'library': {
    id: 'library',
    name: '禁忌图书馆',
    nameEn: 'Forbidden Library',
    chapter: 3,
    theme: '古老的图书馆，飞舞的书页',
    music: 'electric-shadows-whispering-doom-2',
    position: { x: 75, y: 20 },
    connections: ['cursed-forest', 'castle-hall', 'throne-room'],
    unlockConditions: ['cursed-forest', 'castle-hall'], // 二选一
    boss: '图书馆馆长',
    description: '收藏着禁忌知识的图书馆，书页在空中自主飞舞。'
  },
  
  'alchemy-lab': {
    id: 'alchemy-lab',
    name: '炼金实验室',
    nameEn: 'Alchemy Laboratory',
    chapter: 3,
    theme: '诡异的实验室，药剂和实验器材',
    music: 'cathedral-of-blood-and-bone',
    position: { x: 90, y: 30 },
    connections: ['castle-hall', 'throne-room'],
    unlockConditions: ['castle-hall'],
    boss: '疯狂炼金术士',
    description: '充满诡异实验的炼金实验室，绿色药剂在玻璃瓶中冒泡。'
  },
  
  'throne-room': {
    id: 'throne-room',
    name: '王座厅',
    nameEn: 'Throne Room',
    chapter: 3,
    theme: '吸血鬼王的王座，最终决战',
    music: 'battle-of-the-highlands',
    position: { x: 58, y: 15 },
    connections: ['castle-hall', 'library', 'alchemy-lab'],
    unlockConditions: ['library', 'alchemy-lab'], // 需要至少通关其中一个
    boss: '吸血鬼之王',
    description: '吸血鬼之王的王座所在，这里将是最终的决战之地。'
  }
};

// 获取所有地图节点（按章节和位置排序）
export function getAllMapNodes(): MapNode[] {
  return Object.values(MAP_NODES).sort((a, b) => {
    if (a.chapter !== b.chapter) {
      return a.chapter - b.chapter;
    }
    return a.position.y - b.position.y;
  });
}

// 检查地图节点是否解锁
export function isMapNodeUnlocked(nodeId: string, completedStages: string[]): boolean {
  const node = MAP_NODES[nodeId];
  if (!node) return false;
  
  // 测试模式：解锁所有地图
  return true;
  
  // 原始解锁逻辑（已禁用）
  // // 起始关卡永远解锁
  // if (node.unlockConditions.length === 0) {
  //   return true;
  // }
  // 
  // // 检查是否满足任一解锁条件
  // return node.unlockConditions.some(conditionId => 
  //   completedStages.includes(conditionId)
  // );
}

// 获取已解锁的地图节点
export function getUnlockedMapNodes(completedStages: string[]): MapNode[] {
  return getAllMapNodes().filter(node => 
    isMapNodeUnlocked(node.id, completedStages)
  );
}

// 获取地图探索进度
export function getMapProgress(completedStages: string[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = Object.keys(MAP_NODES).length;
  const completed = completedStages.length;
  const percentage = Math.round((completed / total) * 100);
  
  return { completed, total, percentage };
}
