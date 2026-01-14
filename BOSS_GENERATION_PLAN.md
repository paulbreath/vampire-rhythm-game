# BOSS生成计划 - 根据用户反馈

**更新时间**: 2026-01-11  
**状态**: 待执行

---

## 📋 用户反馈要点

### 重大变更
- **第9章BOSS更换**：炼金术师幽灵 → **魅魔 (Succubus)**
- **第9章关卡更名**：炼金实验室 → **刑讯室**

### 生成策略
所有缺失的动画都基于现有的attack或idle状态重做，保持视觉一致性

---

## 🎯 需要生成的BOSS动画清单

### 1. 蝙蝠王 (Bat King) - 1个动画
- ❌ **idle** - 基于attack重做
- ✅ attack - 已有
- ❌ hurt - 缺失（用户未要求）
- ❌ death - 缺失（用户未要求）

### 2. 墓穴守护者 (Crypt Guardian) - 1个动画
- ❌ **idle** - 基于attack重做
- ✅ attack - 已有
- ✅ hurt - 已有
- ✅ death - 已有

### 3. 墓地领主 (Graveyard Lord) - 1个动画
- ❌ **idle** - 基于attack重做
- ✅ attack - 已有
- ✅ hurt - 已有
- ✅ death - 已有

### 4. 僵尸王 (Zombie King) - 1个动画
- ✅ idle - 已有
- ❌ **attack** - 基于idle重做
- ✅ hurt - 已有
- ✅ death - 已有

### 5. 森林狼王 (Werewolf Alpha) - 1个动画
- ❌ **idle** - 基于attack重做
- ✅ attack - 已有
- ✅ hurt - 已有
- ✅ death - 已有

### 6. 图书馆馆长 (Ancient Librarian) - 2个动画
- ❌ **idle** - 基于attack重做
- ✅ attack - 已有
- ❌ **hurt** - 基于attack重做
- ✅ death - 已有

### 7. 魅魔 (Succubus) - 1个动画 ⭐ 新BOSS
- ✅ idle - 已有 (boss-succubus-idle.png)
- ✅ attack - 已有 (boss-succubus-attack.png)
- ✅ hurt - 已有 (boss-succubus-hurt.png)
- ❌ **death** - 基于attack重做

---

## 📊 生成任务总结

**总计需要生成**: 8个BOSS动画

### 批次1：idle动画（4个）
1. 蝙蝠王 idle（参考attack）
2. 墓穴守护者 idle（参考attack）
3. 墓地领主 idle（参考attack）
4. 森林狼王 idle（参考attack）

### 批次2：attack动画（1个）
5. 僵尸王 attack（参考idle）

### 批次3：hurt动画（1个）
6. 图书馆馆长 hurt（参考attack）

### 批次4：idle动画（1个）
7. 图书馆馆长 idle（参考attack）

### 批次5：death动画（1个）
8. 魅魔 death（参考attack）

---

## 🎨 生成要求

1. **保持视觉一致性**：所有新生成的动画必须与现有动画风格一致
2. **使用参考图**：每个生成都使用对应BOSS的现有动画作为参考
3. **sprite sheet格式**：2行×4列=8帧动画
4. **透明背景**：所有图片使用透明背景
5. **像素艺术风格**：Castlevania风格的高质量像素艺术

---

## 📝 stages.ts需要更新

需要将第9章的关卡信息更新：
- 关卡名称：炼金实验室 → 刑讯室
- BOSS名称：炼金术师幽灵 → 魅魔
- 背景图可能需要更换
