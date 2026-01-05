// 新装备管理器 - 围绕音乐节奏+消除玩法设计
import { 
  Weapon, 
  Armor, 
  EquipmentLoadout, 
  PlayerEquipmentStats,
  WeaponConfig 
} from '../types/equipment';
import { 
  WEAPONS, 
  ARMORS, 
  getWeaponById, 
  getArmorById, 
  getDefaultWeapon, 
  getDefaultArmor 
} from '../data/newEquipmentData';

const STORAGE_KEY = 'vampire_rhythm_equipment_v2';

class NewEquipmentManager {
  private loadout: EquipmentLoadout;
  private unlockedWeapons: Set<string>;
  private unlockedArmors: Set<string>;

  constructor() {
    this.loadout = {
      weapon: null,
      armor: null
    };
    this.unlockedWeapons = new Set();
    this.unlockedArmors = new Set();
    
    this.loadFromStorage();
    this.initializeDefaults();
  }

  // 初始化默认装备
  private initializeDefaults(): void {
    const defaultWeapon = getDefaultWeapon();
    const defaultArmor = getDefaultArmor();
    
    // 解锁默认装备
    this.unlockedWeapons.add(defaultWeapon.id);
    this.unlockedArmors.add(defaultArmor.id);
    
    // 如果没有装备任何武器/防具，装备默认装备
    if (!this.loadout.weapon) {
      this.loadout.weapon = defaultWeapon;
    }
    if (!this.loadout.armor) {
      this.loadout.armor = defaultArmor;
    }
    
    this.saveToStorage();
  }

  // 装备武器
  public equipWeapon(weaponId: string): boolean {
    if (!this.unlockedWeapons.has(weaponId)) {
      console.warn(`Weapon ${weaponId} is not unlocked`);
      return false;
    }
    
    const weapon = getWeaponById(weaponId);
    if (!weapon) {
      console.error(`Weapon ${weaponId} not found`);
      return false;
    }
    
    this.loadout.weapon = weapon;
    this.saveToStorage();
    return true;
  }

  // 装备防具
  public equipArmor(armorId: string): boolean {
    if (!this.unlockedArmors.has(armorId)) {
      console.warn(`Armor ${armorId} is not unlocked`);
      return false;
    }
    
    const armor = getArmorById(armorId);
    if (!armor) {
      console.error(`Armor ${armorId} not found`);
      return false;
    }
    
    this.loadout.armor = armor;
    this.saveToStorage();
    return true;
  }

  // 解锁武器
  public unlockWeapon(weaponId: string): boolean {
    const weapon = getWeaponById(weaponId);
    if (!weapon) {
      console.error(`Weapon ${weaponId} not found`);
      return false;
    }
    
    this.unlockedWeapons.add(weaponId);
    this.saveToStorage();
    console.log(`Unlocked weapon: ${weapon.nameZh}`);
    return true;
  }

  // 解锁防具
  public unlockArmor(armorId: string): boolean {
    const armor = getArmorById(armorId);
    if (!armor) {
      console.error(`Armor ${armorId} not found`);
      return false;
    }
    
    this.unlockedArmors.add(armorId);
    this.saveToStorage();
    console.log(`Unlocked armor: ${armor.nameZh}`);
    return true;
  }

  // 检查武器是否已解锁
  public isWeaponUnlocked(weaponId: string): boolean {
    return this.unlockedWeapons.has(weaponId);
  }

  // 检查防具是否已解锁
  public isArmorUnlocked(armorId: string): boolean {
    return this.unlockedArmors.has(armorId);
  }

  // 获取当前装备
  public getLoadout(): EquipmentLoadout {
    return { ...this.loadout };
  }

  // 获取所有已解锁的武器
  public getUnlockedWeapons(): Weapon[] {
    return WEAPONS.filter(w => this.unlockedWeapons.has(w.id));
  }

  // 获取所有已解锁的防具
  public getUnlockedArmors(): Armor[] {
    return ARMORS.filter(a => this.unlockedArmors.has(a.id));
  }

  // 获取所有武器（用于UI显示）
  public getAllWeapons(): Weapon[] {
    return [...WEAPONS];
  }

  // 获取所有防具（用于UI显示）
  public getAllArmors(): Armor[] {
    return [...ARMORS];
  }

  // 计算玩家装备属性
  public getPlayerStats(): PlayerEquipmentStats {
    const weapon = this.loadout.weapon || getDefaultWeapon();
    const armor = this.loadout.armor || getDefaultArmor();
    
    return {
      maxHearts: 3 + armor.hpBonus, // 基础3心 + 防具加成
      attackConfig: weapon.config
    };
  }

  // 获取当前武器配置
  public getCurrentWeaponConfig(): WeaponConfig {
    const weapon = this.loadout.weapon || getDefaultWeapon();
    return weapon.config;
  }

  // 获取最大生命值
  public getMaxHearts(): number {
    const armor = this.loadout.armor || getDefaultArmor();
    return 3 + armor.hpBonus;
  }

  // 保存到LocalStorage
  private saveToStorage(): void {
    const data = {
      loadout: {
        weaponId: this.loadout.weapon?.id || null,
        armorId: this.loadout.armor?.id || null
      },
      unlockedWeapons: Array.from(this.unlockedWeapons),
      unlockedArmors: Array.from(this.unlockedArmors)
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save equipment data:', error);
    }
  }

  // 从LocalStorage加载
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      // 恢复装备
      if (data.loadout.weaponId) {
        this.loadout.weapon = getWeaponById(data.loadout.weaponId) || null;
      }
      if (data.loadout.armorId) {
        this.loadout.armor = getArmorById(data.loadout.armorId) || null;
      }
      
      // 恢复解锁状态
      this.unlockedWeapons = new Set(data.unlockedWeapons || []);
      this.unlockedArmors = new Set(data.unlockedArmors || []);
      
      console.log('Equipment data loaded from storage');
    } catch (error) {
      console.error('Failed to load equipment data:', error);
    }
  }

  // 重置所有数据（用于测试）
  public reset(): void {
    this.loadout = {
      weapon: null,
      armor: null
    };
    this.unlockedWeapons.clear();
    this.unlockedArmors.clear();
    
    this.initializeDefaults();
    console.log('Equipment data reset');
  }

  // 解锁所有装备（用于测试）
  public unlockAll(): void {
    WEAPONS.forEach(w => this.unlockedWeapons.add(w.id));
    ARMORS.forEach(a => this.unlockedArmors.add(a.id));
    this.saveToStorage();
    console.log('All equipment unlocked');
  }
}

// 导出单例
export const newEquipmentManager = new NewEquipmentManager();
