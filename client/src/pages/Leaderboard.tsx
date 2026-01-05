import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GlassButton } from "@/components/ui/glass-button";
import { leaderboardManager, type LeaderboardEntry } from "@/lib/leaderboardManager";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'easy' | 'normal' | 'hard'>('all');
  const [bats, setBats] = useState<Array<{ id: number; x: number; y: number; speed: number; direction: number }>>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  // 生成飘动的蝙蝠
  useEffect(() => {
    const newBats = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.2 + Math.random() * 0.3,
      direction: Math.random() * Math.PI * 2,
    }));
    setBats(newBats);

    const interval = setInterval(() => {
      setBats(prevBats =>
        prevBats.map(bat => {
          let newX = bat.x + Math.cos(bat.direction) * bat.speed;
          let newY = bat.y + Math.sin(bat.direction) * bat.speed;
          let newDirection = bat.direction;

          if (newX < 0 || newX > 100) {
            newDirection = Math.PI - newDirection;
            newX = Math.max(0, Math.min(100, newX));
          }
          if (newY < 0 || newY > 100) {
            newDirection = -newDirection;
            newY = Math.max(0, Math.min(100, newY));
          }

          return { ...bat, x: newX, y: newY, direction: newDirection };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

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

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleGenerateTestData = () => {
    leaderboardManager.generateTestData();
    loadLeaderboard();
  };

  const handleClearLeaderboard = () => {
    leaderboardManager.clearLeaderboard();
    loadLeaderboard();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* 暗色背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-black to-black" />

      {/* 飘动的蝙蝠 */}
      {bats.map(bat => (
        <div
          key={bat.id}
          className="absolute text-xl transition-all duration-1000 ease-linear opacity-30 z-10"
          style={{
            left: `${bat.x}%`,
            top: `${bat.y}%`,
            transform: `translate(-50%, -50%) scaleX(${Math.cos(bat.direction) > 0 ? 1 : -1})`,
            textShadow: '0 0 10px rgba(255, 0, 100, 0.5)',
          }}
        >
          🦇
        </div>
      ))}

      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b-2 border-yellow-600/30 p-4">
        <div className="container flex items-center justify-between">
          <GlassButton
            onClick={() => setLocation("/")}
            size="sm"
            variant="secondary"
            icon="←"
          >
            BACK
          </GlassButton>
          
          <h1 
            className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500"
            style={{ fontFamily: 'serif' }}
          >
            🏆 LEADERBOARD
          </h1>
          
          <div className="w-24" />
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-20 pt-24 pb-8 px-4 container">
        {/* 筛选按钮 */}
        <div className="flex gap-4 justify-center mb-8 flex-wrap">
          <GlassButton
            onClick={() => setFilter('all')}
            size="sm"
            variant={filter === 'all' ? 'primary' : 'secondary'}
          >
            ALL
          </GlassButton>
          <GlassButton
            onClick={() => setFilter('easy')}
            size="sm"
            variant={filter === 'easy' ? 'primary' : 'secondary'}
          >
            EASY
          </GlassButton>
          <GlassButton
            onClick={() => setFilter('normal')}
            size="sm"
            variant={filter === 'normal' ? 'primary' : 'secondary'}
          >
            NORMAL
          </GlassButton>
          <GlassButton
            onClick={() => setFilter('hard')}
            size="sm"
            variant={filter === 'hard' ? 'primary' : 'secondary'}
          >
            HARD
          </GlassButton>
        </div>

        {/* 排行榜列表 */}
        <div className="max-w-4xl mx-auto space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No records yet</p>
              <GlassButton
                onClick={handleGenerateTestData}
                size="md"
                variant="secondary"
                icon="🎲"
              >
                GENERATE TEST DATA
              </GlassButton>
            </div>
          ) : (
            <>
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const rankColor = getRankColor(rank);
                const rankIcon = getRankIcon(rank);

                return (
                  <div
                    key={entry.id}
                    className="bg-black/60 backdrop-blur-sm border-2 rounded-lg p-4 transition-all hover:scale-105"
                    style={{
                      borderColor: rank <= 3 ? rankColor : 'rgba(107, 114, 128, 0.5)',
                      boxShadow: rank <= 3 ? `0 0 20px ${rankColor}40` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* 排名 */}
                      <div 
                        className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                        style={{
                          backgroundColor: `${rankColor}20`,
                          border: `3px solid ${rankColor}`,
                          color: rankColor,
                          textShadow: `0 0 10px ${rankColor}`,
                        }}
                      >
                        {rankIcon}
                      </div>

                      {/* 玩家信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{entry.avatar}</span>
                          <span className="text-white font-bold text-lg truncate">
                            {entry.playerName}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                          <span>🗡️ {entry.stageName}</span>
                          <span>⚔️ {entry.difficulty.toUpperCase()}</span>
                          <span>🔥 {entry.combo}x Combo</span>
                          <span>🕐 {formatDate(entry.timestamp)}</span>
                        </div>
                      </div>

                      {/* 分数 */}
                      <div className="flex-shrink-0 text-right">
                        <div 
                          className="text-3xl font-bold"
                          style={{
                            color: rankColor,
                            textShadow: `0 0 15px ${rankColor}`,
                          }}
                        >
                          {formatScore(entry.score)}
                        </div>
                        <div className="text-xs text-gray-500">SCORE</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 测试按钮 */}
              <div className="flex gap-4 justify-center mt-8">
                <GlassButton
                  onClick={handleGenerateTestData}
                  size="sm"
                  variant="danger"
                  icon="🎲"
                >
                  GENERATE TEST DATA
                </GlassButton>
                <GlassButton
                  onClick={handleClearLeaderboard}
                  size="sm"
                  variant="danger"
                  icon="🗑️"
                >
                  CLEAR ALL
                </GlassButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
