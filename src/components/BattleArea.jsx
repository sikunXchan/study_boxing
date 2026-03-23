import { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Square, Sword, Shield, Clock, Coins, Star, Skull, Ghost, Zap } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { calculateLevelData, calculateMultiplier, AVATAR_RANKS, SKINS } from '../utils/level';
import { calculateTotalStats } from '../utils/statCalculator';

// 30 minutes in seconds
const DEFAULT_TIMER_SECONDS = 30 * 60;

export default function BattleArea({ stats, setStats, resources, setResources, inventory, equippedItems, facilities, reincarnationCount, activeSkin, playerRank }) {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [accumulatedCoins, setAccumulatedCoins] = useState(0);
  const [accumulatedExp, setAccumulatedExp] = useState(0);
  const [hitEffects, setHitEffects] = useState([]);
  const hitIdCounter = useRef(0);

  // Compute stats
  const { bonusATK, bonusHP, activePet } = useMemo(() => calculateTotalStats(inventory, equippedItems, facilities, reincarnationCount), [equippedItems, inventory, facilities, reincarnationCount]);
  const baseExp = stats.atk + stats.hp;
  const { currentLevel } = useMemo(() => calculateLevelData(baseExp), [baseExp]);
  
  // Avatar Management Data
  const currentRankObj = AVATAR_RANKS.find(r => r.id === playerRank) || AVATAR_RANKS[0];
  const activeSkinObj = activeSkin ? SKINS.find(s => s.id === activeSkin) : null;
  const displayIconName = activeSkinObj ? activeSkinObj.icon : currentRankObj.icon;
  const multiplier = useMemo(() => calculateMultiplier(currentLevel), [currentLevel]);
  const finalATK = Math.floor((stats.atk + bonusATK) * multiplier);
  const finalHP = Math.floor((stats.hp + bonusHP) * multiplier);
  const combatPower = finalATK + finalHP;

  // Reward generation formula per second
  const coinsPerSec = Math.pow(combatPower, 0.15) * 0.15;
  const expPerSec = coinsPerSec / 5;

  // Get currently equipped items for visual
  const getEquipped = (type) => inventory.find(i => i.id === equippedItems[type]);
  const equippedWeapon = getEquipped('weapon');
  const equippedArmor = getEquipped('armor');
  const equippedNecklace = getEquipped('necklace');
  const equippedGloves = getEquipped('gloves');
  const equippedBelt = getEquipped('belt');
  const equippedBoots = getEquipped('boots');
  const equippedCollar = getEquipped('collar');
  const equippedToy = getEquipped('toy');

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'god': return 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]';
      case 'legendary': return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]';
      case 'epic': return 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]';
      case 'rare': return 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]';
      case 'uncommon': return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]';
      default: return 'text-gray-400';
    }
  };

  const renderIcon = (iconName, className) => {
    if (!iconName) return null;
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <IconComponent className={className} size={32} />;
  };



  const handleStart = () => {
    setIsActive(true);
  };

  const handleRetreat = () => {
    setIsActive(false);
    // Give 20% penalty
    const earnedCoins = Math.floor(accumulatedCoins * 0.2);
    const earnedExp = Math.floor(accumulatedExp * 0.2);
    distributeRewards(earnedCoins, earnedExp);
    resetTimer();
    alert(`途中撤退しました... ペナルティとして獲得量の20%のみ持ち帰ります。\n獲得コイン: ${earnedCoins}\n獲得EXP: ${earnedExp}`);
  };

  const handleComplete = () => {
    setIsActive(false);
    const earnedCoins = Math.floor(accumulatedCoins);
    const earnedExp = Math.floor(accumulatedExp);
    distributeRewards(earnedCoins, earnedExp);
    resetTimer();
    alert(`集中完了！お疲れ様でした！！\n獲得コイン: ${earnedCoins}\n獲得EXP: ${earnedExp}`);
  };

  const distributeRewards = (coins, exp) => {
    if (coins > 0) {
      setResources(prev => ({ ...prev, coins: prev.coins + coins }));
    }
    if (exp > 0) {
      const isAtk = Math.random() > 0.5;
      setStats(prev => ({
        ...prev,
        atk: prev.atk + (isAtk ? exp : 0),
        hp: prev.hp + (!isAtk ? exp : 0)
      }));
    }
  };

  const resetTimer = () => {
    setTimeLeft(DEFAULT_TIMER_SECONDS);
    setAccumulatedCoins(0);
    setAccumulatedExp(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
        setAccumulatedCoins(c => c + coinsPerSec);
        setAccumulatedExp(e => e + expPerSec);

        // Visual hit effect
        if (Math.random() > 0.4) {
          const newHit = {
            id: hitIdCounter.current++,
            x: 60 + Math.random() * 30,
            y: 20 + Math.random() * 60,
            damage: Math.floor(finalATK * (0.8 + Math.random() * 0.4))
          };
          setHitEffects(prev => [...prev.slice(-4), newHit]);
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleComplete();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, coinsPerSec, expPerSec, finalATK, handleComplete]);

  return (
    <div className="p-4 flex flex-col items-center h-full animate-in fade-in duration-300">
      <h2 className="text-lg font-black text-game-accent tracking-widest uppercase flex items-center gap-2 mb-2">
        <Sword size={20} /> Auto Battle Focus <Sword size={20} />
      </h2>
      <p className="text-[10px] text-gray-400 text-center mb-6">
        スマホを触らずに集中する時間。<br/>
        あなたのATKとHPの合計値が高いほど、時間内に多くの敵を倒し報酬が増えます。<br/>
        <span className="text-red-400">※途中で止めた場合は報酬が20%に激減します</span>
      </p>

      {/* Battle Scene */}
      <div className="w-full max-w-sm h-48 bg-gray-900 border-2 border-game-surface rounded-xl mb-8 relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMWYyOTM3Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wLDBMODwsOFpNOCwwTDAsOFoiIHN0cm9rZT0iIzM3NDE1MSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')]"></div>
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent"></div>

        {/* Player Character Container */}
        <div className="absolute left-8 bottom-8 flex flex-col items-center">
          <div className={`relative ${isActive ? 'animate-bounce' : ''}`}>
             
             {/* Character Base */}
             <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)] 
               ${reincarnationCount > 0 ? 'border-yellow-400 bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-[#111827] border-game-primary'}`}>
               {renderIcon(displayIconName, `!w-[28px] !h-[28px] ${reincarnationCount > 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-game-primary'}`)}
             </div>

             {/* Armor (Back/Body) overlay */}
             {equippedArmor && (
               <div className="absolute inset-0 flex items-center justify-center opacity-40 z-0 scale-125 pointer-events-none">
                 {renderIcon(equippedArmor.iconName, getRarityColor(equippedArmor.rarity))}
               </div>
             )}

             {/* Weapon Overlay */}
             {equippedWeapon && (
               <div className={`absolute -right-8 top-1 w-10 h-10 z-20 ${isActive ? 'animate-spin-slow' : ''}`}>
                 {renderIcon(equippedWeapon.iconName, getRarityColor(equippedWeapon.rarity))}
               </div>
             )}
             
             {/* Necklace Overlay (Top Center) */}
             {equippedNecklace && (
               <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 z-20 opacity-90 animate-pulse">
                 {renderIcon(equippedNecklace.iconName, getRarityColor(equippedNecklace.rarity))}
               </div>
             )}

             {/* Gloves Overlay (Sides) */}
             {equippedGloves && (
               <>
                 <div className={`absolute -left-3 top-4 w-5 h-5 z-20 opacity-80 ${isActive ? 'animate-bounce' : ''}`}>
                   {renderIcon(equippedGloves.iconName, getRarityColor(equippedGloves.rarity))}
                 </div>
                 <div className={`absolute -right-3 top-4 w-5 h-5 z-20 opacity-80 ${isActive ? 'animate-bounce' : ''}`}>
                   {renderIcon(equippedGloves.iconName, getRarityColor(equippedGloves.rarity))}
                 </div>
               </>
             )}

             {/* Belt Overlay (Bottom Center) */}
             {equippedBelt && (
               <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 z-20 opacity-90">
                 {renderIcon(equippedBelt.iconName, getRarityColor(equippedBelt.rarity))}
               </div>
             )}

             {/* Boots Overlay (Bottom corners) */}
             {equippedBoots && (
               <>
                 <div className={`absolute -bottom-4 -left-2 w-5 h-5 z-0 opacity-80 ${isActive ? 'animate-bounce' : ''}`}>
                   {renderIcon(equippedBoots.iconName, getRarityColor(equippedBoots.rarity))}
                 </div>
                 <div className={`absolute -bottom-4 -right-2 w-5 h-5 z-0 opacity-80 ${isActive ? 'animate-bounce' : ''}`}>
                   {renderIcon(equippedBoots.iconName, getRarityColor(equippedBoots.rarity))}
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Active Pet Container */}
        {/* Active Pet Container */}
        {activePet && (
          <div className={`absolute left-24 bottom-16 w-8 h-8 z-10 ${isActive ? 'animate-float' : ''}`}>
            <div className="relative w-full h-full">
               {/* Pet Base */}
               {renderIcon(activePet.iconName, getRarityColor(activePet.rarity))}
               
               {/* Pet Collar */}
               {equippedCollar && (
                 <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-5 z-20 opacity-90">
                   {renderIcon(equippedCollar.iconName, getRarityColor(equippedCollar.rarity))}
                 </div>
               )}
               {/* Pet Toy */}
               {equippedToy && (
                 <div className={`absolute -top-3 -right-3 w-5 h-5 z-20 opacity-80 ${isActive ? 'animate-spin-slow' : ''}`}>
                   {renderIcon(equippedToy.iconName, getRarityColor(equippedToy.rarity))}
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Enemies (only when active) */}
        {isActive && (
          <div className="absolute right-4 bottom-8 flex gap-4 animate-slide-left opacity-80">
            <Ghost className="text-red-400" size={32} />
            <Skull className="text-purple-400" size={28} />
          </div>
        )}

        {/* Hit Effects */}
        {hitEffects.map(hit => (
          <div 
            key={hit.id} 
            className="absolute text-red-500 font-black text-xs animate-damage-float drop-shadow-md z-20 flex items-center"
            style={{ left: `${hit.x}%`, top: `${hit.y}%` }}
          >
            <Zap size={10} className="mr-0.5" />{hit.damage.toLocaleString()}
          </div>
        ))}
        
        {/* Status indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
           <span className="text-[9px] font-bold text-gray-400 bg-black/50 px-1.5 py-0.5 rounded flex items-center gap-1">
             <Sword size={10}/> {combatPower.toLocaleString()}
           </span>
        </div>
      </div>

      {/* Timer */}
      <div className="text-6xl font-black text-game-primary mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
        {formatTime(timeLeft)}
      </div>

      {/* Projected Rewards */}
      <div className="flex gap-6 mb-8 bg-game-surface px-6 py-3 rounded-xl border border-game-muted/30">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold mb-1">獲得予定コイン</span>
          <span className="text-yellow-400 font-black flex items-center gap-1">
            <Coins size={14} /> {Math.floor(accumulatedCoins).toLocaleString()}
          </span>
        </div>
        <div className="w-px bg-game-muted/30"></div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold mb-1">獲得予定 EXP</span>
          <span className="text-blue-400 font-black flex items-center gap-1">
            <Star size={14} /> {Math.floor(accumulatedExp).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-xs flex gap-4">
        {!isActive ? (
          <button 
            onClick={handleStart}
            className="flex-1 bg-game-primary/20 border-2 border-game-primary text-game-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-game-primary/30 transition-all active:scale-95 shadow-neon"
          >
            <Play size={20} /> 集中を開始する
          </button>
        ) : (
          <button 
            onClick={handleRetreat}
            className="flex-1 bg-red-500/10 border-2 border-red-500 text-red-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            <Square size={20} /> 途中撤退する
          </button>
        )}
      </div>
    </div>
  );
}
