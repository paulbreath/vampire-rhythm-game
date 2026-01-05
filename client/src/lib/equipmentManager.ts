import type { Equipment, EquipmentLoadout, EquipmentStats } from '../types/equipment';
import { EQUIPMENT_DATA } from '../data/equipmentData';

const STORAGE_KEY = 'vampire_rhythm_equipment';

export class EquipmentManager {
  private static instance: EquipmentManager;
  private loadout: EquipmentLoadout;
  private unlockedEquipment: Set<string>;

  private constructor() {
    this.loadout = {
      weapon: null,
      helmet: null,
      armor: null,
      legs: null,
      accessory1: null,
      accessory2: null
    };
    this.unlockedEquipment = new Set();
    this.load();
  }

  static getInstance(): EquipmentManager {
    if (!EquipmentManager.instance) {
      EquipmentManager.instance = new EquipmentManager();
    }
    return EquipmentManager.instance;
  }

  // 加载装备数据
  private load(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.unlockedEquipment = new Set(data.unlockedEquipment || []);
        
        // 恢复装备配置
        if (data.loadout) {
          Object.keys(data.loadout).forEach((slot) => {
            const equipmentId = data.loadout[slot];
            if (equipmentId) {
              const equipment = this.getEquipmentById(equipmentId);
              if (equipment) {
                this.loadout[slot as keyof EquipmentLoadout] = equipment;
              }
            }
          });
        }
      }
      
      // 初始化：解锁所有默认装备
      this.unlockDefaultEquipment();
    } catch (error) {
      console.error('Failed to load equipment data:', error);
    }
  }

  // 保存装备数据
  private save(): void {
    try {
      const data = {
        unlockedEquipment: Array.from(this.unlockedEquipment),
        loadout: {
          weapon: this.loadout.weapon?.id || null,
          helmet: this.loadout.helmet?.id || null,
          armor: this.loadout.armor?.id || null,
          legs: this.loadout.legs?.id || null,
          accessory1: this.loadout.accessory1?.id || null,
          accessory2: this.loadout.accessory2?.id || null
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save equipment data:', error);
    }
  }

  // 解锁默认装备
  private unlockDefaultEquipment(): void {
    EQUIPMENT_DATA.forEach(equipment => {
      if (equipment.unlockCondition.type === 'default') {
        this.unlockedEquipment.add(equipment.id);
      }
    });
    this.save();
  }

  // 根据ID获取装备
  getEquipmentById(id: string): Equipment | undefined {
    return EQUIPMENT_DATA.find(e => e.id === id);
  }

  // 获取所有装备
  getAllEquipment(): Equipment[] {
    return EQUIPMENT_DATA;
  }

  // 获取已解锁的装备
  getUnlockedEquipment(): Equipment[] {
    return EQUIPMENT_DATA.filter(e => this.unlockedEquipment.has(e.id));
  }

  // 检查装备是否已解锁
  isEquipmentUnlocked(equipmentId: string): boolean {
    return this.unlockedEquipment.has(equipmentId);
  }

  // 解锁装备
  unlockEquipment(equipmentId: string): boolean {
    if (this.unlockedEquipment.has(equipmentId)) {
      return false; // 已经解锁
    }
    this.unlockedEquipment.add(equipmentId);
    this.save();
    return true;
  }

  // 根据等级解锁装备
  unlockByLevel(level: number): Equipment[] {
    const newlyUnlocked: Equipment[] = [];
    EQUIPMENT_DATA.forEach(equipment => {
      if (
        equipment.unlockCondition.type === 'level' &&
        equipment.unlockCondition.value === level &&
        !this.unlockedEquipment.has(equipment.id)
      ) {
        this.unlockEquipment(equipment.id);
        newlyUnlocked.push(equipment);
      }
    });
    return newlyUnlocked;
  }

  // 根据关卡解锁装备
  unlockByStage(stageCount: number): Equipment[] {
    const newlyUnlocked: Equipment[] = [];
    EQUIPMENT_DATA.forEach(equipment => {
      if (
        equipment.unlockCondition.type === 'stage' &&
        equipment.unlockCondition.value === stageCount &&
        !this.unlockedEquipment.has(equipment.id)
      ) {
        this.unlockEquipment(equipment.id);
        newlyUnlocked.push(equipment);
      }
    });
    return newlyUnlocked;
  }

  // 装备物品
  equipItem(equipment: Equipment): boolean {
    if (!this.isEquipmentUnlocked(equipment.id)) {
      return false;
    }

    const slot = equipment.type;
    
    // 饰品需要特殊处理（有两个槽位）
    if (slot === 'accessory') {
      if (!this.loadout.accessory1) {
        this.loadout.accessory1 = equipment;
      } else if (!this.loadout.accessory2) {
        this.loadout.accessory2 = equipment;
      } else {
        // 两个槽位都满了，替换第一个
        this.loadout.accessory1 = equipment;
      }
    } else {
      this.loadout[slot] = equipment;
    }
    
    this.save();
    return true;
  }

  // 卸载物品
  unequipItem(slot: keyof EquipmentLoadout): void {
    this.loadout[slot] = null;
    this.save();
  }

  // 获取当前装备配置
  getLoadout(): EquipmentLoadout {
    return { ...this.loadout };
  }

  // 计算总属性
  calculateStats(): EquipmentStats {
    const stats: EquipmentStats = {
      totalAttack: 0,
      totalDefense: 0,
      totalHP: 0,
      totalSpeed: 0,
      effects: []
    };

    Object.values(this.loadout).forEach(equipment => {
      if (equipment) {
        stats.totalAttack += equipment.attack || 0;
        stats.totalDefense += equipment.defense || 0;
        stats.totalHP += equipment.hp || 0;
        stats.totalSpeed += equipment.speed || 0;
        
        if (equipment.effects) {
          stats.effects.push(...equipment.effects);
        }
      }
    });

    return stats;
  }

  // 检查是否装备了某个物品
  isEquipped(equipmentId: string): boolean {
    return Object.values(this.loadout).some(e => e?.id === equipmentId);
  }

  // 获取装备的槽位
  getEquipmentSlot(equipmentId: string): keyof EquipmentLoadout | null {
    for (const [slot, equipment] of Object.entries(this.loadout)) {
      if (equipment?.id === equipmentId) {
        return slot as keyof EquipmentLoadout;
      }
    }
    return null;
  }
}

// 导出单例实例
export const equipmentManager = EquipmentManager.getInstance();
