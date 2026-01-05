// 地图节点ID到旧stage ID的映射
// 用于向后兼容，将新的地图系统ID映射到旧的stage系统

export const MAP_TO_STAGE_MAPPING: Record<string, string> = {
  // 教堂区域 -> church
  'abandoned-church': 'church',
  'bell-tower': 'church',
  'catacombs': 'church',
  
  // 墓地区域 -> graveyard
  'misty-graveyard': 'graveyard',
  'ancient-tomb': 'graveyard',
  'cursed-forest': 'graveyard',
  
  // 城堡区域 -> castle
  'castle-hall': 'castle',
  'library': 'castle',
  'alchemy-lab': 'castle',
  'throne-room': 'castle'
};

// 将地图节点ID转换为stage ID
export function mapNodeIdToStageId(mapNodeId: string): string {
  return MAP_TO_STAGE_MAPPING[mapNodeId] || mapNodeId;
}

// 反向映射：从stage ID获取默认的地图节点ID
export const STAGE_TO_DEFAULT_MAP: Record<string, string> = {
  'church': 'abandoned-church',
  'graveyard': 'misty-graveyard',
  'castle': 'castle-hall'
};

// 地图节点ID到背景图的映射
export const MAP_NODE_BACKGROUNDS: Record<string, string> = {
  // 教堂区域
  'abandoned-church': '/images/backgrounds/castle-bg.png', // 使用现有的教堂背景
  'bell-tower': '/images/bg-bell-tower.png', // 新生成的钟楼背景
  'catacombs': '/images/bg-catacombs.png', // 新生成的地下墓穴背景
  
  // 墓地区域
  'misty-graveyard': '/images/backgrounds/graveyard.png', // 使用现有的墓地背景
  'ancient-tomb': '/images/bg-ancient-tomb.png', // 新生成的古老陵墓背景
  'cursed-forest': '/images/bg-cursed-forest.png', // 新生成的诅咒森林背景
  
  // 城堡区域
  'castle-hall': '/images/backgrounds/castle.png', // 使用现有的城堡背景
  'library': '/images/bg-library.png', // 新生成的图书馆背景
  'alchemy-lab': '/images/bg-alchemy-lab.png', // 新生成的炼金实验室背景
  'throne-room': '/images/bg-throne-room.png' // 新生成的王座厅背景
};

// 获取地图节点的背景图
export function getMapNodeBackground(mapNodeId: string): string {
  return MAP_NODE_BACKGROUNDS[mapNodeId] || '/images/backgrounds/castle-bg.png';
}
