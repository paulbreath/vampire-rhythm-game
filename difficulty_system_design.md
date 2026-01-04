# 难度系统和关卡设计

## 难度等级设计

### 1. Normal（普通）
- **敌人速度倍率**: 1.0x
- **敌人密集度**: 1.0x（基准）
- **解锁条件**: 默认解锁

### 2. Hard（困难）
- **敌人速度倍率**: 1.3x
- **敌人密集度**: 1.4x
- **解锁条件**: 通关所有Normal关卡

### 3. Insane（变态）
- **敌人速度倍率**: 1.6x
- **敌人密集度**: 1.8x
- **解锁条件**: 通关所有Hard关卡

## 心流理论应用

根据心流理论，难度提升应该：
1. **速度提升**: 30-40%递增，保持玩家反应挑战
2. **密集度提升**: 40-80%递增，增加决策复杂度
3. **渐进式**: 避免难度断层，保持玩家沉浸感

## 关卡设计

### Stage 1: Church（教堂）
- **场景**: 哥特式教堂内部
- **音乐**: Nocturnal Hunger系列
- **敌人**: 蝙蝠为主
- **难度**: 入门级

### Stage 2: Graveyard（墓地）
- **场景**: 月夜墓地
- **音乐**: 待生成（阴森、诡异）
- **敌人**: 蝙蝠+幽灵
- **难度**: 中等

### Stage 3: Castle（城堡）
- **场景**: 吸血鬼城堡大厅
- **音乐**: 待生成（史诗、紧张）
- **敌人**: 蝙蝠+吸血鬼BOSS
- **难度**: 高级

## 数据结构设计

```typescript
interface Difficulty {
  id: 'normal' | 'hard' | 'insane';
  name: string;
  speedMultiplier: number;
  densityMultiplier: number;
  unlocked: boolean;
}

interface Stage {
  id: string;
  name: string;
  scene: 'church' | 'graveyard' | 'castle';
  backgroundImage: string;
  music: string;
  difficulties: {
    normal: { completed: boolean; highScore: number };
    hard: { completed: boolean; highScore: number };
    insane: { completed: boolean; highScore: number };
  };
}

interface PlayerProgress {
  currentStage: number;
  unlockedDifficulties: ('normal' | 'hard' | 'insane')[];
  stages: Stage[];
}
```

## 解锁逻辑

1. **初始状态**: 只有Stage 1 Normal解锁
2. **关卡解锁**: 通关当前关卡的Normal难度后，解锁下一关卡的Normal难度
3. **难度解锁**: 通关所有关卡的当前难度后，解锁所有关卡的下一难度
4. **进度保存**: 使用localStorage保存玩家进度
