import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GlassButton } from "@/components/ui/glass-button";
import { newEquipmentManager } from "@/lib/newEquipmentManager";
import { WEAPONS, ARMORS, RARITY_CONFIG } from "@/data/newEquipmentData";
import type { Weapon, Armor } from "@/types/equipment";

export default function NewEquipment() {
  const [, setLocation] = useLocation();
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [selectedArmor, setSelectedArmor] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'weapon' | 'armor'>('all');
  const [stats, setStats] = useState(newEquipmentManager.getPlayerStats());
  const [bats, setBats] = useState<Array<{ id: number; x: number; y: number; speed: number; direction: number }>>([]);

  useEffect(() => {
    // 加载当前装备
    const loadout = newEquipmentManager.getLoadout();
    setSelectedWeapon(loadout.weapon?.id || null);
    setSelectedArmor(loadout.armor?.id || null);
  }, []);

  // 生成飘动的蝙蝠
  useEffect(() => {
    const newBats = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.2 + Math.random() * 0.3,
      direction: Math.random() * Math.PI * 2,
    }));
    setBats(newBats);

    const interval = setInterval(() => {
      setBats(prevBats =>
        prevBats.map(bat => {
          let newX = bat.x + Math.cos(bat.direction) * bat.speed;
          let newY = bat.y + Math.sin(bat.direction) * bat.speed;
          let newDirection = bat.direction;

          if (newX < 0 || newX > 100) {
            newDirection = Math.PI - newDirection;
            newX = Math.max(0, Math.min(100, newX));
          }
          if (newY < 0 || newY > 100) {
            newDirection = -newDirection;
            newY = Math.max(0, Math.min(100, newY));
          }

          return { ...bat, x: newX, y: newY, direction: newDirection };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleEquipWeapon = (weaponId: string) => {
    newEquipmentManager.equipWeapon(weaponId);
    setSelectedWeapon(weaponId);
    setStats(newEquipmentManager.getPlayerStats());
  };

  const handleEquipArmor = (armorId: string) => {
    newEquipmentManager.equipArmor(armorId);
    setSelectedArmor(armorId);
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

  const filteredWeapons = filter === 'armor' ? [] : Object.values(WEAPONS);
  const filteredArmors = filter === 'weapon' ? [] : Object.values(ARMORS);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* 暗色背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-black to-black" />

      {/* 飘动的蝙蝠 */}
      {bats.map(bat => (
        <div
          key={bat.id}
          className="absolute text-xl transition-all duration-1000 ease-linear opacity-30 z-10"
          style={{
            left: `${bat.x}%`,
            top: `${bat.y}%`,
            transform: `translate(-50%, -50%) scaleX(${Math.cos(bat.direction) > 0 ? 1 : -1})`,
            textShadow: '0 0 10px rgba(255, 0, 100, 0.5)',
          }}
        >
          🦇
        </div>
      ))}

      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b-2 border-yellow-600/30 p-4">
        <div className="container flex items-center justify-between">
          <GlassButton
            onClick={() => setLocation("/")}
            size="sm"
            variant="secondary"
            icon="←"
          >
            BACK
          </GlassButton>
          
          <h1 
            className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500"
            style={{ fontFamily: 'serif' }}
          >
            ⚔️ EQUIPMENT
          </h1>
          
          <div className="w-24" />
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-20 pt-24 pb-8 px-4 container">
        {/* 当前装备状态 */}
        <div className="mb-8 bg-black/60 backdrop-blur-sm border-2 border-yellow-600/50 rounded-lg p-6">
          <h2 
            className="text-2xl font-bold text-yellow-400 mb-4 text-center"
            style={{ fontFamily: 'serif', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
          >
            CURRENT LOADOUT
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 武器槽 */}
            <div className="bg-red-900/30 border-2 border-red-600/50 rounded-lg p-4">
              <p className="text-red-400 text-sm font-bold mb-2 text-center">WEAPON</p>
              {selectedWeapon && WEAPONS[selectedWeapon as keyof typeof WEAPONS] ? (
                <div className="text-center">
                  <div className="text-5xl mb-2">{WEAPONS[selectedWeapon as keyof typeof WEAPONS].icon}</div>
                  <p className="text-white font-bold">{WEAPONS[selectedWeapon as keyof typeof WEAPONS].name}</p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: getRarityColor(WEAPONS[selectedWeapon as keyof typeof WEAPONS].rarity) }}
                  >
                    {WEAPONS[selectedWeapon as keyof typeof WEAPONS].rarity.toUpperCase()}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-5xl mb-2">❓</div>
                  <p>No Weapon</p>
                </div>
              )}
            </div>

            {/* 防具槽 */}
            <div className="bg-blue-900/30 border-2 border-blue-600/50 rounded-lg p-4">
              <p className="text-blue-400 text-sm font-bold mb-2 text-center">ARMOR</p>
              {selectedArmor && ARMORS[selectedArmor as keyof typeof ARMORS] ? (
                <div className="text-center">
                  <div className="text-5xl mb-2">{ARMORS[selectedArmor as keyof typeof ARMORS].icon}</div>
                  <p className="text-white font-bold">{ARMORS[selectedArmor as keyof typeof ARMORS].name}</p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: getRarityColor(ARMORS[selectedArmor as keyof typeof ARMORS].rarity) }}
                  >
                    {ARMORS[selectedArmor as keyof typeof ARMORS].rarity.toUpperCase()}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-5xl mb-2">❓</div>
                  <p>No Armor</p>
                </div>
              )}
            </div>

            {/* 总属性 */}
            <div className="bg-purple-900/30 border-2 border-purple-600/50 rounded-lg p-4">
              <p className="text-purple-400 text-sm font-bold mb-2 text-center">TOTAL STATS</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max HP:</span>
                  <span className="text-white font-bold">{stats.maxHearts} ❤️</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Attack:</span>
                  <span className="text-white font-bold">{selectedWeapon ? WEAPONS[selectedWeapon as keyof typeof WEAPONS].name : 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选按钮 */}
        <div className="flex gap-4 mb-6 justify-center">
          <GlassButton
            onClick={() => setFilter('all')}
            size="sm"
            variant={filter === 'all' ? 'primary' : 'secondary'}
          >
            ALL
          </GlassButton>
          <GlassButton
            onClick={() => setFilter('weapon')}
            size="sm"
            variant={filter === 'weapon' ? 'primary' : 'secondary'}
            icon="⚔️"
          >
            WEAPONS
          </GlassButton>
          <GlassButton
            onClick={() => setFilter('armor')}
            size="sm"
            variant={filter === 'armor' ? 'primary' : 'secondary'}
            icon="🛡️"
          >
            ARMORS
          </GlassButton>
        </div>

        {/* 装备列表 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* 武器列表 */}
          {filteredWeapons.map((weapon) => {
            const isUnlocked = isWeaponUnlocked(weapon.id);
            const isEquipped = selectedWeapon === weapon.id;

            return (
              <button
                key={weapon.id}
                onClick={() => isUnlocked && handleEquipWeapon(weapon.id)}
                disabled={!isUnlocked}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${isEquipped 
                    ? 'bg-yellow-900/50 border-yellow-500 scale-105' 
                    : isUnlocked 
                      ? 'bg-red-900/30 border-red-600/50 hover:border-red-500 hover:scale-105' 
                      : 'bg-gray-800/30 border-gray-600 opacity-50 cursor-not-allowed'
                  }
                `}
                style={{
                  boxShadow: isEquipped ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none',
                }}
              >
                {/* 装备图标 */}
                <div className="text-6xl mb-2 text-center">
                  {isUnlocked ? weapon.icon : '🔒'}
                </div>

                {/* 装备名称 */}
                <p className="text-white font-bold text-sm text-center mb-1">
                  {isUnlocked ? weapon.name : '???'}
                </p>

                {/* 稀有度 */}
                {isUnlocked && (
                  <p 
                    className="text-xs text-center font-bold"
                    style={{ color: getRarityColor(weapon.rarity) }}
                  >
                    {weapon.rarity.toUpperCase()}
                  </p>
                )}

                {/* 已装备标记 */}
                {isEquipped && (
                  <div className="absolute top-2 right-2 text-yellow-400 text-xl">
                    ✓
                  </div>
                )}

                {/* 描述 */}
                {isUnlocked && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    {weapon.description}
                  </p>
                )}
              </button>
            );
          })}

          {/* 防具列表 */}
          {filteredArmors.map((armor) => {
            const isUnlocked = isArmorUnlocked(armor.id);
            const isEquipped = selectedArmor === armor.id;

            return (
              <button
                key={armor.id}
                onClick={() => isUnlocked && handleEquipArmor(armor.id)}
                disabled={!isUnlocked}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${isEquipped 
                    ? 'bg-yellow-900/50 border-yellow-500 scale-105' 
                    : isUnlocked 
                      ? 'bg-blue-900/30 border-blue-600/50 hover:border-blue-500 hover:scale-105' 
                      : 'bg-gray-800/30 border-gray-600 opacity-50 cursor-not-allowed'
                  }
                `}
                style={{
                  boxShadow: isEquipped ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none',
                }}
              >
                {/* 装备图标 */}
                <div className="text-6xl mb-2 text-center">
                  {isUnlocked ? armor.icon : '🔒'}
                </div>

                {/* 装备名称 */}
                <p className="text-white font-bold text-sm text-center mb-1">
                  {isUnlocked ? armor.name : '???'}
                </p>

                {/* 稀有度 */}
                {isUnlocked && (
                  <p 
                    className="text-xs text-center font-bold"
                    style={{ color: getRarityColor(armor.rarity) }}
                  >
                    {armor.rarity.toUpperCase()}
                  </p>
                )}

                {/* 已装备标记 */}
                {isEquipped && (
                  <div className="absolute top-2 right-2 text-yellow-400 text-xl">
                    ✓
                  </div>
                )}

                {/* 描述 */}
                {isUnlocked && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    {armor.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
