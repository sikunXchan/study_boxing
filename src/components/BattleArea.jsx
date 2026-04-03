import { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Square, Sword, Shield, Clock, Coins, Star, Skull, Ghost, Zap, AlertTriangle, ChevronUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { calculateLevelData, calculateMultiplier, AVATAR_RANKS, SKINS } from '../utils/level';
import { calculateTotalStats } from '../utils/statCalculator';

// 30 minutes in seconds
const DEFAULT_TIMER_SECONDS = 30 * 60;

// Victory chime using Web Audio API
function playVictoryChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [
      { freq: 523.25, start: 0, dur: 0.15 },    // C5
      { freq: 659.25, start: 0.15, dur: 0.15 },  // E5
      { freq: 783.99, start: 0.3, dur: 0.15 },   // G5
      { freq: 1046.50, start: 0.5, dur: 0.4 },   // C6 (sustained)
    ];
    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    });
    // Close context after playback
    setTimeout(() => ctx.close(), 2000);
  } catch (e) {
    console.warn('[Audio] Victory chime failed:', e);
  }
}

export default function BattleArea({ stats, setStats, resources, setResources, inventory, equippedItems, facilities, reincarnationCount, activeSkin, playerRank }) {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [accumulatedCoins, setAccumulatedCoins] = useState(0);
  const [hitEffects, setHitEffects] = useState([]);
  const [rewardResult, setRewardResult] = useState(null); // { type: 'complete' | 'retreat', coins: number }
  const [enemyHitEffect, setEnemyHitEffect] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const wakeLockRef = useRef(null);
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

  // Reward generation formula per second - Balanced for study incentives
  const coinsPerSec = Math.sqrt(finalATK) * 0.001 + 0.5; 

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

  // Wake Lock API: prevent sleep during focus mode
  useEffect(() => {
    const acquireWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('[WakeLock] Screen wake lock acquired');
          wakeLockRef.current.addEventListener('release', () => {
            console.log('[WakeLock] Screen wake lock released');
          });
        } catch (err) {
          console.warn('[WakeLock] Failed to acquire:', err.message);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          console.warn('[WakeLock] Failed to release:', err.message);
        }
      }
    };

    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        acquireWakeLock();
      }
    };

    if (isActive) {
      acquireWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);

  const handleRetreat = () => {
    setIsActive(false);
    // Give 20% penalty
    const earnedCoins = Math.floor(accumulatedCoins * 0.2);
    distributeRewards(earnedCoins);
    setRewardResult({ type: 'retreat', coins: earnedCoins });
  };

  const handleComplete = () => {
    setIsActive(false);
    playVictoryChime();
    const earnedCoins = Math.floor(accumulatedCoins);
    distributeRewards(earnedCoins);
    setRewardResult({ type: 'complete', coins: earnedCoins });
  };

  const distributeRewards = (coins) => {
    if (coins > 0) {
      setResources(prev => ({ ...prev, coins: prev.coins + coins }));
    }
  };

  const resetTimer = () => {
    setTimeLeft(DEFAULT_TIMER_SECONDS);
    setAccumulatedCoins(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      let elapsed = 0;
      interval = setInterval(() => {
        elapsed++;
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
        
        setAccumulatedCoins(c => c + coinsPerSec);

        // Enemy Attack every 4 seconds
        if (elapsed % 4 === 0) {
          const lossBase = 5;
          const ratio = finalATK / Math.max(1, finalHP);
          const actualLoss = Math.floor(lossBase * Math.min(20, ratio));
          
          if (actualLoss > 0) {
            setAccumulatedCoins(prev => Math.max(0, prev - actualLoss));
            setEnemyHitEffect(true);
            setTimeout(() => setEnemyHitEffect(false), 400);
          }
        }

        // Visual player hit effect (Damage reflects ATK)
        if (Math.random() > 0.4) {
          const newHit = {
            id: hitIdCounter.current++,
            x: 55 + Math.random() * 35,
            y: 25 + Math.random() * 45,
            damage: Math.floor(finalATK * (0.95 + Math.random() * 0.1))
          };
          setHitEffects(prev => [...prev.slice(-4), newHit]);

          // Skin-specific triggered effects
          if (activeSkinObj?.specialEffect === 'earthquake' && Math.random() > 0.6) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 300);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, coinsPerSec, finalATK, finalHP, activeSkinObj]);

  return (
    <div className="p-4 flex flex-col items-center h-full animate-in fade-in duration-300 relative">
      <h2 className="text-lg font-black text-game-accent tracking-widest uppercase flex items-center gap-2 mb-2">
        <Sword size={20} /> Auto Battle Focus <Sword size={20} />
      </h2>
      <p className="text-[10px] text-game-muted font-bold mb-6 text-center max-w-xs">
        集中して敵をなぎ倒しましょう！獲得コインは戦闘力に応じて増加します。
      </p>

      {/* Battle Scene */}
      <div className={`w-full max-w-sm h-48 bg-gray-900 border-2 border-game-surface rounded-xl mb-8 relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 ${isShaking ? 'animate-shake' : ''} ${enemyHitEffect ? 'ring-4 ring-red-500/50' : ''}`}>
        {/* Background elements */}
        <div className={`absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMWYyOTM3Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wLDBMODwsOFpNOCwwTDAsOFoiIHN0cm9rZT0iIzM3NDE1MSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] ${activeSkinObj?.id === 'overlord' ? 'invert sepia saturate-200 hue-rotate-[240deg]' : ''}`}></div>
        <div className={`absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent ${activeSkinObj?.id === 'demigod' ? 'from-sky-900/50' : ''}`}></div>

        {/* Special Aura Effects for Limited Skins */}
        {isActive && activeSkinObj?.specialEffect === 'aura_flare' && (
          <div className="absolute inset-0 bg-sky-400/5 animate-pulse flex items-center justify-center">
            <div className="w-full h-full border-4 border-sky-400/20 rounded-full animate-ping opacity-20"></div>
          </div>
        )}
        
        {isActive && activeSkinObj?.id === 'overlord' && (
          <div className="absolute inset-0 bg-purple-900/10 mix-blend-overlay"></div>
        )}

        {/* Player Character Container */}
        <div className="absolute left-8 bottom-8 flex flex-col items-center">
          <div className={`relative ${isActive ? 'animate-bounce' : ''}`}>
             
             {/* Character Base */}
             <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 shadow-[0_0_15px_rgba(var(--game-primary-rgb),0.5)] 
               ${reincarnationCount > 0 ? 'border-yellow-400 bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-[#111827] border-game-primary'}
               ${enemyHitEffect ? 'animate-wiggle bg-red-900/40 border-red-500' : ''}
               ${activeSkinObj?.id === 'overlord' ? 'shadow-[0_0_25px_rgba(168,85,247,0.8)] border-purple-500' : ''}`}>
               {renderIcon(displayIconName, `!w-[28px] !h-[28px] ${activeSkinObj?.id === 'overlord' ? 'text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,1)]' : reincarnationCount > 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-game-primary'}`)}
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
          <div className={`absolute right-4 bottom-8 flex gap-4 animate-slide-left opacity-80 ${enemyHitEffect ? 'scale-125 transition-transform translate-x-[-20px]' : ''}`}>
            <Ghost className={`${activeSkinObj?.id === 'overlord' ? 'text-blue-200' : 'text-red-400'}`} size={32} />
            <Skull className={`${activeSkinObj?.id === 'overlord' ? 'text-purple-300' : 'text-purple-400'}`} size={28} />
          </div>
        )}

        {/* Enemy Coin-Steal Alert */}
        {enemyHitEffect && (
          <div className="absolute left-8 top-12 z-50 flex flex-col items-center animate-bounce">
            <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
              <AlertTriangle size={12} /> COIN LOSS!
            </div>
          </div>
        )}

        {/* Hit Effects */}
        {hitEffects.map(hit => (
          <div 
            key={hit.id} 
            className={`absolute font-black text-sm lg:text-base animate-damage-float z-50 flex items-center pointer-events-none transition-all
              ${activeSkinObj?.id === 'valkyrie' ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,1)] scale-125' : 
                activeSkinObj?.id === 'behemoth' ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,1)] scale-110' :
                activeSkinObj?.id === 'overlord' ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,1)] scale-150' : 
                'text-red-500 drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]'}`}
            style={{ left: `${hit.x}%`, top: `${hit.y}%`, textShadow: '2px 2px 0px #000' }}
          >
            {activeSkinObj?.id === 'valkyrie' ? <LucideIcons.Zap size={14} className="mr-1 fill-yellow-400" /> : <Zap size={14} className="mr-1" />}
            {hit.damage.toLocaleString()}
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
      <div className="text-6xl font-black text-game-primary mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(var(--game-primary-rgb),0.4)]">
        {formatTime(timeLeft)}
      </div>

      {/* Projected Rewards */}
      <div className="flex gap-6 mb-8 bg-game-surface px-6 py-3 rounded-xl border border-game-muted/30">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold mb-1">獲得予定コイン</span>
          <span className="text-yellow-400 font-black flex items-center gap-1 text-lg">
            <Coins size={16} /> {Math.floor(accumulatedCoins).toLocaleString()}
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

       {/* Reward Result Overlay */}
       {rewardResult && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"></div>
           <div className="glass-panel p-8 w-full max-w-sm border-game-primary/50 relative z-10 animate-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col items-center text-center">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-neon border-2 ${rewardResult.type === 'complete' ? 'bg-game-primary/20 border-game-primary text-game-primary' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                {rewardResult.type === 'complete' ? <Zap size={40} /> : <AlertTriangle size={40} />}
             </div>
             
             <h2 className={`text-2xl font-black mb-2 tracking-tight ${rewardResult.type === 'complete' ? 'text-game-primary' : 'text-red-400'}`}>
               {rewardResult.type === 'complete' ? 'MISSION COMPLETE!' : 'RETREATED...'}
             </h2>
             
             <p className="text-gray-400 text-sm mb-6 text-xs lg:text-sm">
               {rewardResult.type === 'complete' ? '素晴らしい集中力でした。お疲れ様です！' : 'やむを得ず撤退しました。次回は完走を目指しましょう！'}
             </p>

             <div className="grid grid-cols-1 gap-3 w-full mb-8">
               <div className="bg-[#111827] border border-game-surface p-4 rounded-xl flex flex-col items-center shadow-neon">
                 <Coins className="text-[#fbbf24] mb-1" size={32} />
                 <span className="text-sm text-game-muted font-bold">COINS</span>
                 <span className="text-3xl font-black text-white">+{rewardResult.coins.toLocaleString()}</span>
               </div>
             </div>

             <button 
               onClick={() => {
                 setRewardResult(null);
                 resetTimer();
               }}
               className={`w-full py-4 text-black font-black rounded-xl shadow-neon active:scale-95 transition-all ${rewardResult.type === 'complete' ? 'bg-game-primary' : 'bg-red-400'}`}
             >
               ベース画面へ
             </button>
           </div>
         </div>
       )}
    </div>
  );
}
