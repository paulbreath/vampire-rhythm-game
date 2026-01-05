import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { leaderboardManager, type LeaderboardEntry } from "@/lib/leaderboardManager";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'easy' | 'normal' | 'hard'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = () => {
    let data: LeaderboardEntry[];
    if (filter === 'all') {
      data = leaderboardManager.getTopN(10);
    } else {
      data = leaderboardManager.getDifficultyLeaderboard(filter, 10);
    }
    setLeaderboard(data);
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return '#FFD700'; // 金色
    if (rank === 2) return '#C0C0C0'; // 银色
    if (rank === 3) return '#CD7F32'; // 铜色
    return '#9CA3AF'; // 灰色
  };

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏅';
  };

  const formatScore = (score: number): string => {
    return score.toLocaleString();
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gothic background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, currentColor 35px, currentColor 36px)`,
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b-4 border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            onClick={() => setLocation("/")}
            className="pixel-button bg-secondary text-secondary-foreground"
            size="sm"
          >
            ← 返回主菜单
          </Button>
          <h1 className="text-4xl glow-gold" style={{ fontFamily: 'Creepster, cursive' }}>
            LEADERBOARD
          </h1>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* Filter buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => setFilter('all')}
            className={`pixel-button ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            全部
          </Button>
          <Button
            onClick={() => setFilter('easy')}
            className={`pixel-button ${filter === 'easy' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            简单
          </Button>
          <Button
            onClick={() => setFilter('normal')}
            className={`pixel-button ${filter === 'normal' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            普通
          </Button>
          <Button
            onClick={() => setFilter('hard')}
            className={`pixel-button ${filter === 'hard' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            困难
          </Button>
        </div>

        {/* Leaderboard list */}
        <div className="max-w-4xl mx-auto space-y-3">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-muted-foreground">暂无排行榜数据</p>
              <p className="text-sm text-muted-foreground mt-2">完成游戏关卡后，您的成绩将出现在这里</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`
                  p-4 bg-card border-2 rounded-lg flex items-center gap-4
                  ${entry.rank <= 3 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border'}
                  hover:bg-card/80 transition-colors
                `}
              >
                {/* Rank */}
                <div className="flex flex-col items-center min-w-[60px]">
                  <div className="text-3xl">{getRankIcon(entry.rank)}</div>
                  <div
                    className="text-xl font-bold"
                    style={{ color: getRankColor(entry.rank) }}
                  >
                    #{entry.rank}
                  </div>
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{entry.playerAvatar}</span>
                    <span className="text-lg font-bold truncate">{entry.playerName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.stageName} · {entry.difficulty.toUpperCase()} · {formatDate(entry.timestamp)}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl glow-gold font-bold">
                    {formatScore(entry.score)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Combo: <span className="glow-purple">{entry.combo}x</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Test buttons */}
        <div className="flex gap-4 justify-center pt-6">
          <Button
            onClick={() => {
              leaderboardManager.generateTestData();
              loadLeaderboard();
            }}
            className="pixel-button bg-accent text-accent-foreground text-xs"
          >
            生成测试数据
          </Button>
          <Button
            onClick={() => {
              leaderboardManager.clearLeaderboard();
              loadLeaderboard();
            }}
            className="pixel-button bg-destructive text-destructive-foreground text-xs"
          >
            清空排行榜
          </Button>
        </div>
      </div>
    </div>
  );
}
