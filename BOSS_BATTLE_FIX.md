# BOSS战斗修复文档

## 🐛 问题描述

玩家在击杀BOSS时，会被高速旋转的护卫炸弹一击必杀，即使有5条命也会瞬间死亡。

## 🔍 问题分析

### 根本原因

1. **护卫炸弹旋转速度过快**
   - 原速度：每帧0.05弧度（约172度/秒）
   - 玩家难以躲避高速旋转的炸弹

2. **连续扣血机制缺陷**
   - `handleSwipe`方法在每次鼠标/触摸移动时都会检测碰撞
   - 如果玩家的光标经过多个炸弹，会在极短时间内多次调用`loseLife()`
   - 没有无敌帧机制，导致5条命在几毫秒内被扣光

3. **BOSS死亡后护卫炸弹清理**
   - 代码已有清理逻辑，但需要确保执行

## ✅ 修复方案

### 1. 降低护卫炸弹旋转速度（60%降速）

**文件**: `client/src/lib/gameEngine.ts`
**位置**: 第477行

```typescript
// 修改前
enemy.guardAngle = (enemy.guardAngle || 0) + 0.05; // 每帧旋转0.05弧度

// 修改后
enemy.guardAngle = (enemy.guardAngle || 0) + 0.02; // 每帧旋转0.02弧度（降低速度）
```

**效果**: 旋转速度从172度/秒降低到69度/秒，玩家有更多反应时间。

### 2. 添加无敌帧机制（核心修复）

**文件**: `client/src/lib/gameEngine.ts`
**位置**: `loseLife()`方法

```typescript
private loseLife(): void {
  // 无敌帧机制：受伤后500ms内不会再次受伤
  const now = Date.now();
  if (now - this.lastLoseLifeTime < 500) {
    return; // 在无敌帧内，忽略伤害
  }
  
  this.lastLoseLifeTime = now;
  this.lives--;
  this.combo = 0;
  this.soundEffects?.playMiss();
  this.onLivesChange?.(this.lives);
  this.onComboChange?.(this.combo);
  
  console.log(`Lost life! Remaining lives: ${this.lives}`);
  
  if (this.lives <= 0) {
    this.gameOver();
  }
}
```

**效果**: 
- 受伤后500ms内不会再次受伤
- 防止连续扣血导致的"一击必杀"
- 即使玩家的光标经过多个炸弹，也只会扣1条命

### 3. 优化BOSS死亡时的护卫炸弹清理

**文件**: `client/src/lib/gameEngine.ts`
**位置**: 第912-917行

```typescript
// 立即移除BOSS的所有护卫炸弹
if (enemy.guardBombs && enemy.guardBombs.length > 0) {
  const guardBombIds = new Set(enemy.guardBombs);
  this.enemies = this.enemies.filter(e => !guardBombIds.has(e.id));
  console.log(`Removed ${enemy.guardBombs.length} guard bombs for BOSS ${enemy.id}`);
}
```

**效果**: 
- 使用Set提高查找效率
- 添加日志确认清理成功
- 确保BOSS死亡时护卫炸弹被立即移除

## 🎮 测试建议

1. 进入有vampire（BOSS）的关卡
2. 击杀BOSS，观察护卫炸弹是否被清理
3. 故意触碰多个炸弹，验证无敌帧机制是否生效
4. 确认不会出现"5条命瞬间被扣光"的情况

## 📊 修复效果

- ✅ 护卫炸弹旋转速度降低60%
- ✅ 添加500ms无敌帧，防止连续扣血
- ✅ 优化BOSS死亡时的护卫炸弹清理
- ✅ 解决"一击必杀"问题

## 🔗 相关文件

- `client/src/lib/gameEngine.ts` - 游戏引擎核心逻辑
- 第477行 - 护卫炸弹旋转速度
- 第1126-1145行 - `loseLife()`方法（无敌帧）
- 第912-917行 - BOSS死亡清理逻辑
