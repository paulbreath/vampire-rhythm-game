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
