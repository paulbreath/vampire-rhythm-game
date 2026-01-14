// 敵人类型配置
import { type SizeType } from './sizeConfig';

export type EnemyType = 
  | 'bat_blue' | 'bat_purple' | 'bat_red' | 'bat_yellow' 
  | 'vampire' | 'bomb' | 'bomb-bat'
  | 'skeleton' | 'ghost' | 'werewolf' | 'medusa_head' | 'crow'
  // 场景1: 废弃教堂
  | 'corrupted-believer' | 'evil-nun'
  // 场景2: 钟楼
  | 'tower-ghost' | 'vampire-bat'
  // 场景3: 地下墓穴
  | 'crawling-skeleton' | 'crypt-zombie'
  // 场景4: 迷雾墓地
  | 'corpse' | 'graveyard-wraith'
  // 场景5: 古老陵墓
  | 'mummy' | 'skeleton-warrior'
  // 场景6: 诅咒森林
  | 'cursed-wolf' | 'tree-demon'
  // 场景7: 城堡大厅
  | 'armor-ghost' | 'vampire-guard'
  // 场景8: 禁忌图书馆
  | 'flying-book' | 'ink-demon'
  // 场景9: 魅魔刑讯室
  | 'charm-rose' | 'whip-demon'
  // 场景10: 王座厅
  | 'elite-vampire' | 'blood-knight';

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
  size: number; // 保留以兼容旧代码
  sizeType: SizeType; // 新增：尺寸类型 (small/medium/large)
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
    sizeType: 'small',
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
    sizeType: 'small',
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
    sizeType: 'small',
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
    sizeType: 'small',
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
    sizeType: 'medium',
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
    sizeType: 'small',
    color: '#E67E22',
    movementPattern: 'straight',
    health: 1,
    expValue: 0,
    scoreValue: -50,
    description: '炸弹，击中会扣分和生命'
  },
  'bomb-bat': {
    type: 'bomb-bat',
    name: 'Bomb Bat',
    nameZh: '炸弹蝙蝠',
    speed: 1.8,
    size: 28,
    sizeType: 'small',
    color: '#E67E22',
    movementPattern: 'wave',
    health: 1,
    expValue: 0,
    scoreValue: -50,
    description: '炸弹蝙蝠，击中会扣分和生命'
  },
  
  // 新增的敌人类型
  'skeleton': {
    type: 'skeleton',
    name: 'Skeleton',
    nameZh: '骷髅战士',
    speed: 1.5,
    size: 55,
    sizeType: 'medium',
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
    sizeType: 'medium',
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
    sizeType: 'large',
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
    sizeType: 'small',
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
    sizeType: 'small',
    color: '#2C3E50',
    movementPattern: 'dive',
    health: 1,
    expValue: 20,
    scoreValue: 40,
    description: '乌鸦，俯冲攻击，速度极快'
  },
  
  // 场景1: 废弃教堂
  'corrupted-believer': {
    type: 'corrupted-believer',
    name: 'Corrupted Believer',
    nameZh: '堕落信徒',
    speed: 1.8,
    size: 50,
    sizeType: 'medium',
    color: '#8B4513',
    movementPattern: 'straight',
    health: 2,
    expValue: 12,
    scoreValue: 20,
    description: '堕落的教堂信徒，缓慢但坚韧'
  },
  'evil-nun': {
    type: 'evil-nun',
    name: 'Evil Nun',
    nameZh: '邪恶修女',
    speed: 2.0,
    size: 52,
    sizeType: 'medium',
    color: '#2C2C2C',
    movementPattern: 'wave',
    health: 2,
    expValue: 15,
    scoreValue: 25,
    description: '邪恶的修女，波浪形移动'
  },
  
  // 场景2: 钟楼
  'tower-ghost': {
    type: 'tower-ghost',
    name: 'Tower Ghost',
    nameZh: '钟楼幽灵',
    speed: 2.3,
    size: 48,
    sizeType: 'medium',
    color: '#A9A9A9',
    movementPattern: 'float',
    health: 1,
    expValue: 14,
    scoreValue: 24,
    description: '钟楼中的幽灵，漂浮移动'
  },
  'vampire-bat': {
    type: 'vampire-bat',
    name: 'Vampire Bat',
    nameZh: '吸血蝙蝠',
    speed: 3.0,
    size: 45,
    sizeType: 'small',
    color: '#8B0000',
    movementPattern: 'dive',
    health: 1,
    expValue: 16,
    scoreValue: 28,
    description: '吸血蝙蝠，俯冲攻击'
  },
  
  // 场景3: 地下墓穴
  'crawling-skeleton': {
    type: 'crawling-skeleton',
    name: 'Crawling Skeleton',
    nameZh: '爬行骷髅',
    speed: 1.2,
    size: 50,
    sizeType: 'medium',
    color: '#D3D3D3',
    movementPattern: 'straight',
    health: 2,
    expValue: 13,
    scoreValue: 22,
    description: '爬行的骷髅，缓慢但难以摧毁'
  },
  'crypt-zombie': {
    type: 'crypt-zombie',
    name: 'Crypt Zombie',
    nameZh: '墓穴僵尸',
    speed: 1.5,
    size: 55,
    sizeType: 'medium',
    color: '#556B2F',
    movementPattern: 'straight',
    health: 3,
    expValue: 18,
    scoreValue: 30,
    description: '墓穴中的僵尸，高血量'
  },
  
  // 场景4: 迷雾墓地
  'corpse': {
    type: 'corpse',
    name: 'Corpse',
    nameZh: '行尸',
    speed: 1.3,
    size: 52,
    sizeType: 'medium',
    color: '#708090',
    movementPattern: 'straight',
    health: 2,
    expValue: 14,
    scoreValue: 23,
    description: '行走的尸体，缓慢移动'
  },
  'graveyard-wraith': {
    type: 'graveyard-wraith',
    name: 'Graveyard Wraith',
    nameZh: '墓地怨灵',
    speed: 2.5,
    size: 50,
    sizeType: 'medium',
    color: '#4B0082',
    movementPattern: 'sine',
    health: 1,
    expValue: 17,
    scoreValue: 32,
    description: '墓地怨灵，正弦波移动'
  },
  
  // 场景5: 古老陵墓
  'mummy': {
    type: 'mummy',
    name: 'Mummy',
    nameZh: '木乃伊',
    speed: 1.4,
    size: 58,
    sizeType: 'medium',
    color: '#D2B48C',
    movementPattern: 'straight',
    health: 3,
    expValue: 20,
    scoreValue: 35,
    description: '木乃伊，缓慢但高血量'
  },
  'skeleton-warrior': {
    type: 'skeleton-warrior',
    name: 'Skeleton Warrior',
    nameZh: '骷髅战士',
    speed: 2.0,
    size: 55,
    sizeType: 'medium',
    color: '#F5F5DC',
    movementPattern: 'straight',
    health: 2,
    expValue: 16,
    scoreValue: 28,
    description: '骷髅战士，中速移动'
  },
  
  // 场景6: 诅咒森林
  'cursed-wolf': {
    type: 'cursed-wolf',
    name: 'Cursed Wolf',
    nameZh: '诅咒狼',
    speed: 3.5,
    size: 60,
    sizeType: 'large',
    color: '#2F4F4F',
    movementPattern: 'straight',
    health: 2,
    expValue: 22,
    scoreValue: 40,
    description: '诅咒狼，快速冲刺'
  },
  'tree-demon': {
    type: 'tree-demon',
    name: 'Tree Demon',
    nameZh: '树魔',
    speed: 1.8,
    size: 65,
    sizeType: 'large',
    color: '#228B22',
    movementPattern: 'wave',
    health: 3,
    expValue: 25,
    scoreValue: 45,
    description: '树魔，波浪形移动，高血量'
  },
  
  // 场景7: 城堡大厅
  'armor-ghost': {
    type: 'armor-ghost',
    name: 'Armor Ghost',
    nameZh: '铠甲幽灵',
    speed: 2.2,
    size: 58,
    sizeType: 'medium',
    color: '#C0C0C0',
    movementPattern: 'straight',
    health: 3,
    expValue: 24,
    scoreValue: 42,
    description: '铠甲幽灵，高防御'
  },
  'vampire-guard': {
    type: 'vampire-guard',
    name: 'Vampire Guard',
    nameZh: '吸血鬼卫兵',
    speed: 2.5,
    size: 60,
    sizeType: 'large',
    color: '#8B0000',
    movementPattern: 'straight',
    health: 3,
    expValue: 26,
    scoreValue: 48,
    description: '吸血鬼卫兵，强大的敌人'
  },
  
  // 场景8: 禁忌图书馆
  'flying-book': {
    type: 'flying-book',
    name: 'Flying Book',
    nameZh: '飞行书籍',
    speed: 2.8,
    size: 42,
    sizeType: 'small',
    color: '#8B4513',
    movementPattern: 'sine',
    health: 1,
    expValue: 19,
    scoreValue: 34,
    description: '飞行的魔法书，正弦波移动'
  },
  'ink-demon': {
    type: 'ink-demon',
    name: 'Ink Demon',
    nameZh: '墨汁魔',
    speed: 2.4,
    size: 50,
    sizeType: 'medium',
    color: '#000000',
    movementPattern: 'wave',
    health: 2,
    expValue: 21,
    scoreValue: 38,
    description: '墨汁魔，波浪形移动'
  },
  
  // 场景9: 魅魔刑讯室
  'charm-rose': {
    type: 'charm-rose',
    name: 'Charm Rose',
    nameZh: '魅惑玫瑰',
    speed: 2.6,
    size: 45,
    sizeType: 'small',
    color: '#FF1493',
    movementPattern: 'sine',
    health: 1,
    expValue: 20,
    scoreValue: 36,
    description: '魅惑玫瑰，正弦波移动'
  },
  'whip-demon': {
    type: 'whip-demon',
    name: 'Whip Demon',
    nameZh: '锤魔',
    speed: 2.8,
    size: 55,
    sizeType: 'medium',
    color: '#8B008B',
    movementPattern: 'straight',
    health: 2,
    expValue: 23,
    scoreValue: 42,
    description: '锤魔，快速攻击'
  },
  
  // 场景10: 王座厅
  'elite-vampire': {
    type: 'elite-vampire',
    name: 'Elite Vampire',
    nameZh: '精英吸血鬼',
    speed: 3.2,
    size: 65,
    sizeType: 'large',
    color: '#DC143C',
    movementPattern: 'dive',
    health: 4,
    expValue: 30,
    scoreValue: 60,
    description: '精英吸血鬼，俯冲政击，高血量'
  },
  'blood-knight': {
    type: 'blood-knight',
    name: 'Blood Knight',
    nameZh: '血骑士',
    speed: 2.8,
    size: 68,
    sizeType: 'large',
    color: '#8B0000',
    movementPattern: 'straight',
    health: 4,
    expValue: 28,
    scoreValue: 55,
    description: '血骑士，强大的敌人，高血量'
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
  // 支持新的stageId格式 (stage-1, stage-2, ...)
  // 根据stageNumber映射到场景，每个场景3关
  const stageNumber = parseInt(stageId.replace('stage-', ''));
  
  if (!isNaN(stageNumber)) {
    // 检查是否为BOSS关（第3关）
    const isThirdStage = (stageNumber % 3) === 0;
    
    // BOSS关只有爆炸蝙蝠
    if (isThirdStage) {
      return ['bomb-bat'];
    }
    
    // 每3关一个场景，根据关卡号计算场景索引
    const sceneIndex = Math.floor((stageNumber - 1) / 3);
    
    const sceneEnemies: EnemyType[][] = [
      // 场曷1 (关卡1-2): 废弃教堂
      ['corrupted-believer', 'evil-nun'],
      // 场曷2 (关卡4-5): 钟楼
      ['tower-ghost', 'vampire-bat'],
      // 场曷3 (关卡7-8): 地下墓穴
      ['crawling-skeleton', 'crypt-zombie'],
      // 场曷4 (关卡10-11): 迷雾墓地
      ['corpse', 'graveyard-wraith'],
      // 场曷5 (关卡13-14): 古老陵墓
      ['mummy', 'skeleton-warrior'],
      // 场曷6 (关卡16-17): 诅咒森林
      ['cursed-wolf', 'tree-demon'],
      // 场曷7 (关卡19-20): 城堡大厅
      ['armor-ghost', 'vampire-guard'],
      // 场曷8 (关卡22-23): 禁忌图书馆
      ['flying-book', 'ink-demon'],
      // 场曷9 (关卡25-26): 魅魔刑讯室
      ['charm-rose', 'whip-demon'],
      // 场景10 (关卡28-29): 王座厅
      ['elite-vampire', 'blood-knight']
    ];
    
    if (sceneIndex >= 0 && sceneIndex < sceneEnemies.length) {
      // 小怪关：2个场景专属怪物 + 炸弹蝙蝠
      return [...sceneEnemies[sceneIndex], 'bomb-bat'];
    }
  }
  
  // 兼容旧的stageId格式
  const stageEnemies: Record<string, EnemyType[]> = {
    // 教堂区域
    'abandoned-church': ['bat_blue', 'bat_purple', 'bomb'],
    'bell-tower': ['bat_blue', 'crow', 'ghost', 'bomb'],
    'catacombs': ['skeleton', 'ghost', 'bat_purple', 'bomb'],
    
    // 墓地区域
    'misty-graveyard': ['ghost', 'skeleton', 'bat_yellow', 'crow', 'bomb'],
    'ancient-tomb': ['skeleton', 'ghost', 'bat_red', 'bomb'],
    'cursed-forest': ['werewolf', 'crow', 'bat_yellow', 'medusa_head', 'bomb'],
    
    // 城堡区域
    'castle-hall': ['bat_red', 'skeleton', 'ghost', 'bomb'],
    'library': ['ghost', 'medusa_head', 'bat_purple', 'bomb'],
    'alchemy-lab': ['bat_yellow', 'bat_red', 'crow', 'skeleton', 'bomb'],
    'throne-room': ['werewolf', 'medusa_head', 'bat_red', 'crow', 'bomb']
  };
  
  return stageEnemies[stageId] || ['bat_blue', 'bat_purple', 'bomb'];
}
