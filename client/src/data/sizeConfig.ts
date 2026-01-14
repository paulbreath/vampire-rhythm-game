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
  small: { height: 480, scale: 1.33 },   // 主角1.33倍
  medium: { height: 600, scale: 1.67 },  // 主角1.67個
  large: { height: 720, scale: 2.0 },    // 主角2倍
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
