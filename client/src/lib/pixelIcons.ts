// 像素图标配置和工具函数

// 图标版本配置
export type IconVersion = 'v1' | 'v2';
let currentIconVersion: IconVersion = 'v2'; // 默认使用v2（更精细）

export function setIconVersion(version: IconVersion) {
  currentIconVersion = version;
}

export function getIconVersion(): IconVersion {
  return currentIconVersion;
}

function getIconPath(type: 'weapons' | 'armor' | 'ui'): string {
  const suffix = currentIconVersion === 'v2' ? '-v2' : '';
  return `/images/pixel-icons-${type}${suffix}.png`;
}

// 武器图标位置映射（sprite sheet中的索引）
export const WEAPON_ICON_POSITIONS: Record<string, number> = {
  'dagger': 0,
  'dual_swords': 1,
  'flail': 2,
  'greatsword': 3,
  'whip': 4,
  'scythe': 5
};

// 防具图标位置映射
export const ARMOR_ICON_POSITIONS: Record<string, number> = {
  'cloth_armor': 0,
  'leather_armor': 1,
  'chain_mail': 2,
  'plate_armor': 3,
  'legendary_armor': 4
};

// UI图标位置映射（3x4网格）
export const UI_ICON_POSITIONS = {
  'play': { row: 0, col: 0 },
  'castle': { row: 0, col: 1 },
  'swords': { row: 0, col: 2 },
  'trophy': { row: 1, col: 0 },
  'unlock': { row: 1, col: 1 },
  'back': { row: 1, col: 2 },
  'heart': { row: 2, col: 0 },
  'coin': { row: 2, col: 1 },
  'skull': { row: 2, col: 2 },
  'bat': { row: 3, col: 0 },
  'blood': { row: 3, col: 1 },
  'crown': { row: 3, col: 2 }
};

// 获取武器图标的CSS background-position
export function getWeaponIconStyle(weaponId: string): React.CSSProperties {
  const index = WEAPON_ICON_POSITIONS[weaponId] ?? 0;
  // 实际图片尺寸: 2752x1536px, 6个图标横向排列
  // 每个图标: 459x1536px (宽高比 1:3.3)
  const spriteWidth = 2752;
  const spriteHeight = 1536;
  const iconCount = 6;
  const displayWidth = 24; // 合理的显示宽度
  // 根据宽高比计算显示高度
  const displayHeight = Math.round(displayWidth * spriteHeight / (spriteWidth / iconCount));
  
  return {
    backgroundImage: `url(${getIconPath('weapons')})`,
    backgroundPosition: `-${index * displayWidth}px 0`,
    backgroundSize: `${iconCount * displayWidth}px auto`,
    backgroundRepeat: 'no-repeat',
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    imageRendering: 'pixelated' as const,
    display: 'inline-block'
  };
}

// 获取防具图标的CSS background-position
export function getArmorIconStyle(armorId: string): React.CSSProperties {
  const index = ARMOR_ICON_POSITIONS[armorId] ?? 0;
  // 实际图片尺寸: 2752x1536px, 5个图标横向排列
  // 每个图标: 550x1536px (宽高比 1:2.8)
  const spriteWidth = 2752;
  const spriteHeight = 1536;
  const iconCount = 5;
  const displayWidth = 24; // 合理的显示宽度
  const displayHeight = Math.round(displayWidth * spriteHeight / (spriteWidth / iconCount));
  
  return {
    backgroundImage: `url(${getIconPath('armor')})`,
    backgroundPosition: `-${index * displayWidth}px 0`,
    backgroundSize: `${iconCount * displayWidth}px auto`,
    backgroundRepeat: 'no-repeat',
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    imageRendering: 'pixelated' as const,
    display: 'inline-block'
  };
}

// 获取UI图标的CSS background-position
export function getUIIconStyle(iconName: keyof typeof UI_ICON_POSITIONS): React.CSSProperties {
  const pos = UI_ICON_POSITIONS[iconName];
  // 实际图片尺寸: 2048x2048px, 4x4网格
  // 每个图标: 2048/4 = 512px
  const spriteIconSize = 512;
  const displaySize = 32; // 显示尺寸
  
  return {
    backgroundImage: `url(${getIconPath('ui')})`,
    backgroundPosition: `-${pos.col * displaySize}px -${pos.row * displaySize}px`,
    backgroundSize: `${4 * displaySize}px ${4 * displaySize}px`,
    backgroundRepeat: 'no-repeat',
    width: `${displaySize}px`,
    height: `${displaySize}px`,
    imageRendering: 'pixelated' as const,
    display: 'inline-block'
  };
}


