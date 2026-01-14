// 玩家信息和Avatar系统

export interface PlayerProfile {
  name: string;
  avatar: string; // Avatar图标（emoji或图片URL）
  level: number;
  experience: number;
  totalScore: number;
  totalKills: number;
  achievements: string[];
  createdAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// 成就列表
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Complete your first stage',
    icon: '🩸',
    unlocked: false,
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Reach 50x combo',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'normal_hunter',
    name: 'Normal Hunter',
    description: 'Complete all stages on Normal',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'hard_hunter',
    name: 'Hard Hunter',
    description: 'Complete all stages on Hard',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'insane_hunter',
    name: 'Insane Hunter',
    description: 'Complete all stages on Insane',
    icon: '💀',
    unlocked: false,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete a stage without losing any health',
    icon: '💎',
    unlocked: false,
  },
  {
    id: 'slayer',
    name: 'Slayer',
    description: 'Kill 1000 enemies',
    icon: '⚔️',
    unlocked: false,
  },
];

// Avatar选项
export const AVATAR_OPTIONS = [
  '🧛', // 吸血鬼
  '🐺', // 狼人
  '🦇', // 蝙蝠
  '⚔️', // 剑
  '🗡️', // 匕首
  '🏰', // 城堡
  '🌙', // 月亮
  '💀', // 骷髅
  '👻', // 幽灵
  '🎃', // 南瓜
];

class PlayerProfileManager {
  private static readonly STORAGE_KEY = 'vampire_rhythm_profile';

  // 获取默认配置
  private getDefaultProfile(): PlayerProfile {
    return {
      name: 'Hunter',
      avatar: '🧛',
      level: 1,
      experience: 0,
      totalScore: 0,
      totalKills: 0,
      achievements: [],
      createdAt: Date.now(),
    };
  }

  // 加载玩家信息
  loadProfile(): PlayerProfile {
    try {
      const saved = localStorage.getItem(PlayerProfileManager.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as PlayerProfile;
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
    return this.getDefaultProfile();
  }

  // 保存玩家信息
  saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(PlayerProfileManager.STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  // 更新玩家名称
  updateName(profile: PlayerProfile, name: string): PlayerProfile {
    const newProfile = { ...profile, name };
    this.saveProfile(newProfile);
    return newProfile;
  }

  // 更新Avatar
  updateAvatar(profile: PlayerProfile, avatar: string): PlayerProfile {
    const newProfile = { ...profile, avatar };
    this.saveProfile(newProfile);
    return newProfile;
  }

  // 添加经验值
  addExperience(profile: PlayerProfile, exp: number): PlayerProfile {
    const newProfile = { ...profile };
    newProfile.experience += exp;
    
    // 升级逻辑：每100经验升1级
    while (newProfile.experience >= 100 * newProfile.level) {
      newProfile.experience -= 100 * newProfile.level;
      newProfile.level++;
    }
    
    this.saveProfile(newProfile);
    return newProfile;
  }

  // 添加分数
  addScore(profile: PlayerProfile, score: number): PlayerProfile {
    const newProfile = { ...profile };
    newProfile.totalScore += score;
    this.saveProfile(newProfile);
    return newProfile;
  }

  // 添加击杀数
  addKills(profile: PlayerProfile, kills: number): PlayerProfile {
    const newProfile = { ...profile };
    newProfile.totalKills += kills;
    this.saveProfile(newProfile);
    return newProfile;
  }

  // 解锁成就
  unlockAchievement(profile: PlayerProfile, achievementId: string): PlayerProfile {
    const newProfile = { ...profile };
    if (!newProfile.achievements.includes(achievementId)) {
      newProfile.achievements.push(achievementId);
      this.saveProfile(newProfile);
    }
    return newProfile;
  }

  // 重置配置（调试用）
  resetProfile(): PlayerProfile {
    const profile = this.getDefaultProfile();
    this.saveProfile(profile);
    return profile;
  }
}

export const playerProfileManager = new PlayerProfileManager();
