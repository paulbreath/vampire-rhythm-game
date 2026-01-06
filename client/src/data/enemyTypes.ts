// 敌人类型配置
export type EnemyType = 
  | 'bat_blue' | 'bat_purple' | 'bat_red' | 'bat_yellow' 
  | 'vampire' | 'bomb'
  | 'skeleton' | 'ghost' | 'werewolf' | 'medusa_head' | 'crow';

export type MovementPattern = 
  | 'straight'      // 直线移动
  | 'wave'          // 波浪移动
  | 'sine'          // 正弦波移动
  | 'zigzag'        // 之字形移动
  | 'dive'          // 俯冲攻击
  | 'float';        // 漂浮移动

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  nameZh: string;
  speed: number;
  size: number;
  color: string;
  movementPattern: MovementPattern;
  health: number;
  expValue: number; // 经验值奖励
  scoreValue: number; // 分数奖励
  description: string;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  // 原有的蝙蝠系列
  'bat_blue': {
    type: 'bat_blue',
    name: 'Blue Bat',
    nameZh: '蓝色蝙蝠',
    speed: 2,
    size: 40,
    color: '#4A90E2',
    movementPattern: 'straight',
    health: 1,
    expValue: 5,
    scoreValue: 10,
    description: '普通的蓝色蝙蝠，直线飞行'
  },
  'bat_purple': {
    type: 'bat_purple',
    name: 'Purple Bat',
    nameZh: '紫色蝙蝠',
    speed: 2.5,
    size: 45,
    color: '#9B59B6',
    movementPattern: 'wave',
    health: 1,
    expValue: 8,
    scoreValue: 15,
    description: '紫色蝙蝠，波浪形飞行'
  },
  'bat_red': {
    type: 'bat_red',
    name: 'Red Bat',
    nameZh: '红色蝙蝠',
    speed: 3,
    size: 50,
    color: '#E74C3C',
    movementPattern: 'straight',
    health: 2,
    expValue: 12,
    scoreValue: 20,
    description: '红色蝙蝠，速度快，需要两次攻击'
  },
  'bat_yellow': {
    type: 'bat_yellow',
    name: 'Yellow Bat',
    nameZh: '黄色蝙蝠',
    speed: 2,
    size: 42,
    color: '#F39C12',
    movementPattern: 'sine',
    health: 1,
    expValue: 10,
    scoreValue: 18,
    description: '黄色蝙蝠，正弦波飞行'
  },
  'vampire': {
    type: 'vampire',
    name: 'Vampire',
    nameZh: '吸血鬼',
    speed: 1.5,
    size: 60,
    color: '#8E44AD',
    movementPattern: 'float',
    health: 3,
    expValue: 25,
    scoreValue: 50,
    description: '吸血鬼，漂浮移动，需要三次攻击'
  },
  'bomb': {
    type: 'bomb',
    name: 'Bomb',
    nameZh: '炸弹',
    speed: 1.8,
    size: 35,
    color: '#E67E22',
    movementPattern: 'straight',
    health: 1,
    expValue: 0,
    scoreValue: -50,
    description: '炸弹，击中会扣分和生命'
  },
  
  // 新增的敌人类型
  'skeleton': {
    type: 'skeleton',
    name: 'Skeleton',
    nameZh: '骷髅战士',
    speed: 1.5,
    size: 55,
    color: '#ECF0F1',
    movementPattern: 'straight',
    health: 2,
    expValue: 15,
    scoreValue: 25,
    description: '骷髅战士，慢速但坚韧'
  },
  'ghost': {
    type: 'ghost',
    name: 'Ghost',
    nameZh: '幽灵',
    speed: 2.2,
    size: 48,
    color: '#95A5A6',
    movementPattern: 'wave',
    health: 1,
    expValue: 12,
    scoreValue: 22,
    description: '幽灵，波浪形飘浮，难以捕捉'
  },
  'werewolf': {
    type: 'werewolf',
    name: 'Werewolf',
    nameZh: '狼人',
    speed: 4,
    size: 65,
    color: '#34495E',
    movementPattern: 'straight',
    health: 3,
    expValue: 30,
    scoreValue: 60,
    description: '狼人，快速冲刺，高血量'
  },
  'medusa_head': {
    type: 'medusa_head',
    name: 'Medusa Head',
    nameZh: '美杜莎之头',
    speed: 2.5,
    size: 45,
    color: '#16A085',
    movementPattern: 'sine',
    health: 1,
    expValue: 18,
    scoreValue: 35,
    description: '美杜莎之头，正弦波飞行，轨迹诡异'
  },
  'crow': {
    type: 'crow',
    name: 'Crow',
    nameZh: '乌鸦',
    speed: 3.5,
    size: 40,
    color: '#2C3E50',
    movementPattern: 'dive',
    health: 1,
    expValue: 20,
    scoreValue: 40,
    description: '乌鸦，俯冲攻击，速度极快'
  }
};

// 根据类型获取敌人配置
export function getEnemyConfig(type: EnemyType): EnemyConfig {
  return ENEMY_CONFIGS[type];
}

// 获取所有敌人类型
export function getAllEnemyTypes(): EnemyType[] {
  return Object.keys(ENEMY_CONFIGS) as EnemyType[];
}

// 根据关卡获取推荐的敌人组合
export function getEnemiesForStage(stageId: string): EnemyType[] {
  const stageEnemies: Record<string, EnemyType[]> = {
    // 教堂区域 - 每个关卡都有爆炸蝙蝠(bomb)
    'abandoned-church': ['bat_blue', 'bat_purple', 'bat_red', 'bat_yellow', 'bomb'], // 废弃教堂只有蝙蝠
    'bell-tower': ['bat_blue', 'crow', 'ghost', 'bomb'],
    'catacombs': ['skeleton', 'ghost', 'bat_purple', 'bomb'],
    
    // 墓地区域
    'misty-graveyard': ['ghost', 'skeleton', 'bat_yellow', 'crow', 'bomb'],
    'ancient-tomb': ['skeleton', 'vampire', 'ghost', 'bat_red', 'bomb'],
    'cursed-forest': ['werewolf', 'crow', 'bat_yellow', 'medusa_head', 'bomb'],
    
    // 城堡区域
    'castle-hall': ['vampire', 'bat_red', 'skeleton', 'ghost', 'bomb'],
    'library': ['ghost', 'medusa_head', 'bat_purple', 'vampire', 'bomb'],
    'alchemy-lab': ['bat_yellow', 'bat_red', 'crow', 'skeleton', 'bomb'],
    'throne-room': ['vampire', 'werewolf', 'medusa_head', 'bat_red', 'crow', 'bomb']
  };
  
  return stageEnemies[stageId] || ['bat_blue', 'bat_purple', 'skeleton', 'bomb'];
}
