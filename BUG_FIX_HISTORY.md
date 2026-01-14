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
