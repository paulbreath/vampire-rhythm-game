// 装备掉落管理器
import { MAP_EQUIPMENT_DROPS, EQUIPMENT_RARITY_SCORES } from '../data/mapNodes';
import { newEquipmentManager } from './newEquipmentManager';
import { getWeaponById, getArmorById, RARITY_CONFIG } from '../data/newEquipmentData';
import type { Weapon, Armor } from '../types/equipment';

export interface DropResult {
  equipmentId: string;
  equipmentName: string;
  equipmentNameZh: string;
  equipmentType: 'weapon' | 'armor';
  rarity: string;
  rarityColor: string;
  isNew: boolean; // 是否是新装备
  convertedScore: number; // 如果是重复装备，转换的积分
  icon: string;
}

class EquipmentDropManager {
  // 为指定关卡生成装备掉落
  public generateDrops(stageId: string, dropCount: number = 2): DropResult[] {
    const dropPool = MAP_EQUIPMENT_DROPS[stageId];
    if (!dropPool || dropPool.length === 0) {
      console.warn(`No drop pool configured for stage: ${stageId}`);
      return [];
    }
    
    // 随机选择1-2件装备
    const actualDropCount = Math.min(dropCount, dropPool.length);
    const drops: DropResult[] = [];
    const selectedIds = new Set<string>();
    
    for (let i = 0; i < actualDropCount; i++) {
      // 随机选择一个装备（避免重复）
      let equipmentId: string;
      let attempts = 0;
      do {
        equipmentId = dropPool[Math.floor(Math.random() * dropPool.length)];
        attempts++;
      } while (selectedIds.has(equipmentId) && attempts < 10);
      
      if (selectedIds.has(equipmentId)) continue; // 避免死循环
      selectedIds.add(equipmentId);
      
      // 获取装备信息
      const weapon = getWeaponById(equipmentId);
      const armor = getArmorById(equipmentId);
      const equipment = weapon || armor;
      
      if (!equipment) {
        console.error(`Equipment not found: ${equipmentId}`);
        continue;
      }
      
      // 检查是否已解锁
      const isWeapon = !!weapon;
      const isNew = isWeapon 
        ? !newEquipmentManager.isWeaponUnlocked(equipmentId)
        : !newEquipmentManager.isArmorUnlocked(equipmentId);
      
      // 计算稀有度积分
      const rarityScore = EQUIPMENT_RARITY_SCORES[equipment.rarity] || 100;
      const convertedScore = isNew ? 0 : rarityScore;
      
      // 如果是新装备，解锁它
      if (isNew) {
        if (isWeapon) {
          newEquipmentManager.unlockWeapon(equipmentId);
        } else {
          newEquipmentManager.unlockArmor(equipmentId);
        }
      }
      
      drops.push({
        equipmentId,
        equipmentName: equipment.name,
        equipmentNameZh: equipment.nameZh,
        equipmentType: isWeapon ? 'weapon' : 'armor',
        rarity: equipment.rarity,
        rarityColor: RARITY_CONFIG[equipment.rarity]?.color || '#ffffff',
        isNew,
        convertedScore,
        icon: equipment.icon
      });
    }
    
    return drops;
  }
  
  // 计算掉落的总积分（重复装备转换的积分）
  public calculateTotalConvertedScore(drops: DropResult[]): number {
    return drops.reduce((total, drop) => total + drop.convertedScore, 0);
  }
  
  // 获取关卡的装备池信息（用于UI显示）
  public getStageDropPool(stageId: string): Array<{
    id: string;
    name: string;
    nameZh: string;
    rarity: string;
    icon: string;
  }> {
    const dropPool = MAP_EQUIPMENT_DROPS[stageId];
    if (!dropPool) return [];
    
    return dropPool.map(id => {
      const weapon = getWeaponById(id);
      const armor = getArmorById(id);
      const equipment = weapon || armor;
      
      if (!equipment) return null;
      
      return {
        id,
        name: equipment.name,
        nameZh: equipment.nameZh,
        rarity: equipment.rarity,
        icon: equipment.icon
      };
    }).filter(Boolean) as Array<{
      id: string;
      name: string;
      nameZh: string;
      rarity: string;
      icon: string;
    }>;
  }
}

// 导出单例
export const equipmentDropManager = new EquipmentDropManager();
