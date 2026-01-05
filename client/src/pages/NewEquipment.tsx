import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { newEquipmentManager } from "@/lib/newEquipmentManager";
import { WEAPONS, ARMORS, RARITY_CONFIG } from "@/data/newEquipmentData";
import type { Weapon, Armor } from "@/types/equipment";

export default function NewEquipment() {
  const [, setLocation] = useLocation();
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [selectedArmor, setSelectedArmor] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'weapon' | 'armor'>('all');
  const [stats, setStats] = useState(newEquipmentManager.getPlayerStats());

  useEffect(() => {
    // 加载当前装备
    const loadout = newEquipmentManager.getLoadout();
    setSelectedWeapon(loadout.weapon?.id || null);
    setSelectedArmor(loadout.armor?.id || null);
  }, []);

  const handleEquipWeapon = (weaponId: string) => {
    newEquipmentManager.equipWeapon(weaponId);
    setSelectedWeapon(weaponId);
    setStats(newEquipmentManager.getPlayerStats());
  };

  const handleUnequipWeapon = () => {
    // 装备默认武器
    newEquipmentManager.equipWeapon('dagger');
    setSelectedWeapon('dagger');
    setStats(newEquipmentManager.getPlayerStats());
  };

  const handleEquipArmor = (armorId: string) => {
    newEquipmentManager.equipArmor(armorId);
    setSelectedArmor(armorId);
    setStats(newEquipmentManager.getPlayerStats());
  };

  const handleUnequipArmor = () => {
    // 装备默认防具
    newEquipmentManager.equipArmor('cloth_armor');
    setSelectedArmor('cloth_armor');
    setStats(newEquipmentManager.getPlayerStats());
  };

  const isWeaponUnlocked = (weaponId: string): boolean => {
    return newEquipmentManager.isWeaponUnlocked(weaponId);
  };

  const isArmorUnlocked = (armorId: string): boolean => {
    return newEquipmentManager.isArmorUnlocked(armorId);
  };

  const getRarityColor = (rarity: string): string => {
    const config = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
    return config?.color || '#ffffff';
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gothic pixel background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 8px, currentColor 8px, currentColor 9px),
            repeating-linear-gradient(90deg, transparent, transparent 8px, currentColor 8px, currentColor 9px)
          `,
        }} />
      </div>

      {/* Floating bats */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            🦇
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b-4 border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            onClick={() => setLocation("/")}
            className="pixel-button bg-secondary text-secondary-foreground"
            size="sm"
          >
            ← 返回主菜单
          </Button>
          <h1 className="text-4xl glow-red" style={{ fontFamily: 'Creepster, cursive' }}>
            EQUIPMENT
          </h1>
          <div className="w-32" /> {/* Spacer */}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Current Equipment */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border-4 border-border rounded-lg p-6">
              <h2 className="text-2xl glow-purple mb-4" style={{ fontFamily: 'Creepster, cursive' }}>
                Current Loadout
              </h2>

              {/* Weapon Slot */}
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">⚔️ WEAPON</div>
                {selectedWeapon ? (
                  <div className="bg-background border-2 rounded-lg p-4">
                    {(() => {
                      const weapon = WEAPONS.find(w => w.id === selectedWeapon);
                      if (!weapon) return null;
                      return (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">{weapon.icon}</span>
                              <div>
                                <div className="font-bold" style={{ color: getRarityColor(weapon.rarity) }}>
                                  {weapon.nameZh}
                                </div>
                                <div className="text-xs text-muted-foreground">{weapon.name}</div>
                              </div>
                            </div>
                            <Button
                              onClick={handleUnequipWeapon}
                              className="pixel-button bg-destructive text-destructive-foreground"
                              size="sm"
                            >
                              卸载
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">{weapon.description}</div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="bg-background border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground">
                    未装备武器
                  </div>
                )}
              </div>

              {/* Armor Slot */}
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">🛡️ ARMOR</div>
                {selectedArmor ? (
                  <div className="bg-background border-2 rounded-lg p-4">
                    {(() => {
                      const armor = ARMORS.find(a => a.id === selectedArmor);
                      if (!armor) return null;
                      return (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">{armor.icon}</span>
                              <div>
                                <div className="font-bold" style={{ color: getRarityColor(armor.rarity) }}>
                                  {armor.nameZh}
                                </div>
                                <div className="text-xs text-muted-foreground">{armor.name}</div>
                              </div>
                            </div>
                            <Button
                              onClick={handleUnequipArmor}
                              className="pixel-button bg-destructive text-destructive-foreground"
                              size="sm"
                            >
                              卸载
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">{armor.description}</div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="bg-background border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground">
                    未装备防具
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="bg-background border-2 border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">总属性</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>❤️ 最大生命值</span>
                    <span className="glow-red font-bold">{stats.maxHearts}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Equipment List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter */}
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                className={`pixel-button ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                size="sm"
              >
                全部
              </Button>
              <Button
                onClick={() => setFilter('weapon')}
                className={`pixel-button ${filter === 'weapon' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                size="sm"
              >
                武器
              </Button>
              <Button
                onClick={() => setFilter('armor')}
                className={`pixel-button ${filter === 'armor' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                size="sm"
              >
                防具
              </Button>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Weapons */}
              {(filter === 'all' || filter === 'weapon') && WEAPONS.map((weapon) => {
                const unlocked = isWeaponUnlocked(weapon.id);
                const equipped = selectedWeapon === weapon.id;
                return (
                  <div
                    key={weapon.id}
                    className={`
                      bg-card border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${equipped ? 'border-yellow-500 bg-yellow-500/10' : 'border-border hover:border-primary'}
                      ${!unlocked ? 'opacity-50' : ''}
                    `}
                    onClick={() => unlocked && !equipped && handleEquipWeapon(weapon.id)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{weapon.icon}</div>
                      <div className="font-bold text-sm" style={{ color: getRarityColor(weapon.rarity) }}>
                        {weapon.nameZh}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{weapon.name}</div>
                      {!unlocked && <div className="text-xs text-red-400">🔒 未解锁</div>}
                      {equipped && <div className="text-xs text-green-400">✓ 已装备</div>}
                    </div>
                  </div>
                );
              })}

              {/* Armors */}
              {(filter === 'all' || filter === 'armor') && ARMORS.map((armor) => {
                const unlocked = isArmorUnlocked(armor.id);
                const equipped = selectedArmor === armor.id;
                return (
                  <div
                    key={armor.id}
                    className={`
                      bg-card border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${equipped ? 'border-yellow-500 bg-yellow-500/10' : 'border-border hover:border-primary'}
                      ${!unlocked ? 'opacity-50' : ''}
                    `}
                    onClick={() => unlocked && !equipped && handleEquipArmor(armor.id)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{armor.icon}</div>
                      <div className="font-bold text-sm" style={{ color: getRarityColor(armor.rarity) }}>
                        {armor.nameZh}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{armor.name}</div>
                      <div className="text-xs text-yellow-400">+{armor.hpBonus}❤️</div>
                      {!unlocked && <div className="text-xs text-red-400">🔒 未解锁</div>}
                      {equipped && <div className="text-xs text-green-400">✓ 已装备</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
