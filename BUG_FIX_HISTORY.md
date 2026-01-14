# Blood Rhapsody - BUG修复历史记录

> **重要**: 遇到问题时,先查阅此文档,按照已验证的方法修复。如果之前的方法不可行,再寻找其他办法。

---

## 目录
- [BOSS系统相关](#boss系统相关)
- [性能优化相关](#性能优化相关)
- [UI显示相关](#ui显示相关)

---

## BOSS系统相关

### BUG #001: BOSS类型映射错误 (2026-01-14)

**问题描述**:
- 关卡3应该显示"fallen-priest"(堕落牧师),但实际显示"demon-twin-king"(恶魔双头王)
- BOSS血条显示4500/4000,超过最大值

**根本原因**:
- `bossTypes.ts` 和 `newMapSystem.ts` 中的BOSS类型名称不一致
- `getBossTypeByStage` 函数使用了错误的映射关系

**修复方法**:
1. 统一BOSS类型名称为 `newMapSystem.ts` 中的命名
2. 修改 `client/src/data/bossTypes.ts`:
   - 更新 `BossType` 类型定义
   - 更新 `BOSS_TYPES` 配置对象的key
   - 更新 `getBossTypeByStage` 函数的映射关系

**修改的文件**:
- `client/src/data/bossTypes.ts`

**验证方法**:
- 进入关卡3,检查BOSS是否为fallen-priest
- 检查BOSS血条是否显示4000/4000

**Commit**: `3a9c1db - fix: 修复BOSS系统 - 统一类型名称、修正映射关系、调整位置到右上角`

**状态**: ✅ 已修复并验证

---

### BUG #002: BOSS位置错误 (2026-01-14)

**问题描述**:
- BOSS初始位置在画面右侧外面或中间,不符合设计要求

**根本原因**:
- `gameEngine.ts` 中 `spawnBoss` 函数的位置计算错误

**修复方法**:
1. 修改 `client/src/lib/gameEngine.ts` 的 `spawnBoss` 函数
2. 将BOSS生成位置改为:
   ```typescript
   const x = this.canvas.width - 200; // 右上角X坐标
   const y = 150; // 右上角Y坐标
   ```

**修改的文件**:
- `client/src/lib/gameEngine.ts` (第1474-1476行)

**验证方法**:
- 进入任意BOSS关卡,检查BOSS是否在右上角

**Commit**: `3a9c1db - fix: 修复BOSS系统 - 统一类型名称、修正映射关系、调整位置到右上角`

**状态**: ✅ 已修复并验证

---

## 性能优化相关

(待添加)

---

## UI显示相关

(待添加)

---

## 修复模板

### BUG #XXX: 问题标题 (日期)

**问题描述**:
- 详细描述问题现象

**根本原因**:
- 分析问题的根本原因

**修复方法**:
1. 详细的修复步骤
2. 包含代码片段

**修改的文件**:
- 列出所有修改的文件和行号

**验证方法**:
- 如何验证修复是否成功

**Commit**: `commit hash - commit message`

**状态**: ✅ 已修复并验证 / ⚠️ 部分修复 / ❌ 未修复

---

## 注意事项

1. **每次修复BUG后,必须更新此文档**
2. **包含详细的修复步骤和代码变更**
3. **记录验证方法,便于回归测试**
4. **遇到类似问题时,先查阅此文档**
5. **如果旧方法不可行,记录原因并更新文档**

### BUG #003: BOSS尺寸过大 (2026-01-14)

**问题描述**:
- 8个BOSS的尺寸超过500px或使用未定义的xlarge类型
- medium: 600px (超过)
- large: 720px (超过)
- xlarge: 未定义

**根本原因**:
- 旧的尺寸设计公式"BOSS是主角的2-3倍(720-1000px)"导致BOSS过大
- sizeConfig.ts中没有定义xlarge类型

**旧的尺寸配置**:
```typescript
export const BOSS_SIZES: Record<SizeType, SizeConfig> = {
  small: { height: 480, scale: 1.33 },   // 主角1.33倍
  medium: { height: 600, scale: 1.67 },  // 主角1.67倍
  large: { height: 720, scale: 2.0 },    // 主角2倍
};
```

**修复方法**:
1. 修改 `client/src/data/sizeConfig.ts`,将所有BOSS尺寸调整到不超过500:
   ```typescript
   export const BOSS_SIZES: Record<SizeType, SizeConfig> = {
     small: { height: 360, scale: 1.0 },    // 主角1.0倍
     medium: { height: 430, scale: 1.19 },  // 主角1.19倍
     large: { height: 500, scale: 1.39 },   // 主角1.39倍
   };
   ```

2. 修改 `client/src/data/bossTypes.ts`:
   - 将succubus的sizeType从'xlarge'改为'large'
   - 将vampire-king的sizeType从'xlarge'改为'large'
   - 更新文件头部注释,说明旧公式已作废

**修改的文件**:
- `client/src/data/sizeConfig.ts` (第23-27行)
- `client/src/data/bossTypes.ts` (第1-11行, 第236行, 第258行)

**验证方法**:
- 进入任意BOSS关卡,检查BOSS尺寸是否合适
- 确认所有BOSS都能正常显示

**重要说明**:
- 旧公式"BOSS是主角的2-3倍(720-1000px)"已作废
- 新规则: 所有BOSS高度不超过500px

**Commit**: (待提交)

**状态**: ✅ 已修复,待验证

---

### BUG #004: BOSS图像路径错误 (2026-01-14)

**问题描述**:
- 第15关(zombie-king)、第18关(werewolf-alpha)、第27关(succubus)的BOSS图像无法加载
- 配置文件中使用的图像文件名与实际文件名不匹配

**根本原因**:
- bossTypes.ts中配置的图像路径错误
- zombie-king使用了不存在的"boss-shadow-dragon"
- werewolf-alpha使用了不存在的"boss-alchemist-ghost"
- succubus使用了不存在的"boss-succubus-queen"(实际文件名是"boss-succubus")

**错误的配置**:
```typescript
// zombie-king (关卡15)
spriteSheet: {
  idle: '/boss-characters/boss-shadow-dragon-render-pixel-processed.png',
  ...
}

// werewolf-alpha (关卡18)
spriteSheet: {
  idle: '/boss-characters/boss-alchemist-ghost-render-pixel-processed.png',
  ...
}

// succubus (关卡27)
spriteSheet: {
  idle: '/boss-characters/boss-succubus-queen-render-pixel-processed.png',
  ...
}
```

**修复方法**:
1. 修改 `client/src/data/bossTypes.ts`:
   - zombie-king: 改为 `boss-zombie-king-render-pixel-processed.png`
   - werewolf-alpha: 改为 `boss-werewolf-alpha-render-pixel-processed.png`
   - succubus: 改为 `boss-succubus-render-pixel-processed.png`

**修改的文件**:
- `client/src/data/bossTypes.ts` (第155-159行, 第177-181行, 第243-247行)

**验证方法**:
- 进入关卡15,检查zombie-king是否正常显示
- 进入关卡18,检查werewolf-alpha是否正常显示
- 进入关卡27,检查succubus是否正常显示

**Commit**: (待提交)

**状态**: ✅ 已修复,待验证

---

### BUG #005: BOSS渲染尺寸过大 (2026-01-14)

**问题描述**:
- 关卡15、18、21、27的BOSS在游戏中显示过大,超过了500px高度限制
- 用户要求所有BOSS渲染高度不超过500px

**根本原因**:
- BOSS渲染使用公式: `bossHeight = boss.size * 1.3`
- large类型配置为500px,渲染后 = 500 * 1.3 = 650px,超过限制
- 宽高比硬编码为614/1100,与实际图像279/500不符

**旧的配置**:
```typescript
// sizeConfig.ts
BOSS_SIZES: {
  large: { height: 500, scale: 1.39 }
}

// gameEngine.ts
const aspectRatio = 614 / 1100; // 错误的宽高比
```

**修复方法**:
1. 修改 `client/src/data/sizeConfig.ts`:
   - large: height从500改为385 (385 * 1.3 = 500px)
   - medium: height从430改为330 (330 * 1.3 = 429px)
   - 更新scale值以匹配新高度

2. 修改 `client/src/lib/gameEngine.ts`:
   - 修正BOSS宽高比从614/1100改为279/500 (实际图像尺寸)
   - 保持渲染公式 `boss.size * 1.3` 不变(用户确认以此为准)

3. 修改 `client/src/lib/gameEngine.ts`:
   - 将普通敌人渲染的 `enemy.size * 2` 改为 `enemy.size * 1.5`

**修改的文件**:
- `client/src/data/sizeConfig.ts` (第23-27行)
- `client/src/lib/gameEngine.ts` (第2116-2117行, 第2710-2713行)

**验证方法**:
- 进入关卡15,检查zombie-king渲染高度是否≤500px
- 进入关卡18,检查werewolf-alpha渲染高度是否≤500px
- 进入关卡21,检查castle-commander渲染高度是否≤500px
- 进入关卡27,检查succubus渲染高度是否≤500px

**计算公式**:
- 渲染高度 = boss.size * 1.3
- 要求: 渲染高度 ≤ 500px
- 因此: boss.size ≤ 500 / 1.3 ≈ 385px

**Commit**: (待提交)

**状态**: ✅ 已修复,待验证

---

### BUG #006: BOSS和主角闪现消失问题 (2026-01-14)

**问题描述**:
- 进入BOSS关卡后,主角和BOSS会出现一下,然后突然消失,几秒后又重新出现
- 影响所有BOSS关卡的游戏体验

**根本原因**:
- gameEngine.ts中存在延迟显示逻辑:
  ```typescript
  const bossAppearDelay = 3000; // 3秒延迟
  const shouldShowBoss = musicStartTime === 0 || (currentTime - musicStartTime >= bossAppearDelay);
  ```
- 这个逻辑导致BOSS和主角在音乐开始后3秒内不显示
- 但图像已经加载完成,导致出现"闪现-消失-再出现"的问题

**修复方法**:
1. 删除延迟显示逻辑
2. 修改 `client/src/lib/gameEngine.ts`:
   - 删除 `musicStartTime`、`currentTime`、`bossAppearDelay`、`shouldShowBoss` 相关代码
   - 将 `if (boss && boss.image && boss.image.complete && shouldShowBoss)` 改为 `if (boss && boss.image && boss.image.complete)`
   - 将 `if (shouldShowBoss && this.playerImage && this.playerImage.complete)` 改为 `if (this.playerImage && this.playerImage.complete)`

**修改的文件**:
- `client/src/lib/gameEngine.ts` (第2701-2705行, 第2772行)

**验证方法**:
- 进入任意BOSS关卡
- 检查BOSS和主角是否从游戏开始就一直显示,没有闪现或消失

**用户要求**:
- BOSS和主角一开始就出现,不需要延迟显示

**Commit**: (待提交)

**状态**: ✅ 已修复,待验证

---

### BUG #007: BOSS关卡加载不存在的动画资源 (2026-01-14)

**问题描述**:
- BOSS关卡中出现大量资源加载失败错误:
  - Failed to load IDLE sprite
  - Failed to load ATTACK sprite
  - Failed to load WALK sprite
  - Failed to load HURT sprite
  - Failed to load skeleton animations
- 这些错误不影响游戏运行,但会在控制台产生大量错误信息

**根本原因**:
- BOSS关卡中BOSS和主角都使用静态图片显示,不需要动画sprite
- 但代码仍然尝试加载主角动画sprite(IDLE/WALK/ATTACK/HURT)
- 代码仍然尝试加载skeleton敌人动画
- 这些动画文件路径不存在或文件缺失,导致加载失败

**修复方法**:
1. 在`loadAssets()`函数中添加`isBossStage`判断
2. BOSS关卡跳过主角动画sprite的加载:
   ```typescript
   if (!this.isBossStage) {
     // 加载玩家精灵动画 (IDLE/WALK/ATTACK/HURT)
   } else {
     console.log('BOSS关卡：跳过主角动画加载，使用静态图片');
   }
   ```
3. BOSS关卡跳过skeleton动画的加载:
   ```typescript
   if (!this.isBossStage) {
     this.loadSkeletonAnimations();
   }
   ```

**修改的文件**:
- `client/src/lib/gameEngine.ts` (第315-361行, 第467-470行)

**验证方法**:
- 进入任意BOSS关卡
- 检查控制台是否还有"Failed to load"错误
- 确认BOSS和主角正常显示(使用静态图片)

**用户要求**:
- BOSS关卡中BOSS和主角都是静态图片,不需要动画
- 清理所有尝试加载不存在动画的代码

**Commit**: (待提交)

**状态**: ✅ 已修复,待验证

---
