// 像素图标配置和工具函数

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
  const iconWidth = 64; // 每个图标64px（32px图标 + 32px间距）
  
  return {
    backgroundImage: 'url(/images/pixel-icons-weapons.png)',
    backgroundPosition: `-${index * iconWidth}px 0`,
    backgroundSize: `${6 * iconWidth}px 64px`,
    backgroundRepeat: 'no-repeat',
    width: '48px',
    height: '48px',
    imageRendering: 'pixelated' as const,
    display: 'inline-block'
  };
}

// 获取防具图标的CSS background-position
export function getArmorIconStyle(armorId: string): React.CSSProperties {
  const index = ARMOR_ICON_POSITIONS[armorId] ?? 0;
  const iconWidth = 64;
  
  return {
    backgroundImage: 'url(/images/pixel-icons-armor.png)',
    backgroundPosition: `-${index * iconWidth}px 0`,
    backgroundSize: `${5 * iconWidth}px 64px`,
    backgroundRepeat: 'no-repeat',
    width: '48px',
    height: '48px',
    imageRendering: 'pixelated' as const,
    display: 'inline-block'
  };
}

// 获取UI图标的CSS background-position
export function getUIIconStyle(iconName: keyof typeof UI_ICON_POSITIONS): React.CSSProperties {
  const pos = UI_ICON_POSITIONS[iconName];
  const iconSize = 32; // 24px图标 + 8px间距
  
  return {
    backgroundImage: 'url(/images/pixel-icons-ui.png)',
    backgroundPosition: `-${pos.col * iconSize}px -${pos.row * iconSize}px`,
    backgroundSize: `${3 * iconSize}px ${4 * iconSize}px`,
    backgroundRepeat: 'no-repeat',
    width: '24px',
    height: '24px',
    imageRendering: 'pixelated' as const,
    display: 'inline-block'
  };
}


