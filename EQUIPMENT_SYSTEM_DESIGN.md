# 装备系统设计文档

## 设计理念

参考《恶魔城：月下夜想曲》的装备系统，为《Vampire Rhythm》设计一个深度的装备收集和成长系统。

---

## 装备类型

### 1. 武器 (Weapon)
- **作用**：影响攻击力、攻击范围、攻击特效
- **稀有度**：普通、稀有、史诗、传说
- **示例**：
  - 新手剑 (Common) - 基础攻击力
  - 吸血剑 (Rare) - 击杀回血
  - 雷电之刃 (Epic) - 连锁闪电
  - 德古拉之牙 (Legendary) - 穿透+吸血+暴击

### 2. 防具 (Armor)
- **作用**：增加最大生命值、减少伤害
- **部位**：头盔、胸甲、护腿
- **示例**：
  - 皮革护甲 (Common) - +1生命
  - 骑士铠甲 (Rare) - +2生命
  - 吸血鬼斗篷 (Epic) - +3生命 + 闪避10%
  - 德古拉战甲 (Legendary) - +5生命 + 免疫炸弹

### 3. 饰品 (Accessory)
- **作用**：提供特殊能力和被动效果
- **数量**：最多装备2个
- **示例**：
  - 速度之戒 (Rare) - 移动速度+30%
  - 连击护符 (Epic) - 连击奖励+50%
  - 经验宝石 (Rare) - 经验值+100%
  - 时间沙漏 (Legendary) - 慢动作持续时间+5秒

---

## 装备属性

### 基础属性
- **攻击力** (Attack): 影响得分和伤害
- **防御力** (Defense): 减少受到的伤害
- **生命值** (HP): 增加最大生命值
- **速度** (Speed): 影响移动速度

### 特殊效果
- **吸血** (Lifesteal): 击杀回复生命
- **穿透** (Pierce): 攻击穿透多个敌人
- **范围攻击** (AOE): 攻击范围扩大
- **连击加成** (Combo Bonus): 连击奖励倍率
- **经验加成** (EXP Bonus): 经验值倍率
- **暴击** (Critical): 暴击概率和倍率
- **闪避** (Dodge): 免疫伤害概率
- **慢动作** (Slow Motion): 触发时间减速

---

## 装备获取方式

### 1. 关卡奖励
- 首次通关关卡获得固定装备
- 完美通关（无伤）获得稀有装备

### 2. 成就解锁
- 达成特定成就解锁装备
- 例如：连击100次解锁"连击护符"

### 3. 等级奖励
- 达到特定等级自动解锁装备
- Lv10: 吸血剑
- Lv20: 德古拉斗篷
- Lv30: 德古拉之牙

### 4. 商店购买（可选）
- 使用游戏内货币购买装备
- 货币来源：通关奖励、击杀敌人

---

## 装备系统UI

### 装备界面
- **位置**：主菜单"EQUIPMENT"按钮
- **布局**：
  - 左侧：角色模型 + 装备槽位（武器、头盔、胸甲、护腿、饰品x2）
  - 右侧：装备列表（可滚动）
  - 底部：装备详情（属性、效果描述）

### 装备槽位
```
┌─────────────────────────────────┐
│   [头盔]                         │
│                                 │
│   [武器]  [角色]  [胸甲]         │
│                                 │
│   [饰品1] [护腿]  [饰品2]        │
└─────────────────────────────────┘
```

### 装备卡片
- 显示装备图标、名称、稀有度
- 显示主要属性和特殊效果
- 已装备的显示"✓ 已装备"
- 未解锁的显示"🔒 未解锁"

---

## 装备效果实现

### 攻击力加成
```typescript
const totalAttack = baseAttack + weapon.attack + armor.attack;
const scoreGain = baseScore * (totalAttack / 100);
```

### 生命值加成
```typescript
const maxLives = baseMaxLives + armor.hp + accessory1.hp + accessory2.hp;
```

### 特殊效果触发
```typescript
// 吸血效果
if (weapon.hasLifesteal && enemy.killed) {
  healPlayer(weapon.lifestealAmount);
}

// 穿透效果
if (weapon.hasPierce) {
  hitMultipleEnemies(attackPosition, weapon.pierceCount);
}

// 范围攻击
if (weapon.hasAOE) {
  const radius = baseRadius * weapon.aoeMultiplier;
  hitEnemiesInRadius(attackPosition, radius);
}
```

---

## 数据结构

### Equipment Interface
```typescript
interface Equipment {
  id: string;
  name: string;
  nameZh: string;
  type: 'weapon' | 'helmet' | 'armor' | 'legs' | 'accessory';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  description: string;
  
  // 基础属性
  attack?: number;
  defense?: number;
  hp?: number;
  speed?: number;
  
  // 特殊效果
  effects?: EquipmentEffect[];
  
  // 解锁条件
  unlockCondition: {
    type: 'level' | 'achievement' | 'stage' | 'default';
    value?: number | string;
  };
  
  isUnlocked: boolean;
}

interface EquipmentEffect {
  type: 'lifesteal' | 'pierce' | 'aoe' | 'combo_bonus' | 'exp_bonus' | 'critical' | 'dodge' | 'slow_motion';
  value: number;
  description: string;
}
```

### EquipmentLoadout Interface
```typescript
interface EquipmentLoadout {
  weapon: Equipment | null;
  helmet: Equipment | null;
  armor: Equipment | null;
  legs: Equipment | null;
  accessory1: Equipment | null;
  accessory2: Equipment | null;
}
```

---

## 初始装备列表（示例）

### 武器
1. **新手剑** (Common) - 默认解锁
   - 攻击力: +10
   
2. **吸血剑** (Rare) - Lv10解锁
   - 攻击力: +20
   - 效果: 击杀回复1生命 (20%概率)
   
3. **雷电之刃** (Epic) - 通关5个关卡解锁
   - 攻击力: +30
   - 效果: 连锁闪电（攻击跳跃到附近2个敌人）
   
4. **德古拉之牙** (Legendary) - Lv30解锁
   - 攻击力: +50
   - 效果: 穿透3个敌人 + 吸血 + 暴击率20%

### 防具
1. **皮革护甲** (Common) - 默认解锁
   - 生命值: +1
   
2. **骑士铠甲** (Rare) - Lv5解锁
   - 生命值: +2
   - 防御力: +10
   
3. **吸血鬼斗篷** (Epic) - 通关10个关卡解锁
   - 生命值: +3
   - 效果: 10%闪避率
   
4. **德古拉战甲** (Legendary) - Lv25解锁
   - 生命值: +5
   - 防御力: +30
   - 效果: 免疫炸弹伤害

### 饰品
1. **速度之戒** (Rare) - Lv8解锁
   - 效果: 移动速度+30%
   
2. **连击护符** (Epic) - 连击达到50次解锁
   - 效果: 连击奖励+50%
   
3. **经验宝石** (Rare) - Lv15解锁
   - 效果: 经验值+100%
   
4. **时间沙漏** (Legendary) - Lv20解锁
   - 效果: 慢动作持续时间+5秒

---

## 实现优先级

### P0 - 核心功能
1. 装备数据结构和配置文件
2. 装备管理器（装备/卸载）
3. 装备存储（LocalStorage）
4. 基础装备UI（装备槽位+列表）

### P1 - 效果实现
5. 攻击力/生命值加成
6. 吸血效果
7. 经验值加成
8. 连击加成

### P2 - 高级效果
9. 穿透效果
10. 范围攻击
11. 暴击系统
12. 闪避系统

---

## 用户体验优化

1. **视觉反馈**
   - 装备时播放音效
   - 装备卡片hover效果
   - 稀有度用颜色区分（灰/蓝/紫/橙）

2. **装备对比**
   - 选择装备时显示属性对比
   - 绿色箭头↑表示提升，红色箭头↓表示下降

3. **装备推荐**
   - 自动推荐最佳装备组合
   - 根据玩家风格推荐（攻击型/防御型/平衡型）

4. **装备预设**
   - 保存多套装备方案
   - 快速切换装备组合
