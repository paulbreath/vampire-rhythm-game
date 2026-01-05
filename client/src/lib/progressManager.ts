// 进度管理系统 - 处理关卡解锁、难度解锁、分数保存等

export type DifficultyLevel = 'normal' | 'hard' | 'insane';

export interface StageProgress {
  normal: { completed: boolean; highScore: number };
  hard: { completed: boolean; highScore: number };
  insane: { completed: boolean; highScore: number };
}

export interface Stage {
  id: string;
  name: string;
  scene: 'church' | 'graveyard' | 'castle';
  backgroundImage: string;
  music: string;
  progress: StageProgress;
}

export interface PlayerProgress {
  stages: Stage[];
  unlockedDifficulties: DifficultyLevel[];
  currentStage: number;
  currentDifficulty: DifficultyLevel;
}

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  speedMultiplier: number;
  densityMultiplier: number;
}

// 难度配置（基于心流理论）
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  normal: {
    id: 'normal',
    name: 'Normal',
    speedMultiplier: 1.0,
    densityMultiplier: 1.0,
  },
  hard: {
    id: 'hard',
    name: 'Hard',
    speedMultiplier: 1.3,
    densityMultiplier: 1.4,
  },
  insane: {
    id: 'insane',
    name: 'Insane',
    speedMultiplier: 1.6,
    densityMultiplier: 1.8,
  },
};

// 关卡配置
export const STAGES: Omit<Stage, 'progress'>[] = [
  {
    id: 'church',
    name: 'Church',
    scene: 'church',
    backgroundImage: '/images/backgrounds/castle-bg.png',
    music: 'nocturnal-hunger',
  },
  {
    id: 'graveyard',
    name: 'Graveyard',
    scene: 'graveyard',
    backgroundImage: '/images/backgrounds/graveyard.png',
    music: 'electric-shadows-whispering-doom',
  },
  {
    id: 'castle',
    name: 'Castle',
    scene: 'castle',
    backgroundImage: '/images/backgrounds/castle.png',
    music: 'eternal-bloodlust',
  },
];

class ProgressManager {
  private static readonly STORAGE_KEY = 'vampire_rhythm_progress';

  // 获取默认进度
  private getDefaultProgress(): PlayerProgress {
    return {
      stages: STAGES.map(stage => ({
        ...stage,
        progress: {
          normal: { completed: false, highScore: 0 },
          hard: { completed: false, highScore: 0 },
          insane: { completed: false, highScore: 0 },
        },
      })),
      unlockedDifficulties: ['normal'], // 默认只解锁Normal
      currentStage: 0,
      currentDifficulty: 'normal',
    };
  }

  // 加载进度
  loadProgress(): PlayerProgress {
    try {
      const saved = localStorage.getItem(ProgressManager.STORAGE_KEY);
      if (saved) {
        const progress = JSON.parse(saved) as PlayerProgress;
        // 验证数据完整性
        if (progress.stages && progress.stages.length === STAGES.length) {
          return progress;
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
    return this.getDefaultProgress();
  }

  // 保存进度
  saveProgress(progress: PlayerProgress): void {
    try {
      localStorage.setItem(ProgressManager.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  // 完成关卡
  completeStage(
    progress: PlayerProgress,
    stageIndex: number,
    difficulty: DifficultyLevel,
    score: number
  ): PlayerProgress {
    const newProgress = { ...progress };
    const stage = newProgress.stages[stageIndex];

    // 更新完成状态和最高分
    stage.progress[difficulty].completed = true;
    stage.progress[difficulty].highScore = Math.max(
      stage.progress[difficulty].highScore,
      score
    );

    // 检查是否解锁下一个关卡的当前难度
    if (stageIndex < STAGES.length - 1) {
      // 下一关卡存在，解锁下一关卡的当前难度
      // （实际上不需要显式解锁，因为前端会根据前一关是否完成来判断）
    }

    // 检查是否解锁下一个难度
    newProgress.unlockedDifficulties = this.calculateUnlockedDifficulties(newProgress);

    this.saveProgress(newProgress);
    return newProgress;
  }

  // 计算已解锁的难度
  private calculateUnlockedDifficulties(progress: PlayerProgress): DifficultyLevel[] {
    const unlocked: DifficultyLevel[] = ['normal']; // Normal永远解锁

    // 检查是否所有关卡的Normal都完成
    const allNormalCompleted = progress.stages.every(
      stage => stage.progress.normal.completed
    );
    if (allNormalCompleted) {
      unlocked.push('hard');
    }

    // 检查是否所有关卡的Hard都完成
    const allHardCompleted = progress.stages.every(
      stage => stage.progress.hard.completed
    );
    if (allHardCompleted) {
      unlocked.push('insane');
    }

    return unlocked;
  }

  // 检查关卡是否解锁
  isStageUnlocked(progress: PlayerProgress, stageIndex: number, difficulty: DifficultyLevel): boolean {
    // 测试模式：所有Normal难度关卡默认解锁
    if (difficulty === 'normal') {
      return true;
    }

    // 检查难度是否解锁
    if (!progress.unlockedDifficulties.includes(difficulty)) {
      return false;
    }

    // Hard和Insane难度仍需要完成前一关
    if (stageIndex > 0) {
      const prevStage = progress.stages[stageIndex - 1];
      return prevStage.progress[difficulty].completed;
    }

    return true;
  }

  // 重置进度（调试用）
  resetProgress(): PlayerProgress {
    const progress = this.getDefaultProgress();
    this.saveProgress(progress);
    return progress;
  }
}

export const progressManager = new ProgressManager();
