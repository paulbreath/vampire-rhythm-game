// 装备系统类型定义

export type EquipmentType = 'weapon' | 'helmet' | 'armor' | 'legs' | 'accessory';
export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type EffectType = 
  | 'lifesteal' 
  | 'pierce' 
  | 'aoe' 
  | 'combo_bonus' 
  | 'exp_bonus' 
  | 'critical' 
  | 'dodge' 
  | 'slow_motion';

export interface EquipmentEffect {
  type: EffectType;
  value: number;
  description: string;
}

export interface UnlockCondition {
  type: 'level' | 'achievement' | 'stage' | 'default';
  value?: number | string;
}

export interface Equipment {
  id: string;
  name: string;
  nameZh: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
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
  unlockCondition: UnlockCondition;
}

export interface EquipmentLoadout {
  weapon: Equipment | null;
  helmet: Equipment | null;
  armor: Equipment | null;
  legs: Equipment | null;
  accessory1: Equipment | null;
  accessory2: Equipment | null;
}

export interface EquipmentStats {
  totalAttack: number;
  totalDefense: number;
  totalHP: number;
  totalSpeed: number;
  effects: EquipmentEffect[];
}
