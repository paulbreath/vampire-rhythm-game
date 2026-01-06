# 精灵动画修复测试文档

## 修复内容

### 问题描述
幽灵和骷髅兵显示为整个精灵图的所有8帧叠加在一起，而不是单独播放每一帧。

### 根本原因
1. 只有骷髅兵加载了精灵动画，幽灵没有加载
2. 幽灵在spawnEnemy中没有分配spriteAnimation
3. 幽灵的动画没有在update循环中更新

### 修复方案

#### 1. 扩展动画加载系统
**文件**: `client/src/lib/gameEngine.ts`
**方法**: `loadSkeletonAnimations()`

修改前：
- 只加载骷髅兵的idle和attack动画

修改后：
- 加载骷髅兵的idle和attack动画
- 加载幽灵的idle动画
- 两者独立加载，互不影响

#### 2. 为幽灵分配动画
**文件**: `client/src/lib/gameEngine.ts`
**方法**: `spawnEnemy()`

添加代码：
```typescript
// 为幽灵分配动画
if (enemyType === 'ghost' && this.enemyAnimations.has('ghost')) {
  enemy.spriteAnimation = this.enemyAnimations.get('ghost');
  enemy.animationState = 'idle';
}
```

#### 3. 幽灵动画更新
**文件**: `client/src/lib/gameEngine.ts`
**方法**: `update()`

添加代码：
```typescript
// 幽灵动画更新
if (enemy.type === 'ghost' && enemy.spriteAnimation && enemy.animationState === 'idle') {
  const idleAnim = enemy.spriteAnimation.idle;
  if (idleAnim) {
    idleAnim.update(1/60);
  }
}
```

#### 4. 优化渲染参数
**文件**: `client/src/lib/gameEngine.ts`
**方法**: `render()`

根据敌人类型设置不同的尺寸和偏移：
- **骷髅兵**: 高度360px，向下偏移15%（因为内容在帧的上半部分）
- **幽灵**: 高度200px，居中对齐（比主角小）

## 测试步骤

### 1. 进入游戏
1. 点击"CASTLE MAP"
2. 选择"地下墓穴（Catacombs）"关卡
3. 选择Normal难度
4. 点击"START"进入游戏

### 2. 观察骷髅兵
**预期效果**：
- ✅ 显示为完整的骷髅兵（头到脚）
- ✅ 播放8帧IDLE动画（呼吸/摇晃）
- ✅ 面向左侧（从右往左移动）
- ✅ 高度与主角一致（约360px）
- ✅ 接近主角时播放攻击动画（举剑→劈砍→收剑）
- ✅ 在攻击动画第3帧扣除1滴血

### 3. 观察幽灵
**预期效果**：
- ✅ 显示为半透明幽灵形态
- ✅ 播放8帧IDLE动画（飘浮）
- ✅ 面向左侧
- ✅ 比主角小（约200px高）
- ✅ 波浪移动模式

### 4. 检查控制台日志
打开浏览器开发者工具（F12），查看控制台是否有以下日志：
```
Skeleton animations loaded (idle + attack)
Ghost animations loaded (idle)
```

## 技术细节

### 精灵图规格
- **骷髅兵IDLE**: 1376x768px, 2x4网格, 8帧, 8fps
- **骷髅兵ATTACK**: 1376x768px, 2x4网格, 8帧, 12fps
- **幽灵IDLE**: 1376x768px, 2x4网格, 8帧, 10fps

### 文件大小
- enemy-skeleton-idle.png: 938KB
- enemy-skeleton-attack.png: 831KB（已压缩）
- enemy-ghost-idle.png: 786KB

### 配置文件
**文件**: `client/src/data/enemyAnimations.ts`

```typescript
export const enemySpriteConfigs: Record<string, EnemySpriteConfig> = {
  skeleton: {
    idle: {
      path: '/images/enemy-skeleton-idle.png',
      frameCount: 8,
      fps: 8,
      loop: true,
      cols: 4,
      rows: 2,
    },
    attack: {
      path: '/images/enemy-skeleton-attack.png',
      frameCount: 8,
      fps: 12,
      loop: false,
      cols: 4,
      rows: 2,
    },
  },
  ghost: {
    idle: {
      path: '/images/enemy-ghost-idle.png',
      frameCount: 8,
      fps: 10,
      loop: true,
      cols: 4,
      rows: 2,
    },
  },
};
```

## 已知问题

### 无

目前所有功能正常工作。

## 下一步改进建议

1. **为幽灵添加攻击能力** - 生成幽灵的攻击动画（如能量弹发射），实现远程攻击机制
2. **优化BOSS战斗体验** - 为3个BOSS添加专属攻击动画和技能
3. **添加更多敌人精灵动画** - 为狼人、美杜莎头、乌鸦生成专业的像素风精灵动画

## 参考资源

- SpriteAnimation类: `client/src/lib/spriteAnimation.ts`
- 主角动画配置: `client/src/data/vampireHeroAnimations.ts`
- BOSS动画配置: `client/src/data/bossAnimations.ts`
