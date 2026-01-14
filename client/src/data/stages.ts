// 30关卡系统配置
// 10个区域，每个区域3关（2关小怪 + 1关BOSS）

export interface Stage {
  id: string;
  name: string;
  nameEn: string;
  area: number; // 区域编号 1-10
  areaName: string; // 区域名称
  stageInArea: number; // 区域内关卡序号 1-3
  isBoss: boolean; // 是否为BOSS关
  music: string; // 音乐ID
  background: string; // 背景图片路径
  boss?: string; // BOSS ID（仅BOSS关）
  enemies: string[]; // 敌人类型列表
  difficulty: number; // 难度 1-5
  unlockCondition: string[]; // 解锁条件（前置关卡ID）
}

export const STAGES: Record<string, Stage> = {
  // ==================== 区域1：废弃教堂 ====================
  'stage-01': {
    id: 'stage-01',
    name: '教堂入口',
    nameEn: 'Church Entrance',
    area: 1,
    areaName: '废弃教堂',
    stageInArea: 1,
    isBoss: false,
    music: 'crimson-chapel-frenzy',
    background: '/assets/backgrounds/stage-1-church-entrance.png',
    enemies: ['corrupted-believer', 'bomb-bat'],
    difficulty: 1,
    unlockCondition: []
  },
  'stage-02': {
    id: 'stage-02',
    name: '教堂中殿',
    nameEn: 'Church Nave',
    area: 1,
    areaName: '废弃教堂',
    stageInArea: 2,
    isBoss: false,
    music: 'crimson-cathedral-waltz',
    background: '/assets/backgrounds/stage-2-church-corridor.png',
    enemies: ['evil-nun', 'bomb-bat'],
    difficulty: 1,
    unlockCondition: ['stage-01']
  },
  'stage-03': {
    id: 'stage-03',
    name: 'BOSS：堕落牧师',
    nameEn: 'BOSS: Fallen Priest',
    area: 1,
    areaName: '废弃教堂',
    stageInArea: 3,
    isBoss: true,
    music: 'cathedral-of-hollow-echoes',
    background: '/assets/backgrounds/stage-2-church-corridor.png',
    boss: 'fallen-priest',
    enemies: [],
    difficulty: 2,
    unlockCondition: ['stage-02']
  },

  // ==================== 区域2：教堂钟楼 ====================
  'stage-04': {
    id: 'stage-04',
    name: '钟楼楼梯',
    nameEn: 'Tower Stairs',
    area: 2,
    areaName: '教堂钟楼',
    stageInArea: 1,
    isBoss: false,
    music: 'crimson-spires',
    background: '/assets/backgrounds/stage-4-tower-stairs.png',
    enemies: ['tower-ghost', 'bomb-bat'],
    difficulty: 2,
    unlockCondition: ['stage-03']
  },
  'stage-05': {
    id: 'stage-05',
    name: '钟楼中层',
    nameEn: 'Tower Mid-Level',
    area: 2,
    areaName: '教堂钟楼',
    stageInArea: 2,
    isBoss: false,
    music: 'crimson-spires-cn',
    background: '/assets/backgrounds/stage-5-tower-clockwork.png',
    enemies: ['vampire-bat', 'bomb-bat'],
    difficulty: 2,
    unlockCondition: ['stage-04']
  },
  'stage-06': {
    id: 'stage-06',
    name: 'BOSS：蝙蝠王',
    nameEn: 'BOSS: Bat King',
    area: 2,
    areaName: '教堂钟楼',
    stageInArea: 3,
    isBoss: true,
    music: 'blood-moon-rises',
    background: '/assets/backgrounds/stage-5-tower-clockwork.png',
    boss: 'bat-king',
    enemies: [],
    difficulty: 3,
    unlockCondition: ['stage-05']
  },

  // ==================== 区域3：地下墓穴 ====================
  'stage-07': {
    id: 'stage-07',
    name: '墓穴入口',
    nameEn: 'Catacomb Entrance',
    area: 3,
    areaName: '地下墓穴',
    stageInArea: 1,
    isBoss: false,
    music: 'crimson-crypt-pursuit',
    background: '/assets/backgrounds/stage-7-catacombs-entrance.png',
    enemies: ['crypt-crawler', 'bomb-bat'],
    difficulty: 2,
    unlockCondition: ['stage-06']
  },
  'stage-08': {
    id: 'stage-08',
    name: '深层墓穴',
    nameEn: 'Deep Catacombs',
    area: 3,
    areaName: '地下墓穴',
    stageInArea: 2,
    isBoss: false,
    music: 'crimson-crypt-pursuit-cn',
    background: '/assets/backgrounds/stage-8-catacombs-ossuary.png',
    enemies: ['crypt-zombie', 'bomb-bat'],
    difficulty: 3,
    unlockCondition: ['stage-07']
  },
  'stage-09': {
    id: 'stage-09',
    name: 'BOSS：墓穴守护者',
    nameEn: 'BOSS: Crypt Guardian',
    area: 3,
    areaName: '地下墓穴',
    stageInArea: 3,
    isBoss: true,
    music: 'cathedral-of-blood-and-bone',
    background: '/assets/backgrounds/stage-8-catacombs-ossuary.png',
    boss: 'crypt-guardian',
    enemies: [],
    difficulty: 3,
    unlockCondition: ['stage-08']
  },

  // ==================== 区域4：迷雾墓地 ====================
  'stage-10': {
    id: 'stage-10',
    name: '墓地外围',
    nameEn: 'Graveyard Outskirts',
    area: 4,
    areaName: '迷雾墓地',
    stageInArea: 1,
    isBoss: false,
    music: 'crimson-chase',
    background: '/assets/backgrounds/stage-10-graveyard-entrance.png',
    enemies: ['graveyard-wraith', 'bomb-bat'],
    difficulty: 3,
    unlockCondition: ['stage-09']
  },
  'stage-11': {
    id: 'stage-11',
    name: '墓地中心',
    nameEn: 'Graveyard Center',
    area: 4,
    areaName: '迷雾墓地',
    stageInArea: 2,
    isBoss: false,
    music: 'crimson-chase-cn',
    background: '/assets/backgrounds/stage-11-graveyard-path.png',
    enemies: ['graveyard-wraith', 'bomb-bat'],
    difficulty: 3,
    unlockCondition: ['stage-10']
  },
  'stage-12': {
    id: 'stage-12',
    name: 'BOSS：墓地领主',
    nameEn: 'BOSS: Graveyard Lord',
    area: 4,
    areaName: '迷雾墓地',
    stageInArea: 3,
    isBoss: true,
    music: 'crimson-moon-siege',
    background: '/assets/backgrounds/stage-11-graveyard-path.png',
    boss: 'graveyard-lord',
    enemies: [],
    difficulty: 3,
    unlockCondition: ['stage-11']
  },

  // ==================== 区域5：古老陵墓 ====================
  'stage-13': {
    id: 'stage-13',
    name: '陵墓前厅',
    nameEn: 'Tomb Antechamber',
    area: 5,
    areaName: '古老陵墓',
    stageInArea: 1,
    isBoss: false,
    music: 'crimson-pursuit',
    background: '/assets/backgrounds/stage-13-tomb-entrance.png',
    enemies: ['mummy-guard', 'bomb-bat'],
    difficulty: 3,
    unlockCondition: ['stage-12']
  },
  'stage-14': {
    id: 'stage-14',
    name: '陵墓主室',
    nameEn: 'Tomb Chamber',
    area: 5,
    areaName: '古老陵墓',
    stageInArea: 2,
    isBoss: false,
    music: 'crimson-pursuit-cn',
    background: '/assets/backgrounds/stage-14-tomb-chamber.png',
    enemies: ['skeleton-warrior', 'bomb-bat'],
    difficulty: 4,
    unlockCondition: ['stage-13']
  },
  'stage-15': {
    id: 'stage-15',
    name: 'BOSS：不死骑士',
    nameEn: 'BOSS: Undead Knight',
    area: 5,
    areaName: '古老陵墓',
    stageInArea: 3,
    isBoss: true,
    music: 'blood-moon-rises-2',
    background: '/assets/backgrounds/stage-14-tomb-chamber.png',
    boss: 'zombie-king', // 使用僵尸王sprite代替
    enemies: [],
    difficulty: 4,
    unlockCondition: ['stage-14']
  },

  // ==================== 区域6：诅咒森林 ====================
  'stage-16': {
    id: 'stage-16',
    name: '森林边缘',
    nameEn: 'Forest Edge',
    area: 6,
    areaName: '诅咒森林',
    stageInArea: 1,
    isBoss: false,
    music: 'vampire-vortices',
    background: '/assets/backgrounds/stage-16-forest-edge.png',
    enemies: ['forest-werewolf', 'bomb-bat'],
    difficulty: 4,
    unlockCondition: ['stage-15']
  },
  'stage-17': {
    id: 'stage-17',
    name: '深林',
    nameEn: 'Deep Forest',
    area: 6,
    areaName: '诅咒森林',
    stageInArea: 2,
    isBoss: false,
    music: 'vampire-vortices-cn',
    background: '/assets/backgrounds/stage-17-forest-depths.png',
    enemies: ['dark-dryad', 'bomb-bat'],
    difficulty: 4,
    unlockCondition: ['stage-16']
  },
  'stage-18': {
    id: 'stage-18',
    name: 'BOSS：狼人首领',
    nameEn: 'BOSS: Werewolf Alpha',
    area: 6,
    areaName: '诅咒森林',
    stageInArea: 3,
    isBoss: true,
    music: 'highlands-breath',
    background: '/assets/backgrounds/stage-17-forest-depths.png',
    boss: 'werewolf-alpha',
    enemies: [],
    difficulty: 4,
    unlockCondition: ['stage-17']
  },

  // ==================== 区域7：城堡大厅 ====================
  'stage-19': {
    id: 'stage-19',
    name: '城堡走廊',
    nameEn: 'Castle Corridor',
    area: 7,
    areaName: '城堡大厅',
    stageInArea: 1,
    isBoss: false,
    music: 'crimson-castle-pursuit',
    background: '/assets/backgrounds/stage-19-castle-entrance.png',
    enemies: ['vampire-knight', 'bomb-bat'],
    difficulty: 4,
    unlockCondition: ['stage-18']
  },
  'stage-20': {
    id: 'stage-20',
    name: '城堡军械库',
    nameEn: 'Castle Armory',
    area: 7,
    areaName: '城堡大厅',
    stageInArea: 2,
    isBoss: false,
    music: 'crimson-castle-pursuit-cn',
    background: '/assets/backgrounds/stage-20-castle-corridor.png',
    enemies: ['blood-gargoyle', 'bomb-bat'],
    difficulty: 4,
    unlockCondition: ['stage-19']
  },
  'stage-21': {
    id: 'stage-21',
    name: 'BOSS：城堡统帅',
    nameEn: 'BOSS: Castle Commander',
    area: 7,
    areaName: '城堡大厅',
    stageInArea: 3,
    isBoss: true,
    music: 'eternal-bloodlust',
    background: '/assets/backgrounds/stage-19-castle-entrance.png',
    boss: 'castle-commander',
    enemies: [],
    difficulty: 4,
    unlockCondition: ['stage-20']
  },

  // ==================== 区域8：禁忌图书馆 ====================
  'stage-22': {
    id: 'stage-22',
    name: '图书馆入口',
    nameEn: 'Library Entrance',
    area: 8,
    areaName: '禁忌图书馆',
    stageInArea: 1,
    isBoss: false,
    music: 'electric-shadows-whispering-doom',
    background: '/assets/backgrounds/stage-22-library-entrance.png',
    enemies: ['possessed-book', 'bomb-bat'],
    difficulty: 5,
    unlockCondition: ['stage-21']
  },
  'stage-23': {
    id: 'stage-23',
    name: '图书馆深处',
    nameEn: 'Library Depths',
    area: 8,
    areaName: '禁忌图书馆',
    stageInArea: 2,
    isBoss: false,
    music: 'electric-shadows-whispering-doom-2',
    background: '/assets/backgrounds/stage-23-library-halls.png',
    enemies: ['shadow-scholar', 'bomb-bat'],
    difficulty: 5,
    unlockCondition: ['stage-22']
  },
  'stage-24': {
    id: 'stage-24',
    name: 'BOSS：古代图书馆馆长',
    nameEn: 'BOSS: Ancient Librarian',
    area: 8,
    areaName: '禁忌图书馆',
    stageInArea: 3,
    isBoss: true,
    music: 'crimson-fugue-of-the-thirst',
    background: '/assets/backgrounds/stage-23-library-halls.png',
    boss: 'ancient-librarian',
    enemies: [],
    difficulty: 5,
    unlockCondition: ['stage-23']
  },

  // ==================== 区域9：魅魔审讯室 ====================
  'stage-25': {
    id: 'stage-25',
    name: '宫殿外厅',
    nameEn: 'Palace Outer Hall',
    area: 9,
    areaName: '魅魔审讯室',
    stageInArea: 1,
    isBoss: false,
    music: 'crimson-chapel-frenzy-cn',
    background: '/assets/backgrounds/stage-25-torture-entrance.png',
    enemies: ['succubus-minion', 'bomb-bat'],
    difficulty: 5,
    unlockCondition: ['stage-24']
  },
  'stage-26': {
    id: 'stage-26',
    name: '宫殿内室（审讯室）',
    nameEn: 'Palace Inner Chamber',
    area: 9,
    areaName: '魅魔审讯室',
    stageInArea: 2,
    isBoss: false,
    music: 'crimson-fugue-of-the-thirst-cn',
    background: '/assets/backgrounds/stage-26-torture-chamber.png',
    enemies: ['enchanted-rose', 'bomb-bat'],
    difficulty: 5,
    unlockCondition: ['stage-25']
  },
  'stage-27': {
    id: 'stage-27',
    name: 'BOSS：魅魔',
    nameEn: 'BOSS: Succubus',
    area: 9,
    areaName: '魅魔审讯室',
    stageInArea: 3,
    isBoss: true,
    music: 'eternal-thorns-of-the-night-choir',
    background: '/assets/backgrounds/stage-26-torture-chamber.png',
    boss: 'succubus',
    enemies: [],
    difficulty: 5,
    unlockCondition: ['stage-26']
  },

  // ==================== 区域10：王座厅 ====================
  'stage-28': {
    id: 'stage-28',
    name: '王座通道',
    nameEn: 'Throne Approach',
    area: 10,
    areaName: '王座厅',
    stageInArea: 1,
    isBoss: false,
    music: 'eternal-thorns-of-the-night-choir-cn',
    background: '/assets/backgrounds/stage-28-throne-approach.png',
    enemies: ['elite-vampire', 'bomb-bat'],
    difficulty: 5,
    unlockCondition: ['stage-27']
  },
  'stage-29': {
    id: 'stage-29',
    name: '王座前厅',
    nameEn: 'Throne Antechamber',
    area: 10,
    areaName: '王座厅',
    stageInArea: 2,
    isBoss: false,
    music: 'crimson-cathedral-waltz-cn',
    background: '/assets/backgrounds/stage-29-throne-hall.png',
    enemies: ['blood-knight', 'bomb-bat'],
    difficulty: 5,
    unlockCondition: ['stage-28']
  },
  'stage-30': {
    id: 'stage-30',
    name: 'BOSS：吸血鬼之王',
    nameEn: 'BOSS: Vampire King',
    area: 10,
    areaName: '王座厅',
    stageInArea: 3,
    isBoss: true,
    music: 'battle-of-the-highlands',
    background: '/assets/backgrounds/stage-29-throne-hall.png',
    boss: 'vampire-king',
    enemies: [],
    difficulty: 5,
    unlockCondition: ['stage-29']
  }
};

// 获取所有关卡（按顺序）
export function getAllStages(): Stage[] {
  const stageIds = Object.keys(STAGES).sort();
  return stageIds.map(id => STAGES[id]);
}

// 根据区域获取关卡
export function getStagesByArea(area: number): Stage[] {
  return getAllStages().filter(stage => stage.area === area);
}

// 获取BOSS关卡
export function getBossStages(): Stage[] {
  return getAllStages().filter(stage => stage.isBoss);
}

// 获取小怪关卡
export function getMobStages(): Stage[] {
  return getAllStages().filter(stage => !stage.isBoss);
}

// 检查关卡是否解锁
export function isStageUnlocked(stageId: string, completedStages: string[]): boolean {
  const stage = STAGES[stageId];
  if (!stage) return false;
  
  // 第一关默认解锁
  if (stage.unlockCondition.length === 0) {
    return true;
  }
  
  // 检查所有前置条件是否满足
  return stage.unlockCondition.every(conditionId => 
    completedStages.includes(conditionId)
  );
}

// 获取已解锁的关卡
export function getUnlockedStages(completedStages: string[]): Stage[] {
  return getAllStages().filter(stage => 
    isStageUnlocked(stage.id, completedStages)
  );
}

// 获取游戏进度
export function getGameProgress(completedStages: string[]): {
  completed: number;
  total: number;
  percentage: number;
  currentArea: number;
} {
  const total = Object.keys(STAGES).length;
  const completed = completedStages.length;
  const percentage = Math.round((completed / total) * 100);
  
  // 计算当前所在区域
  let currentArea = 1;
  for (let i = 1; i <= 10; i++) {
    const areaStages = getStagesByArea(i);
    const areaCompleted = areaStages.filter(s => completedStages.includes(s.id)).length;
    if (areaCompleted < 3) {
      currentArea = i;
      break;
    }
    if (i === 10) currentArea = 10;
  }
  
  return { completed, total, percentage, currentArea };
}
