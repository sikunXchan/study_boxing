import { useState, useMemo } from 'react';
import { User, Activity, Sword, ChevronUp, X, Check, Dog, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { calculateLevelData, calculateMultiplier } from '../utils/level';

export default function HomeArea({ stats, inventory, setInventory, equippedItems, setEquippedItems }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showEvolutionAnim, setShowEvolutionAnim] = useState(false);

  // Configuration for the 8 equipment slots (6 Player + 2 Pet)
  const slotsConfig = [
    { type: 'weapon', label: '武器', icon: 'Sword' },
    { type: 'necklace', label: '首飾り', icon: 'Gem' },
    { type: 'gloves', label: '手袋', icon: 'Hand' },
    { type: 'armor', label: '鎧', icon: 'Shield' },
    { type: 'belt', label: 'ベルト', icon: 'LifeBuoy' },
    { type: 'boots', label: '靴', icon: 'Footprints' },
    { type: 'pet_entity', label: 'ペット本体', icon: 'Bug', isPetMode: true },
    { type: 'collar', label: 'ペット首輪', icon: 'Circle', isPetMode: true },
    { type: 'toy', label: 'おもちゃ', icon: 'Bone', isPetMode: true },
  ];

  const getRarityStyle = (rarity) => {
    switch (rarity) {
      case 'god': return 'border-game-accent shadow-[0_0_20px_rgba(255,255,255,0.8)] text-white bg-transparent animate-rainbow bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-border';
      case 'legendary': return 'border-game-accent shadow-[0_0_15px_rgba(251,191,36,0.6)] text-game-accent bg-[#fbbf24]/10';
      case 'epic': return 'border-game-secondary shadow-[0_0_15px_rgba(139,92,246,0.5)] text-game-secondary bg-game-secondary/10';
      case 'rare': return 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] text-blue-400 bg-blue-500/10';
      case 'uncommon': return 'border-game-primary shadow-[0_0_10px_rgba(16,185,129,0.3)] text-game-primary bg-game-primary/10';
      case 'normal': 
      default: return 'border-game-muted text-gray-400 bg-game-surface';
    }
  };

  const getNextRarity = (rarity) => {
    const order = ['normal', 'uncommon', 'rare', 'epic', 'legendary', 'god'];
    const idx = order.indexOf(rarity);
    if (idx !== -1 && idx < order.length - 1) return order[idx + 1];
    return rarity;
  };

  const getIconAccentColor = (rarity) => {
    switch(rarity) {
      case 'god': return 'animate-god-glow';
      case 'legendary': return 'drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] text-[#fbbf24]';
      case 'epic': return 'drop-shadow-[0_0_12px_rgba(139,92,246,0.9)] text-[#a78bfa]';
      case 'rare': return 'drop-shadow-[0_0_12px_rgba(59,130,246,0.9)] text-[#60a5fa]';
      case 'uncommon': return 'drop-shadow-[0_0_12px_rgba(16,185,129,0.9)] text-[#34d399]';
      default: return 'drop-shadow-md text-gray-300';
    }
  };

  const getAuraClass = (item) => {
    if (!item) return '';
    const isAwakened = (item.awakened || 0) > 0;
    const isMax = (item.upgradeLevel || 0) >= 4;
    const isGod = item.rarity === 'god';

    if (isGod) return 'aura-god';
    if (!isAwakened && !isMax) return '';

    switch (item.rarity) {
      case 'legendary': return 'aura-legendary';
      case 'epic': return 'aura-epic';
      case 'rare': return 'aura-rare';
      case 'uncommon': return 'aura-uncommon';
      default: return '';
    }
  };

  const getPassiveLabel = (passiveId) => {
    switch(passiveId) {
      case 'golden_spirit_15': return '小さな幸運 (ジェム率15%)';
      case 'golden_spirit_25': return '黄金の精神 (ジェム率25%)';
      case 'efficient_learning': return '効率的な学習 (ATK報酬+20%)';
      case 'super_recovery': return '超回復 (HP報酬+20%)';
      case 'bunbu_ryodo': return '文武両道 (全報酬+20%)';
      case 'tenma_guide': return '天馬の導き (ジェム率40% & 全報酬+30%)';
      case 'pet_toy_boost_1.2': return 'おもちゃマニア (おもちゃH Px1.2)';
      case 'pet_collar_boost_1.2': return '首輪マニア (首輪ATK x1.2)';
      case 'pet_gear_boost_1.3': return '野生の力 (ペット装備全般 x1.3)';
      case 'pet_gear_boost_1.5': return '神話の加護 (ペット装備全般 x1.5)';
      default: return '不明な能力';
    }
  }

  // Calculate Equipment Bonuses and Passives
  const { bonusATK, bonusHP, activePassives, activePet, rawPassiveATK, rawPassiveHP } = useMemo(() => {
    let baseBonusATK = 0;
    let baseBonusHP = 0;
    const passives = new Set();
    
    // 1. Check pet setup constraints
    let pet = null;
    let collarMultiplierATK = 1.0;
    let collarMultiplierHP = 1.0;
    let toyMultiplierATK = 1.0;
    let toyMultiplierHP = 1.0;

    const equippedPetId = equippedItems.pet_entity;
    if (equippedPetId) {
       pet = inventory.find(i => i.id === equippedPetId);
       if (pet && pet.passive) {
         passives.add(pet.passive);
         
         // Apply pet-specific gear multipliers based on their passive!
         switch(pet.passive) {
            case 'pet_toy_boost_1.2':
              toyMultiplierHP = 1.2;
              break;
            case 'pet_collar_boost_1.2':
              collarMultiplierATK = 1.2;
              break;
            case 'pet_gear_boost_1.3':
              collarMultiplierATK = 1.3;
              collarMultiplierHP = 1.3;
              toyMultiplierATK = 1.3;
              toyMultiplierHP = 1.3;
              break;
            case 'pet_gear_boost_1.5':
              collarMultiplierATK = 1.5;
              collarMultiplierHP = 1.5;
              toyMultiplierATK = 1.5;
              toyMultiplierHP = 1.5;
              break;
            default: break;
         }
       }
    }
    
    // Calculate stats from Collection Bonus (Passive for ALL Max items + Awakened)
    let passiveBonusATK = 0;
    let passiveBonusHP = 0;
    // Keep track of which items are equipped to not double-count them
    const equippedItemIds = new Set(Object.values(equippedItems).filter(Boolean));

    inventory.forEach(item => {
      const isGear = item.type !== 'pet_entity';
      const isMax = (item.upgradeLevel || 0) >= 4;
      const isCollectionItem = (isMax || (item.awakened || 0) > 0 || item.rarity === 'god');

      if (isCollectionItem && !equippedItemIds.has(item.id)) {
         const upgradeFactor = Math.pow(isGear ? 1.5 : 1.1, item.upgradeLevel || 0);
         const awakeFactor = 1 + (item.awakened || 0) * (isGear ? 0.2 : 0.1);
         passiveBonusATK += Math.floor((item.bonusATK || 0) * upgradeFactor * awakeFactor * 0.1);
         passiveBonusHP += Math.floor((item.bonusHP || 0) * upgradeFactor * awakeFactor * 0.1);
      }
    });
    
    equippedItemIds.forEach(itemId => {
      const item = inventory.find(i => i.id === itemId);
      if (item) {
        const isGear = item.type !== 'pet_entity';
        const upgradeFactor = Math.pow(isGear ? 1.5 : 1.1, item.upgradeLevel || 0);
        const awakeFactor = 1 + (item.awakened || 0) * (isGear ? 0.2 : 0.1);

        let finalItemATK = Math.floor((item.bonusATK || 0) * upgradeFactor * awakeFactor);
        let finalItemHP = Math.floor((item.bonusHP || 0) * upgradeFactor * awakeFactor);

        if (item.type === 'collar') {
           finalItemATK = Math.floor(finalItemATK * collarMultiplierATK);
           finalItemHP = Math.floor(finalItemHP * collarMultiplierHP);
        } else if (item.type === 'toy') {
           finalItemATK = Math.floor(finalItemATK * toyMultiplierATK);
           finalItemHP = Math.floor(finalItemHP * toyMultiplierHP);
        }

        baseBonusATK += finalItemATK;
        baseBonusHP += finalItemHP;
      }
    });

    const totalATK = baseBonusATK + passiveBonusATK;
    const totalHP = baseBonusHP + passiveBonusHP;

    return { 
      bonusATK: totalATK, 
      bonusHP: totalHP, 
      activePassives: Array.from(passives),
      activePet: pet,
      rawPassiveATK: passiveBonusATK,
      rawPassiveHP: passiveBonusHP
    };
  }, [equippedItems, inventory]);

  // Level is strictly based on Base Stats (EXP from quests) to prevent infinite leveling loops via equipment changing.
  const baseExp = stats.atk + stats.hp;
  const { currentLevel, currentExpInLevel, expRequiredForNext, progressPercentage } = useMemo(() => calculateLevelData(baseExp), [baseExp]);
  
  const multiplier = useMemo(() => calculateMultiplier(currentLevel), [currentLevel]);
  const finalATK = Math.floor((stats.atk + bonusATK) * multiplier);
  const finalHP = Math.floor((stats.hp + bonusHP) * multiplier);

  const handleEquip = (itemId) => {
    setEquippedItems(prev => ({ ...prev, [selectedSlot]: itemId }));
    setSelectedSlot(null);
  };

  const handleUnequip = () => {
    setEquippedItems(prev => ({ ...prev, [selectedSlot]: null }));
    setSelectedSlot(null);
  };

  const renderIcon = (iconName, className) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <IconComponent className={className} size={32} />;
  };

  const activeModalItems = inventory.filter(item => item.type === selectedSlot);

  return (
    <div className="p-4 flex flex-col items-center h-full space-y-6 animate-in fade-in zoom-in duration-300 relative">
      
      {/* Dynamic Avatar & Pet Header */}
      <div className="flex items-center justify-center gap-6 mt-8 shrink-0">
        
        {/* Player Avatar */}
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 bg-game-primary/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-gradient-to-b from-game-surface to-[#111827] w-full h-full rounded-full border-4 border-game-primary shadow-neon flex items-center justify-center overflow-hidden">
            <User size={70} className="text-game-primary" />
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-game-bg border border-game-primary px-4 py-1 rounded-full text-xs font-bold text-game-primary shadow-neon whitespace-nowrap flex items-center gap-1">
            <ChevronUp size={14} /> Lv. {currentLevel} 生徒
          </div>
        </div>
        
        {/* Pet Avatar */}
        <div className="relative w-20 h-20 mt-4 flex flex-col items-center">
          <div className={`absolute inset-0 rounded-full blur-md ${activePassives.length > 0 ? 'bg-game-accent/30 animate-pulse' : 'bg-game-surface/50'}`}></div>
          <div className={`relative w-full h-full rounded-full border-2 flex items-center justify-center bg-[#111827] z-10 
            ${activePet ? getRarityStyle(activePet.rarity).split(' ')[0] : 'border-game-surface'}
            ${activePet && activePet.rarity === 'god' ? 'animate-rainbow shadow-[0_0_15px_rgba(255,255,255,0.8)]' : (activePassives.length > 0 || (activePet && (activePet.awakened || 0) > 0)) ? 'text-game-accent shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'text-gray-500'}`}>
            
            {activePet ? renderIcon(activePet.iconName, getIconAccentColor(activePet.rarity)) : <Dog size={40} />}
          </div>
          {activePet && (
             <span className="text-[9px] font-bold text-game-primary mt-1 absolute -bottom-5 whitespace-nowrap">
              ATK+{Math.floor(activePet.bonusATK * Math.pow(1.1, activePet.upgradeLevel || 0) * (1 + (activePet.awakened || 0) * 0.1))} / HP+{Math.floor(activePet.bonusHP * Math.pow(1.1, activePet.upgradeLevel || 0) * (1 + (activePet.awakened || 0) * 0.1))}
             </span>
          )}
          {activePassives.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-game-accent text-black w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-20 shadow-lg">
              <Sparkles size={12} />
            </div>
          )}
        </div>
      </div>

      {/* Passive Skills Display */}
      {activePassives.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm w-full pt-2">
          {activePassives.map(p => (
            <span key={p} className="text-[9px] font-bold px-2 py-0.5 rounded-sm bg-game-accent/20 border border-game-accent text-game-accent drop-shadow-md">
              {getPassiveLabel(p)}
            </span>
          ))}
        </div>
      )}

      {/* Level Progress */}
      <div className="w-full max-w-sm px-4 shrink-0">
        <div className="h-1.5 w-full bg-game-surface rounded-full overflow-hidden mt-1">
          <div className="h-full bg-game-primary transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p className="text-center text-[10px] text-game-muted mt-1 font-bold">NEXT LEVEL: {currentExpInLevel} / {expRequiredForNext} EXP</p>
      </div>

      {/* Multiplier Based Status Points */}
      <div className="w-full max-w-sm flex gap-4 pt-1 shrink-0">
        <div className="flex-1 glass-panel p-3 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] flex flex-col items-center justify-center relative group">
          <span className="text-red-400 text-[10px] font-bold flex items-center gap-1 mb-1 whitespace-nowrap">
            <Sword size={12} /> ATK
          </span>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white">{finalATK.toLocaleString()}</span>
            <span className="text-[9px] text-gray-400 font-bold mt-1">({stats.atk + bonusATK} x {multiplier.toFixed(2)})</span>
          </div>
          {rawPassiveATK > 0 && (
            <div className="absolute -top-6 bg-game-surface border border-game-muted/30 px-2 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
              内、コレクションボーナス: +{rawPassiveATK}
            </div>
          )}
        </div>

        <div className="flex-1 glass-panel p-3 border-game-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex flex-col items-center justify-center relative group">
          <span className="text-game-primary text-[10px] font-bold flex items-center gap-1 mb-1 whitespace-nowrap">
            <Activity size={12} /> HP
          </span>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white">{finalHP.toLocaleString()}</span>
            <span className="text-[9px] text-gray-400 font-bold mt-1">({stats.hp + bonusHP} x {multiplier.toFixed(2)})</span>
          </div>
          {rawPassiveHP > 0 && (
            <div className="absolute -top-6 bg-game-surface border border-game-muted/30 px-2 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
              内、コレクションボーナス: +{rawPassiveHP}
            </div>
          )}
        </div>
      </div>

      {/* Equipment Slots Grid */}
      <div className="w-full max-w-sm flex-1 pb-24 overflow-y-auto custom-scrollbar">
        <h3 className="text-sm font-bold text-game-muted mb-4 flex items-center">
          <span className="w-full h-px bg-game-surface/80 mr-3"></span>
          EQUIPMENT & PET
          <span className="w-full h-px bg-game-surface/80 ml-3"></span>
        </h3>
        
        <div className="grid grid-cols-4 gap-y-6 gap-x-3 mx-auto place-items-center">
          {slotsConfig.map((slot) => {
            const equippedId = equippedItems[slot.type];
            const item = inventory.find(i => i.id === equippedId);

            return (
              <div key={slot.type} className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => setSelectedSlot(slot.type)}
                  className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center shadow-lg transition-transform active:scale-95
                    ${item ? getRarityStyle(item.rarity) : 'border-dashed border-game-surface bg-[#111827] text-game-surface hover:border-game-primary/50'}`}
                >
                  {item ? (
                    renderIcon(item.iconName, getIconAccentColor(item.rarity))
                  ) : (
                    <LucideIcons.Plus size={24} />
                  )}
                  {/* Slot Label rendering -> check if awakened first, else max, else level */}
                  {item && (
                     <div className={`absolute -bottom-2 -right-2 bg-[#111827] border border-current text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md truncate max-w-[50px]
                       ${(item.awakened || 0) > 0 ? 'text-game-accent animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}
                     `}>
                       {(item.awakened || 0) > 0 ? `覚醒 Lv.${item.awakened}` : (item.upgradeLevel >= 4 && item.type !== 'pet_entity') ? 'MAX' : `Lv.${(item.upgradeLevel || 0) + 1}`}
                     </div>
                  )}
                  {/* Aura if God or Awakened or MAX */}
                  {item && <div className={`aura-base ${getAuraClass(item)}`}></div>}
                </button>
                <span className="text-[10px] text-gray-500 font-bold">{slot.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equip Modal */}
      {selectedSlot && (
        <div className="absolute inset-x-0 bottom-0 top-[-64px] z-50 bg-[#111827]/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom-8 duration-300">
          <div className="p-4 flex justify-between items-center border-b border-game-surface">
            <h2 className="font-bold text-white capitalize">{slotsConfig.find(s => s.type === selectedSlot)?.label} の装備</h2>
            <button onClick={() => setSelectedSlot(null)} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {activeModalItems.length === 0 ? (
              <div className="text-center text-game-muted py-12">所持しているアイテムがありません</div>
            ) : (
              activeModalItems.map(item => {
                const isEquipped = equippedItems[selectedSlot] === item.id;
                
                const isGear = item.type !== 'pet_entity';
                const isMaxLevel = (item.upgradeLevel || 0) >= 4;
                const duplicates = inventory.filter(i => {
                  if (i.id === item.id) return false;
                  if (i.label !== item.label || i.rarity !== item.rarity) return false;
                  if (!isMaxLevel) {
                    return (i.upgradeLevel || 0) === (item.upgradeLevel || 0);
                  }
                  return true;
                });
                
                // v10 Rules:
                // Evolution: Gear at Awakened Lv.4+, Pet at MAX Lv.5.
                const canEvolve = item.rarity !== 'god' && duplicates.length > 0 && (
                  (isGear && (item.awakened || 0) >= 4) ||
                  (!isGear && isMaxLevel)
                );
                // Awakening: Available after MAX Level.
                const canAwaken = isMaxLevel && duplicates.length > 0;
                const canUpgrade = !isMaxLevel && duplicates.length > 0;
                const canMerge = (canEvolve || canAwaken || canUpgrade);

                const handleMerge = () => {
                  const consumeItem = duplicates[0];
                  
                  if (canEvolve) {
                    const nextRarity = getNextRarity(item.rarity);
                    const isToGod = nextRarity === 'god';
                    // v10: Guaranteed Evolution Multipliers
                    // Gear: 1.33x (+33% power jump)
                    // Pet: 2.5x (Non-God), 4.0x (to God)
                    const statMult = isToGod 
                      ? (item.type === 'pet_entity' ? 4.0 : 1.33) 
                      : (item.type === 'pet_entity' ? 2.5 : 1.33);

                    setShowEvolutionAnim(true);
                    setTimeout(() => setShowEvolutionAnim(false), 2000);

                    setInventory(prev => prev.map(i => {
                      if (i.id === item.id) {
                        const isGear = i.type !== 'pet_entity';
                        const upgradeMult = Math.pow(isGear ? 1.5 : 1.1, i.upgradeLevel || 0);
                        const awakeMult = 1 + (i.awakened || 0) * (isGear ? 0.2 : 0.1);
                        return {
                          ...i,
                          rarity: nextRarity,
                          upgradeLevel: 0,
                          awakened: 0,
                          bonusATK: Math.floor(i.bonusATK * upgradeMult * awakeMult * statMult),
                          bonusHP: Math.floor(i.bonusHP * upgradeMult * awakeMult * statMult)
                        };
                      }
                      return i;
                    }).filter(i => i.id !== consumeItem.id));
                  } else if (canAwaken) {
                    setInventory(prev => prev.map(i => {
                      if (i.id === item.id) {
                        return { ...i, awakened: (i.awakened || 0) + 1 };
                      }
                      return i;
                    }).filter(i => i.id !== consumeItem.id));
                  } else {
                    setInventory(prev => prev.map(i => {
                      if (i.id === item.id) {
                        return { ...i, upgradeLevel: (i.upgradeLevel || 0) + 1 };
                      }
                      return i;
                    }).filter(i => i.id !== consumeItem.id));
                  }
                };
                
                const awakeDisplay = (item.awakened || 0) > 0 ? `[覚醒 Lv.${item.awakened}]` : '';
                const baseLevelText = isMaxLevel ? 'MAX' : `Lv.${(item.upgradeLevel || 0) + 1}`;
                const displayName = `${item.label} ${baseLevelText} ${awakeDisplay}`.trim();

                const upgradeMult = Math.pow(isGear ? 1.5 : 1.1, item.upgradeLevel || 0);
                const awakeMult = 1.0 + ((item.awakened || 0) * (isGear ? 0.2 : 0.1));
                const displayAtk = Math.floor((item.bonusATK || 0) * upgradeMult * awakeMult);
                const displayHp = Math.floor((item.bonusHP || 0) * upgradeMult * awakeMult);

                return (
                  <div key={item.id} className={`glass-panel p-3 border-l-4 flex gap-3 items-center relative overflow-hidden transition-all
                    ${isEquipped ? 'border-l-game-primary bg-game-primary/5' : 'border-l-game-surface'}
                    ${item.rarity === 'god' ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : (item.awakened || 0) > 0 ? 'shadow-[0_0_20px_rgba(251,191,36,0.2)] border-l-game-accent' : ''}
                    ${isMaxLevel && !isEquipped ? 'shadow-[0_0_15px_rgba(251,191,36,0.15)] ring-1 ring-game-accent/20' : ''}
                  `}>
                    
                    {/* Awakened / Collection Flash Effect Background */}
                    {(item.awakened || 0) > 0 && <div className="absolute inset-0 bg-gradient-to-r from-game-accent/10 to-transparent pointer-events-none animate-pulse"></div>}
                    {isMaxLevel && !isEquipped && <div className="absolute inset-0 bg-gradient-to-r from-game-accent/5 to-transparent pointer-events-none"></div>}

                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 border relative ${getRarityStyle(item.rarity)}`}>
                       {renderIcon(item.iconName, getIconAccentColor(item.rarity))}
                       {isMaxLevel && (item.awakened || 0) === 0 && item.rarity !== 'god' && <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-1 font-bold rounded shadow-[0_0_5px_rgba(239,68,68,0.5)]">MAX</div>}
                       {item && <div className={`aura-base !rounded-lg ${getAuraClass(item)}`}></div>}
                    </div>
                    
                    <div className="flex-1 min-w-0 relative z-10">
                      <h4 className={`font-bold text-sm truncate ${(item.awakened || 0) > 0 ? 'text-game-accent' : 'text-gray-200'}`}>{displayName}</h4>
                      <div className="flex gap-3 text-[10px] mt-1">
                        {displayAtk > 0 && <span className="text-red-400 font-bold whitespace-nowrap">ATK +{displayAtk}</span>}
                        {displayHp > 0 && <span className="text-game-primary font-bold whitespace-nowrap">HP +{displayHp}</span>}
                      </div>

                      {/* Merge Button rendering under stats */}
                      {canMerge && (
                        <button 
                          onClick={handleMerge} 
                          className={`mt-2 text-[10px] font-black px-2 py-1 rounded-md flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md border
                            ${canEvolve 
                               ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-white animate-pulse' 
                               : canAwaken
                               ? 'text-game-accent bg-game-accent/10 border-game-accent/50'
                               : 'text-blue-400 bg-blue-500/10 border-blue-500/50'
                            }`}
                        >
                          {canEvolve 
                            ? <><Sparkles size={12} /> 上のレアリティへ進化！</> 
                            : canAwaken 
                            ? <><LucideIcons.TrendingUp size={12} /> 限界突破 (覚醒)</> 
                            : <><Check size={12} /> 同じものを合成 (強化)</>
                          }
                        </button>
                      )}
                      
                      {/* Define flags for render */}
                      {(() => {
                        const isGearCollection = item.type !== 'pet_entity' && ((item.upgradeLevel || 0) >= 4 || (item.awakened || 0) > 0);
                        const isPetCollection = item.type === 'pet_entity' && item.rarity === 'god' && (item.awakened || 0) > 0;
                        
                        return !isEquipped && (isGearCollection || isPetCollection) && (
                          <div className="mt-2 p-1.5 bg-game-accent/10 border border-game-accent/30 rounded-md">
                            <span className="text-[10px] font-bold text-game-accent flex items-center gap-1">
                               <Check size={12} /> コレクションボーナス発動中!
                            </span>
                            <p className="text-[8px] text-game-accent/80 mt-0.5 ml-4 leading-tight">
                              ※未装備でもステータスに加算されています (覚醒中の方も含む)
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    {!isEquipped ? (
                       <button onClick={() => handleEquip(item.id)} className="shrink-0 px-4 py-2 text-xs font-bold rounded bg-game-surface hover:bg-game-primary/20 hover:text-game-primary transition-all border border-game-surface">
                         装備
                       </button>
                    ) : (
                       <button disabled className="shrink-0 px-4 py-2 text-xs font-bold rounded bg-transparent text-game-primary flex items-center gap-1 opacity-80 cursor-default">
                         <Check size={14} /> 装備中
                       </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
          
          <div className="p-4 border-t border-game-surface">
             <button 
                onClick={handleUnequip}
                disabled={!equippedItems[selectedSlot]}
                className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-lg disabled:opacity-30 flex items-center justify-center gap-2"
              >
                装備を外す
              </button>
          </div>
        </div>
      )}
      {/* Evolution Success Animation Overlay */}
      {showEvolutionAnim && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm animate-pulse"></div>
          <div className="p-8 rounded-2xl bg-white shadow-[0_0_50px_rgba(255,255,255,1)] animate-evolution-success flex flex-col items-center">
             <Sparkles size={80} className="text-yellow-400 mb-4" />
             <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 uppercase tracking-tighter">Evolution!</h1>
          </div>
        </div>
      )}
    </div>
  );
}
