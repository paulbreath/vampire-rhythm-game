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
  'abandoned-church': '/images/backgrounds/bg-abandoned-church.png', // 废弃教堂
  'bell-tower': '/images/backgrounds/bg-bell-tower.png', // 钟楼
  'catacombs': '/images/backgrounds/bg-catacombs.png', // 地下墓穴
  
  // 墓地区域
  'misty-graveyard': '/images/backgrounds/bg-misty-graveyard.png', // 迷雾墓地
  'ancient-tomb': '/images/backgrounds/bg-ancient-tomb.png', // 古老陵墓
  'cursed-forest': '/images/backgrounds/bg-cursed-forest.png', // 诅咒森林
  
  // 城堡区域
  'castle-hall': '/images/backgrounds/bg-castle-hall.png', // 城堡大厅
  'library': '/images/backgrounds/bg-library.png', // 禁忌图书馆
  'alchemy-lab': '/images/backgrounds/bg-alchemy-lab.png', // 炼金实验室
  'throne-room': '/images/backgrounds/bg-throne-room.png' // 王座厅
};

// 获取地图节点的背景图
export function getMapNodeBackground(mapNodeId: string): string {
  return MAP_NODE_BACKGROUNDS[mapNodeId] || '/images/backgrounds/castle-bg.png';
}
