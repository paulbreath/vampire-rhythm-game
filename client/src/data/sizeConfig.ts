/**
 * 角色尺寸配置系统
 */

export type SizeType = 'small' | 'medium' | 'large';

export interface SizeConfig {
  height: number;
  scale: number;
}

export const PLAYER_SIZE = {
  width: 240,
  height: 360,
};

export const ENEMY_SIZES: Record<SizeType, SizeConfig> = {
  small: { height: 150, scale: 0.42 },
  medium: { height: 220, scale: 0.61 },
  large: { height: 280, scale: 0.78 },
};

export const BOSS_SIZES: Record<SizeType, SizeConfig> = {
  small: { height: 360, scale: 1.0 },    // 主角1.0倍
  medium: { height: 430, scale: 1.19 },  // 主角1.19倍
  large: { height: 500, scale: 1.39 },   // 主角1.39倍
};

export function getEnemySize(sizeType: SizeType): number {
  return ENEMY_SIZES[sizeType].height;
}

export function getBossSize(sizeType: SizeType): number {
  return BOSS_SIZES[sizeType].height;
}

export function getScale(sizeType: SizeType, isBoss: boolean): number {
  return isBoss ? BOSS_SIZES[sizeType].scale : ENEMY_SIZES[sizeType].scale;
}
