// 经验值和等级管理系统
// 参考恶魔城：月下夜想曲的成长系统

export interface PlayerStats {
  level: number;
  exp: number;
  expToNextLevel: number;
  totalExp: number;
  killCount: number;
  maxCombo: number;
  totalScore: number;
}

export interface LevelUpReward {
  level: number;
  unlockMessage: string;
  ability?: string;
}

class ExperienceManager {
  private static readonly STORAGE_KEY = 'vampire_rhythm_player_stats';
  private static readonly BASE_EXP = 100; // 升到2级需要的基础经验
  private static readonly EXP_MULTIPLIER = 1.5; // 每级经验需求增长倍率

  // 获取默认玩家数据
  private getDefaultStats(): PlayerStats {
    return {
      level: 1,
      exp: 0,
      expToNextLevel: ExperienceManager.BASE_EXP,
      totalExp: 0,
      killCount: 0,
      maxCombo: 0,
      totalScore: 0
    };
  }

  // 加载玩家数据
  loadStats(): PlayerStats {
    try {
      const saved = localStorage.getItem(ExperienceManager.STORAGE_KEY);
      if (saved) {
        const stats = JSON.parse(saved);
        // 确保expToNextLevel正确
        stats.expToNextLevel = this.calculateExpForLevel(stats.level + 1) - stats.totalExp;
        return stats;
      }
    } catch (error) {
      console.error('Failed to load player stats:', error);
    }
    return this.getDefaultStats();
  }

  // 保存玩家数据
  saveStats(stats: PlayerStats): void {
    try {
      localStorage.setItem(ExperienceManager.STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save player stats:', error);
    }
  }

  // 计算升到指定等级需要的总经验
  calculateExpForLevel(level: number): number {
    if (level <= 1) return 0;
    
    let totalExp = 0;
    for (let i = 1; i < level; i++) {
      totalExp += Math.floor(ExperienceManager.BASE_EXP * Math.pow(ExperienceManager.EXP_MULTIPLIER, i - 1));
    }
    return totalExp;
  }

  // 添加经验值
  addExp(currentStats: PlayerStats, expGained: number): { 
    newStats: PlayerStats; 
    leveledUp: boolean; 
    newLevel?: number;
    rewards?: LevelUpReward[];
  } {
    const newStats = { ...currentStats };
    newStats.exp += expGained;
    newStats.totalExp += expGained;
    
    let leveledUp = false;
    const rewards: LevelUpReward[] = [];
    
    // 检查是否升级（可能连续升级）
    while (newStats.exp >= newStats.expToNextLevel) {
      newStats.exp -= newStats.expToNextLevel;
      newStats.level++;
      leveledUp = true;
      
      // 计算下一级需要的经验
      const nextLevelTotalExp = this.calculateExpForLevel(newStats.level + 1);
      newStats.expToNextLevel = nextLevelTotalExp - newStats.totalExp + newStats.exp;
      
      // 获取升级奖励
      const reward = this.getLevelUpReward(newStats.level);
      if (reward) {
        rewards.push(reward);
      }
      
      console.log(`Level up! Now level ${newStats.level}. Next level requires ${newStats.expToNextLevel} exp.`);
    }
    
    this.saveStats(newStats);
    
    return {
      newStats,
      leveledUp,
      newLevel: leveledUp ? newStats.level : undefined,
      rewards: rewards.length > 0 ? rewards : undefined
    };
  }

  // 更新击杀数
  addKill(currentStats: PlayerStats): PlayerStats {
    const newStats = { ...currentStats };
    newStats.killCount++;
    this.saveStats(newStats);
    return newStats;
  }

  // 更新最大连击
  updateMaxCombo(currentStats: PlayerStats, combo: number): PlayerStats {
    const newStats = { ...currentStats };
    if (combo > newStats.maxCombo) {
      newStats.maxCombo = combo;
      this.saveStats(newStats);
    }
    return newStats;
  }

  // 更新总分数
  updateTotalScore(currentStats: PlayerStats, score: number): PlayerStats {
    const newStats = { ...currentStats };
    if (score > newStats.totalScore) {
      newStats.totalScore = score;
      this.saveStats(newStats);
    }
    return newStats;
  }

  // 获取升级奖励
  private getLevelUpReward(level: number): LevelUpReward | null {
    const rewards: Record<number, LevelUpReward> = {
      2: { level: 2, unlockMessage: '攻击范围增加！', ability: 'attack_range_up' },
      3: { level: 3, unlockMessage: '移动速度提升！', ability: 'move_speed_up' },
      5: { level: 5, unlockMessage: '解锁双重攻击！', ability: 'double_attack' },
      7: { level: 7, unlockMessage: '最大生命值+1！', ability: 'max_hp_up' },
      10: { level: 10, unlockMessage: '解锁范围攻击！', ability: 'area_attack' },
      12: { level: 12, unlockMessage: '连击奖励翻倍！', ability: 'combo_bonus_x2' },
      15: { level: 15, unlockMessage: '解锁穿透攻击！', ability: 'pierce_attack' },
      20: { level: 20, unlockMessage: '解锁狂暴模式！', ability: 'berserk_mode' },
      25: { level: 25, unlockMessage: '解锁时间减速！', ability: 'time_slow' },
      30: { level: 30, unlockMessage: '吸血鬼猎人大师！', ability: 'master_hunter' }
    };
    
    return rewards[level] || null;
  }

  // 计算击杀敌人的经验值（基于敌人类型和连击）
  calculateKillExp(enemyType: string, combo: number): number {
    // 基础经验值
    const baseExp: Record<string, number> = {
      'bat_blue': 5,
      'bat_purple': 8,
      'bat_red': 12,
      'bat_yellow': 10,
      'vampire': 25,
      'skeleton': 15,
      'ghost': 12,
      'werewolf': 30,
      'medusa_head': 18,
      'crow': 20,
      'bomb': 0 // 炸弹不给经验
    };
    
    const exp = baseExp[enemyType] || 5;
    
    // 连击加成：每10连击增加10%经验
    const comboBonus = Math.floor(combo / 10) * 0.1;
    const totalExp = Math.floor(exp * (1 + comboBonus));
    
    return totalExp;
  }

  // 重置玩家数据（用于测试或重新开始）
  resetStats(): PlayerStats {
    const defaultStats = this.getDefaultStats();
    this.saveStats(defaultStats);
    return defaultStats;
  }
}

// 导出单例
export const experienceManager = new ExperienceManager();
