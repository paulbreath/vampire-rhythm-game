// 排行榜管理器
export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  playerAvatar: string; // emoji或图标
  score: number;
  combo: number;
  stageId: string;
  stageName: string;
  difficulty: string;
  timestamp: number;
}

const LEADERBOARD_STORAGE_KEY = 'vampire_rhythm_leaderboard';
const MAX_LEADERBOARD_SIZE = 100; // 最多保存100条记录

class LeaderboardManager {
  // 保存战斗记录到排行榜
  public saveScore(entry: Omit<LeaderboardEntry, 'rank'>): void {
    const leaderboard = this.loadLeaderboard();
    
    // 添加新记录
    leaderboard.push({
      ...entry,
      rank: 0 // 临时rank，后面会重新计算
    });
    
    // 按分数降序排序
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // 分数相同时，按combo排序
      if (b.combo !== a.combo) {
        return b.combo - a.combo;
      }
      // 都相同时，按时间排序（早的在前）
      return a.timestamp - b.timestamp;
    });
    
    // 重新计算rank
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    // 只保留前MAX_LEADERBOARD_SIZE条
    const trimmedLeaderboard = leaderboard.slice(0, MAX_LEADERBOARD_SIZE);
    
    // 保存到localStorage
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(trimmedLeaderboard));
  }
  
  // 加载排行榜
  public loadLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (!data) return [];
      
      const leaderboard = JSON.parse(data) as LeaderboardEntry[];
      return leaderboard;
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      return [];
    }
  }
  
  // 获取前N名
  public getTopN(n: number = 10): LeaderboardEntry[] {
    const leaderboard = this.loadLeaderboard();
    return leaderboard.slice(0, n);
  }
  
  // 获取指定关卡的排行榜
  public getStageLeaderboard(stageId: string, n: number = 10): LeaderboardEntry[] {
    const leaderboard = this.loadLeaderboard();
    const stageLeaderboard = leaderboard.filter(entry => entry.stageId === stageId);
    return stageLeaderboard.slice(0, n);
  }
  
  // 获取指定难度的排行榜
  public getDifficultyLeaderboard(difficulty: string, n: number = 10): LeaderboardEntry[] {
    const leaderboard = this.loadLeaderboard();
    const difficultyLeaderboard = leaderboard.filter(entry => entry.difficulty === difficulty);
    return difficultyLeaderboard.slice(0, n);
  }
  
  // 获取玩家的最佳记录
  public getPlayerBestScore(playerName: string): LeaderboardEntry | null {
    const leaderboard = this.loadLeaderboard();
    const playerRecords = leaderboard.filter(entry => entry.playerName === playerName);
    return playerRecords.length > 0 ? playerRecords[0] : null;
  }
  
  // 获取玩家在排行榜中的排名
  public getPlayerRank(playerName: string): number {
    const bestScore = this.getPlayerBestScore(playerName);
    return bestScore ? bestScore.rank : -1;
  }
  
  // 清空排行榜（测试用）
  public clearLeaderboard(): void {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  }
  
  // 生成测试数据
  public generateTestData(): void {
    const testNames = [
      { name: 'Dracula', avatar: '🧛' },
      { name: 'Alucard', avatar: '⚔️' },
      { name: 'Vampire Hunter', avatar: '🗡️' },
      { name: 'Blood Moon', avatar: '🌙' },
      { name: 'Night Stalker', avatar: '🦇' },
      { name: 'Crimson Blade', avatar: '🔴' },
      { name: 'Shadow Walker', avatar: '👤' },
      { name: 'Dark Knight', avatar: '🛡️' },
      { name: 'Soul Reaper', avatar: '💀' },
      { name: 'Phantom', avatar: '👻' }
    ];
    
    const stages = [
      { id: 'abandoned-church', name: '废弃教堂' },
      { id: 'bell-tower', name: '教堂钟楼' },
      { id: 'catacombs', name: '地下墓穴' },
      { id: 'misty-graveyard', name: '迷雾墓地' },
      { id: 'ancient-tomb', name: '古老陵墓' }
    ];
    
    const difficulties = ['normal', 'hard', 'insane'];
    
    // 生成50条测试数据
    for (let i = 0; i < 50; i++) {
      const player = testNames[Math.floor(Math.random() * testNames.length)];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      this.saveScore({
        playerName: player.name,
        playerAvatar: player.avatar,
        score: Math.floor(Math.random() * 100000) + 10000,
        combo: Math.floor(Math.random() * 500) + 50,
        stageId: stage.id,
        stageName: stage.name,
        difficulty: difficulty,
        timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000) // 最近7天内
      });
    }
    
    console.log('Test leaderboard data generated!');
  }
}

// 导出单例
export const leaderboardManager = new LeaderboardManager();
