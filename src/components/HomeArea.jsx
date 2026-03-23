import { useState, useMemo } from 'react';
import { User, Activity, Sword, ChevronUp, X, Check, Dog, Sparkles, AlertTriangle, Lock, Unlock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { calculateLevelData, calculateMultiplier, AVATAR_RANKS, SKINS } from '../utils/level';
import { calculateTotalStats } from '../utils/statCalculator';

export default function HomeArea({ stats, setStats, inventory, setInventory, equippedItems, setEquippedItems, facilities, playerRank, setPlayerRank, activeSkin, setActiveSkin, reincarnationCount, setReincarnationCount }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showEvolutionAnim, setShowEvolutionAnim] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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
    
    // Only awakened items emit an aura (even God rarity)
    if (!isAwakened) return '';

    if (item.rarity === 'god') return 'aura-god';

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
  const { bonusATK, bonusHP, activePassives, activePet, rawPassiveATK, rawPassiveHP } = useMemo(() => calculateTotalStats(inventory, equippedItems, facilities, reincarnationCount), [equippedItems, inventory, facilities, reincarnationCount]);

  // Level is strictly based on Base Stats (EXP from quests) to prevent infinite leveling loops via equipment changing.
  const baseExp = stats.atk + stats.hp;
  const { currentLevel, currentExpInLevel, expRequiredForNext, progressPercentage } = useMemo(() => calculateLevelData(baseExp), [baseExp]);
  
  const multiplier = useMemo(() => calculateMultiplier(currentLevel), [currentLevel]);
  const finalATK = Math.floor((stats.atk + bonusATK) * multiplier);
  const finalHP = Math.floor((stats.hp + bonusHP) * multiplier);
  
  // Avatar Management Data
  const currentRankObj = AVATAR_RANKS.find(r => r.id === playerRank) || AVATAR_RANKS[0];
  const activeSkinObj = activeSkin ? SKINS.find(s => s.id === activeSkin) : null;
  const displayIconName = activeSkinObj ? activeSkinObj.icon : currentRankObj.icon;
  const displayName = activeSkinObj ? activeSkinObj.name : currentRankObj.name;
  
  const handleReincarnate = () => {
    if (confirm('【警告】転生するとレベル・ステータス・装備品・進行中クラスが全てリセットされます（お金と施設と悪習慣リストは残ります）。\n\n代わりに全てのステータス永続倍率が＋100%(実質ベース倍)になります。\n本当に転生しますか？')) {
      setStats({ atk: 0, hp: 0 });
      setInventory([]);
      setEquippedItems({ weapon: null, armor: null, necklace: null, gloves: null, belt: null, boots: null, collar: null, toy: null, pet_entity: null });
      setPlayerRank(1);
      setReincarnationCount(prev => (prev || 0) + 1);
      setActiveSkin(null);
      setShowAvatarModal(false);
    }
  };

  const handleClassChange = (nextRank) => {
    if (currentLevel >= nextRank.reqLevel && finalATK >= nextRank.reqAtk) {
      setShowAvatarModal(false);
      setShowEvolutionAnim(true);
      // Wait for animation to finish before applying rank
      setTimeout(() => {
        setPlayerRank(nextRank.id);
        setTimeout(() => setShowEvolutionAnim(false), 2000);
      }, 500);
    }
  };

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
      
      {/* Notification Tooltip */}
      <div className="absolute top-8 pointer-events-none text-game-primary font-bold text-[10px] animate-bounce bg-game-surface border border-game-primary/30 px-3 py-1 rounded-full shadow-neon z-30">
        ↓ アバターをタップしてクラスチェンジ！ ↓
      </div>

      {/* Dynamic Avatar & Pet Header */}
      <div className="flex items-center justify-center gap-6 mt-8 shrink-0">
        
        {/* Player Avatar (Now Clickable) */}
        <button 
          onClick={() => setShowAvatarModal(true)}
          className="relative w-32 h-32 cursor-pointer outline-none active:scale-95 transition-transform group"
        >
          {/* Reincarnation Aura */}
          {reincarnationCount > 0 && (
            <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-2xl animate-pulse"></div>
          )}
          <div className="absolute inset-0 bg-game-primary/20 rounded-full blur-xl animate-pulse group-hover:bg-game-primary/40 transition-colors"></div>
          <div className={`relative w-full h-full rounded-full border-4 shadow-neon flex items-center justify-center overflow-hidden bg-gradient-to-b from-game-surface to-[#111827] 
            ${reincarnationCount > 0 ? 'border-yellow-400 group-hover:border-white' : 'border-game-primary group-hover:border-white transition-colors'}`}>
            {renderIcon(displayIconName, `!w-[70px] !h-[70px] ${reincarnationCount > 0 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-game-primary group-hover:text-white transition-colors'}`)}
          </div>
          <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-game-bg border px-4 py-1 rounded-full text-xs font-bold shadow-neon whitespace-nowrap flex items-center gap-1
            ${reincarnationCount > 0 ? 'border-yellow-400 text-yellow-400' : 'border-game-primary text-game-primary group-hover:text-white group-hover:border-white transition-colors'}`}>
            <ChevronUp size={14} /> Lv.{currentLevel} {displayName}
          </div>
        </button>
        
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
                     <div className={`absolute -bottom-2 -right-2 bg-[#111827] border border-current text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md
                       ${(item.awakened || 0) > 0 ? 'text-game-accent animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}
                     `}>
                       {(item.awakened || 0) > 0 ? `覚醒 Lv.${item.awakened}` : (item.upgradeLevel >= 4) ? 'MAX' : `Lv.${(item.upgradeLevel || 0) + 1}`}
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
                  return i.label === item.label && i.rarity === item.rarity;
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
                        const addedLevels = (consumeItem.upgradeLevel || 0) + 1;
                        return { ...i, upgradeLevel: (i.upgradeLevel || 0) + addedLevels };
                      }
                      return i;
                    }).filter(i => i.id !== consumeItem.id));
                  }
                };
                
                const displayName = item.label;

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
                       {/* Level Badge in Bottom-Right */}
                       <div className={`absolute -bottom-1 -right-1 bg-[#111827] border border-current text-[8px] font-bold px-1.5 py-0.5 rounded shadow-md
                         ${(item.awakened || 0) > 0 ? 'text-game-accent animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}
                       `}>
                         {(item.awakened || 0) > 0 ? `覚醒 Lv.${item.awakened}` : (item.upgradeLevel >= 4) ? 'MAX' : `Lv.${(item.upgradeLevel || 0) + 1}`}
                       </div>
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
                        const isGearCollection = item.type !== 'pet_entity' && ((item.upgradeLevel || 0) >= 4 || (item.awakened || 0) > 0 || item.rarity === 'god');
                        const isPetCollection = item.type === 'pet_entity' && ((item.upgradeLevel || 0) >= 4 || (item.awakened || 0) > 0 || item.rarity === 'god');
                        
                        return (isGearCollection || isPetCollection) && (
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
      {/* Avatar Management Modal */}
      {showAvatarModal && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-[#0d1424] z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
           {/* Top Bar */}
           <div className="flex items-center justify-between p-4 bg-game-surface border-b border-game-primary/30 shrink-0">
             <h3 className="font-bold text-lg text-game-primary flex items-center gap-2">
               <User /> アバター管理
             </h3>
             <button onClick={() => setShowAvatarModal(false)} className="p-1 rounded-md bg-red-500/20 text-red-400 active:scale-95">
               <X size={20} />
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto w-full max-w-sm mx-auto p-4 space-y-6 custom-scrollbar">
             
             {/* Current Avatar Header */}
             <div className="glass-panel p-6 flex flex-col items-center relative overflow-hidden">
                {reincarnationCount > 0 && <div className="absolute inset-0 bg-yellow-500/20 blur-xl animate-pulse pointer-events-none"></div>}
                <div className={`w-24 h-24 rounded-full border-4 shadow-neon flex items-center justify-center mb-3 relative z-10
                  ${reincarnationCount > 0 ? 'border-yellow-400 text-yellow-400 bg-yellow-500/10' : 'border-game-primary text-game-primary bg-[#111827]'}`}>
                   {renderIcon(displayIconName, '!w-[50px] !h-[50px]')}
                </div>
                <h2 className={`font-black tracking-widest text-xl mb-1 ${reincarnationCount > 0 ? 'text-yellow-400' : 'text-game-primary'}`}>
                  {displayName}
                </h2>
                <div className="text-[10px] text-gray-400 font-bold flex flex-col items-center">
                  <span>Lv.{currentLevel} / ATK: {(stats.atk + bonusATK).toLocaleString()}</span>
                  {reincarnationCount > 0 && <span className="text-yellow-400 mt-1">転生ボーナス: 全ステータス x{reincarnationCount + 1}</span>}
                </div>
             </div>

             {/* Reincarnation Section */}
             {currentLevel >= 100 && (
               <div className="glass-panel p-5 border-yellow-500/50 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent pointer-events-none"></div>
                 <h3 className="font-black text-yellow-400 mb-2 flex items-center gap-2">
                   <InfinityIcon size={16} /> 転生 (Lv.100 特権)
                 </h3>
                 <p className="text-[10px] text-gray-300 mb-4 leading-relaxed">
                   現在のレベルとステータス、装備品を全て初期化し、新たな生を受けます。<br/>
                   <span className="text-yellow-400 font-bold">恩恵：以降のステータス(クエスト等)倍率が永遠に x{reincarnationCount + 2} になります。専用スキン「覚醒者」も解放。</span>
                 </p>
                 <button onClick={handleReincarnate} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.5)] active:scale-95 transition-all">
                   転生する
                 </button>
               </div>
             )}

             {/* Evolution Tree */}
             <div>
               <h3 className="text-sm font-bold text-game-muted mb-3 flex items-center">
                 <span className="w-full h-px bg-game-surface/80 mr-3"></span> クラスチェンジ <span className="w-full h-px bg-game-surface/80 ml-3"></span>
               </h3>
               <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[23px] before:w-0.5 before:bg-game-surface">
                 {AVATAR_RANKS.map((rank, idx) => {
                    const isUnlocked = playerRank >= rank.id;
                    const isNext = playerRank === rank.id - 1;
                    const canEvolve = isNext && currentLevel >= rank.reqLevel && finalATK >= rank.reqAtk;
                    return (
                      <div key={rank.id} className={`relative flex gap-4 p-3 rounded-lg border ${isUnlocked ? 'bg-game-primary/10 border-game-primary/30' : isNext ? 'bg-game-surface border-game-primary/50' : 'bg-transparent border-gray-800'}`}>
                        {/* Node */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 z-10 transition-colors
                          ${isUnlocked ? 'bg-game-primary border-game-primary text-game-bg shadow-[0_0_10px_rgba(16,185,129,0.5)]' : isNext ? 'bg-[#111827] border-game-primary text-game-primary' : 'bg-[#111827] border-gray-800 text-gray-700'}
                        `}>
                           {renderIcon(rank.icon, `w-5 h-5 ${!isUnlocked ? 'brightness-0 invert-[0.3] opacity-80 drop-shadow-md' : ''}`)}
                        </div>
                        {/* Content */}
                        <div className="flex-1">
                          <h4 className={`font-bold text-sm ${isUnlocked ? 'text-game-primary' : isNext ? 'text-white' : 'text-gray-600'}`}>{rank.name}</h4>
                          {!isUnlocked && idx > 0 && (
                            <div className="text-[9px] text-gray-500 mt-1">
                              条件: Lv.{rank.reqLevel} 以上 / 最終ATK {rank.reqAtk.toLocaleString()} 以上
                            </div>
                          )}
                          {isNext && (
                            <button 
                              onClick={() => handleClassChange(rank)}
                              disabled={!canEvolve}
                              className={`mt-2 w-full py-2 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all ${
                                canEvolve 
                                 ? 'bg-game-primary text-black shadow-[0_0_10px_rgba(16,185,129,0.5)] active:scale-95' 
                                 : 'bg-game-surface text-gray-500 disabled:opacity-50'
                              }`}
                            >
                              {canEvolve ? <><Sparkles size={14} /> 進化する！</> : <><Lock size={14} /> 条件未達成</>}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                 })}
               </div>
             </div>

             {/* Skins */}
             <div className="pb-10">
               <h3 className="text-sm font-bold text-game-muted mb-3 flex items-center">
                 <span className="w-full h-px bg-game-surface/80 mr-3"></span> 限定スキン <span className="w-full h-px bg-game-surface/80 ml-3"></span>
               </h3>
               <div className="grid grid-cols-2 gap-3">
                 {/* Revert to default class */}
                 <button 
                   onClick={() => setActiveSkin(null)}
                   className={`glass-panel p-3 flex flex-col items-center justify-center gap-2 border-2 transition-all ${!activeSkin ? 'border-game-primary bg-game-primary/10' : 'border-transparent'}`}
                 >
                   <User size={24} className={!activeSkin ? "text-game-primary" : "text-gray-500"} />
                   <span className={`text-[10px] font-bold ${!activeSkin ? 'text-game-primary' : 'text-gray-400'}`}>デフォルト (クラス依存)</span>
                 </button>

                 {SKINS.map(skin => {
                   const statsPayload = { atk: stats.atk + bonusATK, hp: stats.hp + bonusHP };
                   const isUnlocked = skin.checkUnlock(statsPayload, currentLevel, reincarnationCount);
                   const isEquipped = activeSkin === skin.id;
                   return (
                     <button 
                       key={skin.id}
                       disabled={!isUnlocked}
                       onClick={() => setActiveSkin(skin.id)}
                       className={`glass-panel p-3 flex flex-col items-center justify-center gap-2 border-2 transition-all relative overflow-hidden
                         ${isEquipped ? 'border-game-accent bg-game-accent/10' : 'border-game-surface/50 hover:border-game-accent/50'}
                         ${!isUnlocked ? 'opacity-50 grayscale cursor-not-allowed border-dashed' : ''}
                       `}
                     >
                       {skin.id === 'awakened' && <div className="absolute inset-0 bg-yellow-500/10 pointer-events-none"></div>}
                       {renderIcon(skin.icon, `w-6 h-6 ${isEquipped ? 'text-game-accent animate-pulse' : isUnlocked ? 'text-white' : 'text-gray-600'}`)}
                       <span className={`text-[9px] font-bold text-center ${isEquipped ? 'text-game-accent' : isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                         {skin.name}
                       </span>
                       {!isUnlocked && <span className="text-[8px] text-red-400 mt-1 flex items-center gap-1"><Lock size={8}/> {skin.condition}</span>}
                       {isEquipped && <span className="text-[8px] bg-game-accent text-black px-1.5 py-0.5 rounded-sm absolute top-1 right-1 font-black">使用中</span>}
                     </button>
                   )
                 })}
               </div>
             </div>
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
