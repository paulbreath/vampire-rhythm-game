/**
 * 全新地图系统：10个场景 × 3个关卡 = 30关
 */

import { type BossType } from './bossTypes';
import { type EnemyType } from './enemyTypes';

export interface StageConfig {
  id: string;
  stageNumber: number;
  sceneId: string;
  sceneName: string;
  sceneNameZh: string;
  name: string;
  nameZh: string;
  difficulty: 'easy' | 'normal' | 'hard';
  isBossStage: boolean;
  bossType?: BossType;
  enemyTypes: EnemyType[];
  musicId: string;
  backgroundImage: string;
  unlockRequirement: string | null;
  description: string;
}

export interface SceneInfo {
  id: string;
  name: string;
  nameZh: string;
  stageRange: [number, number];
  bossStage: number;
  bossType: BossType;
  theme: string;
  backgroundImage: string;
}

export const SCENES: Record<string, SceneInfo> = {
  'church': {
    id: 'church',
    name: 'Abandoned Church',
    nameZh: '废弃教堂',
    stageRange: [1, 3],
    bossStage: 3,
    bossType: 'fallen-priest',
    theme: 'gothic-church',
    backgroundImage: '/assets/backgrounds/stage-1-church-entrance.png',
  },
  'bell-tower': {
    id: 'bell-tower',
    name: 'Bell Tower',
    nameZh: '钟楼',
    stageRange: [4, 6],
    bossStage: 6,
    bossType: 'bat-king',
    theme: 'tower',
    backgroundImage: '/assets/backgrounds/stage-4-tower-stairs.png',
  },
  'catacombs': {
    id: 'catacombs',
    name: 'Catacombs',
    nameZh: '地下墓穴',
    stageRange: [7, 9],
    bossStage: 9,
    bossType: 'crypt-guardian',
    theme: 'underground',
    backgroundImage: '/assets/backgrounds/stage-7-catacombs-entrance.png',
  },
  'graveyard': {
    id: 'graveyard',
    name: 'Misty Graveyard',
    nameZh: '迷雾墓地',
    stageRange: [10, 12],
    bossStage: 12,
    bossType: 'graveyard-lord',
    theme: 'graveyard',
    backgroundImage: '/assets/backgrounds/stage-10-graveyard-entrance.png',
  },
  'ancient-tomb': {
    id: 'ancient-tomb',
    name: 'Ancient Tomb',
    nameZh: '古老陵墓',
    stageRange: [13, 15],
    bossStage: 15,
    bossType: 'zombie-king',
    theme: 'tomb',
    backgroundImage: '/assets/backgrounds/stage-13-tomb-entrance.png',
  },
  'cursed-forest': {
    id: 'cursed-forest',
    name: 'Cursed Forest',
    nameZh: '诅咒森林',
    stageRange: [16, 18],
    bossStage: 18,
    bossType: 'werewolf-alpha',
    theme: 'forest',
    backgroundImage: '/assets/backgrounds/stage-16-forest-edge.png',
  },
  'castle-hall': {
    id: 'castle-hall',
    name: 'Castle Hall',
    nameZh: '城堡大厅',
    stageRange: [19, 21],
    bossStage: 21,
    bossType: 'castle-commander',
    theme: 'castle',
    backgroundImage: '/assets/backgrounds/stage-19-castle-entrance.png',
  },
  'library': {
    id: 'library',
    name: 'Ancient Library',
    nameZh: '古老图书馆',
    stageRange: [22, 24],
    bossStage: 24,
    bossType: 'ancient-librarian',
    theme: 'library',
    backgroundImage: '/assets/backgrounds/stage-22-library-entrance.png',
  },
  'torture-chamber': {
    id: 'torture-chamber',
    name: 'Succubus Torture Chamber',
    nameZh: '魅魔刑讯室',
    stageRange: [25, 27],
    bossStage: 27,
    bossType: 'succubus',
    theme: 'torture',
    backgroundImage: '/assets/backgrounds/stage-25-torture-entrance.png',
  },
  'throne-room': {
    id: 'throne-room',
    name: 'Throne Room',
    nameZh: '王座厅',
    stageRange: [28, 30],
    bossStage: 30,
    bossType: 'vampire-king',
    theme: 'throne',
    backgroundImage: '/assets/backgrounds/stage-28-throne-approach.png',
  },
};

// 30个关卡配置（简化版）
export const STAGES: StageConfig[] = Array.from({ length: 30 }, (_, i) => {
  const stageNumber = i + 1;
  const sceneIndex = Math.floor((stageNumber - 1) / 3);
  const sceneKeys = Object.keys(SCENES);
  const scene = SCENES[sceneKeys[sceneIndex]];
  const isThirdStage = (stageNumber % 3) === 0;
  
  // 根据场景分配对应的新怪物类型（使用实际的动画文件夹名称）
  // BOSS关（第3关）只有爆炸蝙蝠，小怪关有场景专属怪物
  const sceneEnemyTypes: Record<string, EnemyType[]> = {
    'church': ['corrupted-believer', 'evil-nun'],
    'bell-tower': ['tower-ghost', 'vampire-bat'],
    'catacombs': ['crawling-skeleton', 'crypt-zombie'],
    'graveyard': ['graveyard-wraith', 'crypt-zombie'],
    'ancient-tomb': ['mummy', 'skeleton-warrior'],
    'cursed-forest': ['cursed-wolf', 'tree-demon'],
    'castle-hall': ['armor-ghost', 'vampire-guard'],
    'library': ['flying-book', 'ink-demon'],
    'torture-chamber': ['charm-rose', 'whip-demon'],
    'throne-room': ['elite-vampire', 'blood-knight'],
  };
  
  // BOSS关只有爆炸蝙蝠，小怪关有场景专属怪物+爆炸蝙蝠
  const enemyTypes: EnemyType[] = isThirdStage 
    ? ['bomb-bat'] as EnemyType[]
    : [...(sceneEnemyTypes[scene.id] || ['corrupted-believer', 'evil-nun']), 'bomb-bat'] as EnemyType[];
  
  return {
    id: `stage-${stageNumber}`,
    stageNumber,
    sceneId: scene.id,
    sceneName: scene.name,
    sceneNameZh: scene.nameZh,
    name: `Stage ${stageNumber}`,
    nameZh: `关卡${stageNumber}`,
    difficulty: stageNumber <= 6 ? 'easy' : stageNumber <= 18 ? 'normal' : 'hard',
    isBossStage: isThirdStage,
    bossType: isThirdStage ? scene.bossType : undefined,
    enemyTypes,
    // 为每个场景分配合适的歌曲
    musicId: (() => {
      const sceneMusicMap: Record<string, string> = {
        'church': 'nocturnal-hunger', // 场景1：废弃教堂
        'bell-tower': 'witches-parade-assassin', // 场景2：钟楼
        'catacombs': 'cathedral-of-hollow-echoes', // 场景3：地下墓穴
        'graveyard': 'electric-shadows-whispering-doom', // 场景4：迷雾墓地
        'ancient-tomb': 'blood-moon-rises-2', // 场景5：古老陵墓
        'cursed-forest': 'highlands-breath', // 场景6：诅咒森林
        'castle-hall': 'nocturnal-hunger-3', // 场景7：城堡大厅
        'library': 'electric-shadows-whispering-doom-2', // 场景8：图书馆
        'torture-chamber': 'cathedral-of-blood-and-bone', // 场景9：刑讯室
        'throne-room': 'battle-of-the-highlands', // 场景10：王座厅
      };
      return sceneMusicMap[scene.id] || 'nocturnal-hunger';
    })(),
    backgroundImage: (() => {
      // 手动映射每个关卡的背景图
      const bgMap: Record<number, string> = {
        1: '/assets/backgrounds/stage-1-church-entrance.png',
        2: '/assets/backgrounds/stage-2-church-corridor.png',
        3: '/assets/backgrounds/stage-3-church-altar-boss.png',
        4: '/assets/backgrounds/stage-4-tower-stairs.png',
        5: '/assets/backgrounds/stage-5-tower-clockwork.png',
        6: '/assets/backgrounds/ui-design-pixel-v3.png',
        7: '/assets/backgrounds/stage-7-catacombs-entrance.png',
        8: '/assets/backgrounds/stage-8-catacombs-ossuary.png',
        9: '/assets/backgrounds/stage-9-catacombs-guardian-boss.png',
        10: '/assets/backgrounds/stage-10-graveyard-entrance.png',
        11: '/assets/backgrounds/stage-11-graveyard-path.png',
        12: '/assets/backgrounds/stage-12-graveyard-lord-boss.png',
        13: '/assets/backgrounds/stage-13-tomb-entrance.png',
        14: '/assets/backgrounds/stage-14-tomb-chamber.png',
        15: '/assets/backgrounds/stage-15-tomb-king-boss.png',
        16: '/assets/backgrounds/stage-16-forest-edge.png',
        17: '/assets/backgrounds/stage-17-forest-depths.png',
        18: '/assets/backgrounds/stage-18-forest-alpha-boss.png',
        19: '/assets/backgrounds/stage-19-castle-entrance.png',
        20: '/assets/backgrounds/stage-20-castle-corridor.png',
        21: '/assets/backgrounds/stage-21-castle-commander-boss.png',
        22: '/assets/backgrounds/stage-22-library-entrance.png',
        23: '/assets/backgrounds/stage-23-library-halls.png',
        24: '/assets/backgrounds/stage-24-library-librarian-boss.png',
        25: '/assets/backgrounds/stage-25-torture-entrance.png',
        26: '/assets/backgrounds/stage-26-torture-chamber.png',
        27: '/assets/backgrounds/stage-27-torture-succubus-boss.png',
        28: '/assets/backgrounds/stage-28-throne-approach.png',
        29: '/assets/backgrounds/stage-29-throne-hall.png',
        30: '/assets/backgrounds/stage-30-throne-king-boss.png',
      };
      return bgMap[stageNumber] || '/assets/backgrounds/stage-1-church-entrance.png';
    })(),
    unlockRequirement: stageNumber === 1 ? null : `stage-${stageNumber - 1}`,
    description: `${scene.nameZh} - 第${stageNumber % 3 || 3}关${isThirdStage ? ' (BOSS战)' : ''}`,
  };
});

export function isStageUnlocked(stageId: string, completedStages: string[]): boolean {
  // 为了测试，解锁所有30个关卡
  return true;
  
  // 原始解锁逻辑（已禁用）
  // const stage = STAGES.find(s => s.id === stageId);
  // if (!stage) return false;
  // if (!stage.unlockRequirement) return true;
  // return completedStages.includes(stage.unlockRequirement);
}

export function getSceneByStageNumber(stageNumber: number): SceneInfo | null {
  const sceneIndex = Math.floor((stageNumber - 1) / 3);
  const sceneKeys = Object.keys(SCENES);
  return SCENES[sceneKeys[sceneIndex]] || null;
}
