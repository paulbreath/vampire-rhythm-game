// 装备系统类型定义 - 重构版本
// 围绕音乐节奏+消除玩法设计

export type WeaponType = 'dagger' | 'dual_swords' | 'flail' | 'greatsword' | 'whip' | 'scythe';
export type ArmorType = 'cloth' | 'leather' | 'chain' | 'plate' | 'legendary';
export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary';

// 攻击轨迹类型
export type AttackTrailType = 
  | 'single_line'    // 单线（匕首）
  | 'dual_line'      // 双线（双剑）
  | 'thick_line'     // 粗线（链锤）
  | 'ultra_thick'    // 超粗线（巨剑）
  | 'wave_line'      // 波浪线（鞭子）
  | 'arc_line';      // 弧形线（镰刀）

// 武器配置
export interface WeaponConfig {
  trailType: AttackTrailType;
  lineWidth: number;        // 线条宽度（像素）
  color: string;            // 攻击颜色
  dualLineSpacing?: number; // 双线间距（仅双剑）
  damage: number;           // 伤害值（用于未来扩展）
}

// 武器装备
export interface Weapon {
  id: string;
  name: string;
  nameZh: string;
  type: WeaponType;
  rarity: EquipmentRarity;
  icon: string;
  description: string;
  config: WeaponConfig;
  unlockCondition: UnlockCondition;
}

// 防具装备
export interface Armor {
  id: string;
  name: string;
  nameZh: string;
  type: ArmorType;
  rarity: EquipmentRarity;
  icon: string;
  description: string;
  hpBonus: number; // 增加的心数（1-7）
  unlockCondition: UnlockCondition;
}

// 解锁条件
export interface UnlockCondition {
  type: 'default' | 'level' | 'stage' | 'achievement' | 'drop';
  value?: number | string;
}

// 装备槽位（简化为武器+防具）
export interface EquipmentLoadout {
  weapon: Weapon | null;
  armor: Armor | null;
}

// 玩家装备状态
export interface PlayerEquipmentStats {
  maxHearts: number;        // 最大生命值（3-10心）
  attackConfig: WeaponConfig; // 当前武器的攻击配置
}

// 装备掉落配置
export interface DropConfig {
  enemyType: string;        // 敌人类型
  dropChance: number;       // 掉落概率（0-1）
  possibleDrops: string[];  // 可能掉落的装备ID列表
}
