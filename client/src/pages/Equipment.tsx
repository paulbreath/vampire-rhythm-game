import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { equipmentManager } from '../lib/equipmentManager';
import type { Equipment, EquipmentLoadout } from '../types/equipment';
import { getRarityColor, getRarityText } from '../data/equipmentData';
import { toast } from 'sonner';

export default function EquipmentPage() {
  const [loadout, setLoadout] = useState<EquipmentLoadout>(equipmentManager.getLoadout());
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [filterType, setFilterType] = useState<Equipment['type'] | 'all'>('all');

  useEffect(() => {
    // 加载所有装备
    const equipment = equipmentManager.getAllEquipment();
    setAllEquipment(equipment);
    
    // 默认选中第一个已解锁的装备
    const firstUnlocked = equipment.find(e => equipmentManager.isEquipmentUnlocked(e.id));
    if (firstUnlocked) {
      setSelectedEquipment(firstUnlocked);
    }
  }, []);

  const handleEquip = (equipment: Equipment) => {
    if (!equipmentManager.isEquipmentUnlocked(equipment.id)) {
      toast.error('装备未解锁');
      return;
    }

    const success = equipmentManager.equipItem(equipment);
    if (success) {
      setLoadout(equipmentManager.getLoadout());
      toast.success(`已装备 ${equipment.nameZh}`);
    }
  };

  const handleUnequip = (slot: keyof EquipmentLoadout) => {
    equipmentManager.unequipItem(slot);
    setLoadout(equipmentManager.getLoadout());
    toast.success('已卸载装备');
  };

  const filteredEquipment = filterType === 'all' 
    ? allEquipment 
    : allEquipment.filter(e => e.type === filterType);

  const stats = equipmentManager.calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black text-white relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[url('/images/bg-church.png')] opacity-10 bg-cover bg-center" />
      
      {/* 返回按钮 */}
      <Link href="/">
        <button className="absolute top-8 left-8 px-6 py-3 bg-purple-900/50 hover:bg-purple-800/50 border-2 border-purple-500 rounded-lg transition-all z-10">
          ← 返回主菜单
        </button>
      </Link>

      {/* 标题 */}
      <div className="text-center pt-12 pb-8">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500 glow-red mb-2">
          EQUIPMENT
        </h1>
        <p className="text-purple-300 text-lg">装备系统</p>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：装备槽位 */}
          <div className="lg:col-span-1">
            <div className="bg-purple-950/50 border-2 border-purple-500 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-bold mb-6 text-center text-purple-300">装备槽位</h2>
              
              {/* 总属性 */}
              <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <h3 className="text-lg font-bold mb-2 text-purple-300">总属性</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>⚔️ 攻击力: <span className="text-red-400">{stats.totalAttack}</span></div>
                  <div>🛡️ 防御力: <span className="text-blue-400">{stats.totalDefense}</span></div>
                  <div>❤️ 生命值: <span className="text-green-400">+{stats.totalHP}</span></div>
                  <div>⚡ 速度: <span className="text-yellow-400">+{stats.totalSpeed}</span></div>
                </div>
              </div>

              {/* 装备槽位 */}
              <div className="space-y-3">
                <EquipmentSlot
                  label="武器"
                  icon="⚔️"
                  equipment={loadout.weapon}
                  onUnequip={() => handleUnequip('weapon')}
                  onClick={() => loadout.weapon && setSelectedEquipment(loadout.weapon)}
                />
                <EquipmentSlot
                  label="头盔"
                  icon="🎩"
                  equipment={loadout.helmet}
                  onUnequip={() => handleUnequip('helmet')}
                  onClick={() => loadout.helmet && setSelectedEquipment(loadout.helmet)}
                />
                <EquipmentSlot
                  label="胸甲"
                  icon="🛡️"
                  equipment={loadout.armor}
                  onUnequip={() => handleUnequip('armor')}
                  onClick={() => loadout.armor && setSelectedEquipment(loadout.armor)}
                />
                <EquipmentSlot
                  label="护腿"
                  icon="👢"
                  equipment={loadout.legs}
                  onUnequip={() => handleUnequip('legs')}
                  onClick={() => loadout.legs && setSelectedEquipment(loadout.legs)}
                />
                <EquipmentSlot
                  label="饰品1"
                  icon="💍"
                  equipment={loadout.accessory1}
                  onUnequip={() => handleUnequip('accessory1')}
                  onClick={() => loadout.accessory1 && setSelectedEquipment(loadout.accessory1)}
                />
                <EquipmentSlot
                  label="饰品2"
                  icon="💍"
                  equipment={loadout.accessory2}
                  onUnequip={() => handleUnequip('accessory2')}
                  onClick={() => loadout.accessory2 && setSelectedEquipment(loadout.accessory2)}
                />
              </div>
            </div>
          </div>

          {/* 右侧：装备列表和详情 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 过滤器 */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'weapon', 'helmet', 'armor', 'legs', 'accessory'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    filterType === type
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-purple-900/30 border-purple-700 text-purple-300 hover:border-purple-500'
                  }`}
                >
                  {type === 'all' ? '全部' : 
                   type === 'weapon' ? '武器' :
                   type === 'helmet' ? '头盔' :
                   type === 'armor' ? '胸甲' :
                   type === 'legs' ? '护腿' : '饰品'}
                </button>
              ))}
            </div>

            {/* 装备列表 */}
            <div className="bg-purple-950/50 border-2 border-purple-500 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-bold mb-4 text-purple-300">装备列表</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredEquipment.map(equipment => (
                  <EquipmentCard
                    key={equipment.id}
                    equipment={equipment}
                    isUnlocked={equipmentManager.isEquipmentUnlocked(equipment.id)}
                    isEquipped={equipmentManager.isEquipped(equipment.id)}
                    isSelected={selectedEquipment?.id === equipment.id}
                    onClick={() => setSelectedEquipment(equipment)}
                  />
                ))}
              </div>
            </div>

            {/* 装备详情 */}
            {selectedEquipment && (
              <div className="bg-purple-950/50 border-2 border-purple-500 rounded-lg p-6 backdrop-blur">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{selectedEquipment.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold" style={{ color: getRarityColor(selectedEquipment.rarity) }}>
                          {selectedEquipment.nameZh}
                        </h2>
                        <p className="text-sm text-purple-300">{selectedEquipment.name}</p>
                      </div>
                    </div>
                    <p className="text-purple-200 text-sm mb-4">{selectedEquipment.description}</p>
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ 
                      backgroundColor: getRarityColor(selectedEquipment.rarity) + '30',
                      color: getRarityColor(selectedEquipment.rarity)
                    }}
                  >
                    {getRarityText(selectedEquipment.rarity)}
                  </span>
                </div>

                {/* 属性 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {selectedEquipment.attack && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                      <span className="text-red-400">⚔️ 攻击力: +{selectedEquipment.attack}</span>
                    </div>
                  )}
                  {selectedEquipment.defense && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2">
                      <span className="text-blue-400">🛡️ 防御力: +{selectedEquipment.defense}</span>
                    </div>
                  )}
                  {selectedEquipment.hp && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                      <span className="text-green-400">❤️ 生命值: +{selectedEquipment.hp}</span>
                    </div>
                  )}
                  {selectedEquipment.speed && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-2">
                      <span className="text-yellow-400">⚡ 速度: +{selectedEquipment.speed}</span>
                    </div>
                  )}
                </div>

                {/* 特殊效果 */}
                {selectedEquipment.effects && selectedEquipment.effects.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-purple-300 mb-2">特殊效果</h3>
                    <div className="space-y-2">
                      {selectedEquipment.effects.map((effect, index) => (
                        <div key={index} className="bg-purple-900/30 border border-purple-500/30 rounded p-2">
                          <span className="text-purple-200">✨ {effect.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 解锁条件 */}
                {!equipmentManager.isEquipmentUnlocked(selectedEquipment.id) && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded p-3 mb-4">
                    <span className="text-red-400">
                      🔒 解锁条件: {
                        selectedEquipment.unlockCondition.type === 'level' 
                          ? `达到等级 ${selectedEquipment.unlockCondition.value}`
                          : selectedEquipment.unlockCondition.type === 'stage'
                          ? `通关 ${selectedEquipment.unlockCondition.value} 个关卡`
                          : selectedEquipment.unlockCondition.type === 'achievement'
                          ? `完成成就: ${selectedEquipment.unlockCondition.value}`
                          : '默认解锁'
                      }
                    </span>
                  </div>
                )}

                {/* 装备按钮 */}
                <button
                  onClick={() => handleEquip(selectedEquipment)}
                  disabled={!equipmentManager.isEquipmentUnlocked(selectedEquipment.id) || equipmentManager.isEquipped(selectedEquipment.id)}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                    !equipmentManager.isEquipmentUnlocked(selectedEquipment.id)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : equipmentManager.isEquipped(selectedEquipment.id)
                      ? 'bg-green-700 text-white cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {!equipmentManager.isEquipmentUnlocked(selectedEquipment.id)
                    ? '🔒 未解锁'
                    : equipmentManager.isEquipped(selectedEquipment.id)
                    ? '✓ 已装备'
                    : '装备'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 装备槽位组件
function EquipmentSlot({ 
  label, 
  icon, 
  equipment, 
  onUnequip,
  onClick 
}: { 
  label: string; 
  icon: string; 
  equipment: Equipment | null;
  onUnequip: () => void;
  onClick: () => void;
}) {
  return (
    <div className="bg-purple-900/30 border-2 border-purple-700 rounded-lg p-3 hover:border-purple-500 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-purple-300">{icon} {label}</span>
        {equipment && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnequip();
            }}
            className="text-xs text-red-400 hover:text-red-300"
          >
            卸载
          </button>
        )}
      </div>
      {equipment ? (
        <div 
          onClick={onClick}
          className="flex items-center gap-2 cursor-pointer hover:bg-purple-800/30 rounded p-2 transition-all"
        >
          <span className="text-2xl">{equipment.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: getRarityColor(equipment.rarity) }}>
              {equipment.nameZh}
            </p>
            <p className="text-xs text-purple-400">
              {equipment.attack && `⚔️${equipment.attack} `}
              {equipment.hp && `❤️${equipment.hp} `}
              {equipment.defense && `🛡️${equipment.defense}`}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-purple-600">
          <span className="text-3xl opacity-30">{icon}</span>
          <p className="text-xs mt-1">空</p>
        </div>
      )}
    </div>
  );
}

// 装备卡片组件
function EquipmentCard({ 
  equipment, 
  isUnlocked, 
  isEquipped,
  isSelected,
  onClick 
}: { 
  equipment: Equipment; 
  isUnlocked: boolean;
  isEquipped: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-purple-900/30 border-2 rounded-lg p-3 cursor-pointer transition-all ${
        isSelected 
          ? 'border-purple-400 bg-purple-800/40' 
          : 'border-purple-700 hover:border-purple-500'
      } ${!isUnlocked && 'opacity-50'}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{equipment.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold truncate" style={{ color: getRarityColor(equipment.rarity) }}>
              {equipment.nameZh}
            </p>
            {isEquipped && <span className="text-xs text-green-400">✓</span>}
            {!isUnlocked && <span className="text-xs text-red-400">🔒</span>}
          </div>
          <p className="text-xs text-purple-400">
            {equipment.attack && `⚔️${equipment.attack} `}
            {equipment.hp && `❤️${equipment.hp} `}
            {equipment.defense && `🛡️${equipment.defense} `}
            {equipment.speed && `⚡${equipment.speed}`}
          </p>
        </div>
      </div>
    </div>
  );
}
