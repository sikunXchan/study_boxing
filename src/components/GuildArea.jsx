import { useState, useRef, useEffect, useMemo } from 'react';
import { Target, CheckCircle2, Plus, Bell, X, Flag, ChevronRight, Trash2, Gem as GemIcon, BookOpen, Dumbbell, Vault, Skull, HeartPulse, Zap, Ghost, Coins, Swords, Crown, Trophy, Gift, Flame, Shield } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateLevelData, calculateMultiplier } from '../utils/level';
import { calculateTotalStats } from '../utils/statCalculator';

export default function GuildArea({ resources, stats, setStats, setResources, inventory, setInventory, equippedItems, facilities = {}, setFacilities, badHabits = [], setBadHabits, reincarnationCount }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestReward, setNewQuestReward] = useState('atk');

  const [activeQuestIds, useState_activeQuestIds] = useState([]);
  const setActiveQuestIds = useState_activeQuestIds;
  
  const [isPetHuntMode, setIsPetHuntMode] = useLocalStorage('gemini_survivor_pethunt', false);
  
  // Pet Drop Modal states
  const [isPetPulling, setIsPetPulling] = useState(null);
  const [petResult, setPetResult] = useState(null);

  // Gem Bonus Animation state
  const [gemNotification, setGemNotification] = useState(null);
  
  // Swipe to delete state
  const [swipedQuestId, setSwipedQuestId] = useState(null);
  const touchStartX = useRef(0);

  const [activeGuildTab, setActiveGuildTab] = useState('quests'); // 'quests', 'epic', 'facilities', 'defense'

  // === EPIC QUEST STATE ===
  const [epicQuests, setEpicQuests] = useLocalStorage('gemini_survivor_epic_quests', []);
  const [isCreatingEpic, setIsCreatingEpic] = useState(false);
  const [newEpicTitle, setNewEpicTitle] = useState('');
  const [newEpicChildren, setNewEpicChildren] = useState(['', '']);
  const [epicDamageEffect, setEpicDamageEffect] = useState(null); // { id, atk }
  const [epicShatterIndex, setEpicShatterIndex] = useState(null); // { questId, childIndex }
  const [epicBossExploding, setEpicBossExploding] = useState(null); // questId
  const [epicRewardResult, setEpicRewardResult] = useState(null); // { title, gems, coins }
  const [epicScreenFlash, setEpicScreenFlash] = useState(false);

  // Calculate finalATK for damage display (same formula as BattleArea)
  const { bonusATK, bonusHP } = useMemo(
    () => calculateTotalStats(inventory, equippedItems, facilities, reincarnationCount),
    [equippedItems, inventory, facilities, reincarnationCount]
  );
  const baseExp = (stats?.atk || 0) + (stats?.hp || 0);
  const { currentLevel } = useMemo(() => calculateLevelData(baseExp), [baseExp]);
  const multiplier = useMemo(() => calculateMultiplier(currentLevel), [currentLevel]);
  const playerFinalATK = Math.floor(((stats?.atk || 0) + bonusATK) * multiplier);

  const BOSS_HP_COLORS = [
    { bg: 'from-red-600 to-red-400', border: 'border-red-500', label: 'text-red-400' },
    { bg: 'from-yellow-600 to-yellow-400', border: 'border-yellow-500', label: 'text-yellow-400' },
    { bg: 'from-green-600 to-green-400', border: 'border-green-500', label: 'text-green-400' },
    { bg: 'from-blue-600 to-blue-400', border: 'border-blue-500', label: 'text-blue-400' },
    { bg: 'from-purple-600 to-purple-400', border: 'border-purple-500', label: 'text-purple-400' },
    { bg: 'from-pink-600 to-pink-400', border: 'border-pink-500', label: 'text-pink-400' },
    { bg: 'from-cyan-600 to-cyan-400', border: 'border-cyan-500', label: 'text-cyan-400' },
    { bg: 'from-orange-600 to-orange-400', border: 'border-orange-500', label: 'text-orange-400' },
  ];

  // Defense Battle State
  const [newHabitName, setNewHabitName] = useState('');
  const getRarityStyle = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'text-game-accent drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] border-game-accent';
      case 'epic': return 'text-game-secondary drop-shadow-[0_0_15px_rgba(139,92,246,0.8)] border-game-secondary';
      case 'rare': return 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] border-blue-500';
      case 'uncommon': return 'text-game-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] border-game-primary';
      case 'normal': 
      default: return 'text-gray-300 border-game-muted';
    }
  };

  const getRarityName = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'LEGENDARY';
      case 'epic': return 'EPIC';
      case 'rare': return 'RARE';
      case 'uncommon': return 'UNCOMMON';
      case 'normal': return 'NORMAL';
      default: return 'NORMAL';
    }
  };

  const renderIcon = (iconName, className) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <IconComponent className={className} size={64} />;
  };
  
  const [customQuests, setCustomQuests] = useLocalStorage('gemini_survivor_quests', [
    { id: 'q1', title: '英単語 100個暗記', type: 'atk', rewardExp: 150, rewardCoins: 600 },
    { id: 'q2', title: 'スクワット 30回', type: 'hp', rewardExp: 100, rewardCoins: 600 },
  ]);



  // Determine Active Passives from equipped items
  const activePassives = [];
  if (equippedItems && inventory) {
    Object.values(equippedItems).forEach(itemId => {
      const item = inventory.find(i => i.id === itemId);
      if (item && item.passive) activePassives.push(item.passive);
    });
  }

  const handleAddQuest = (e) => {
    e.preventDefault();
    if (!newQuestTitle.trim()) return;
    
    const newQuest = {
      id: Date.now().toString(),
      title: newQuestTitle,
      type: newQuestReward,
      rewardExp: 150, 
      rewardCoins: 600,
    };
    
    setCustomQuests([...customQuests, newQuest]);
    setNewQuestTitle('');
    setIsCreating(false);
  };

  const handleQuestAction = (quest) => {
    if (activeQuestIds.includes(quest.id)) {
      setActiveQuestIds(activeQuestIds.filter(id => id !== quest.id));
      setCustomQuests(customQuests.filter(q => q.id !== quest.id));
      
      // Apply Passive Skill EXP Multipliers
      let expMultiplier = 1;
      if (quest.type === 'atk' && activePassives.includes('efficient_learning')) expMultiplier += 0.2;
      if (quest.type === 'hp' && activePassives.includes('super_recovery')) expMultiplier += 0.2;
      if (activePassives.includes('bunbu_ryodo')) expMultiplier += 0.2;
      if (activePassives.includes('tenma_guide')) expMultiplier += 0.3;
      
      // Pet Hunt Mode sets EXP multiplier to 50%
      if (isPetHuntMode) {
        expMultiplier *= 0.5;
      }
      
      // Apply Facility Bonus for EXP
      const libraryBonus = 1 + (facilities.library || 0) * 0.05;
      const finalExp = Math.max(1, Math.floor(quest.rewardExp * expMultiplier * libraryBonus));

      if (quest.type === 'atk') {
        setStats(prev => ({ ...prev, atk: prev.atk + finalExp }));
      } else {
        setStats(prev => ({ ...prev, hp: prev.hp + finalExp }));
      }
      
      // Apply Passive Skill Drop Rate
      let dropRate = 0.1;
      if (activePassives.includes('golden_spirit_15')) dropRate = 0.15;
      if (activePassives.includes('golden_spirit_25')) dropRate = 0.25;
      if (activePassives.includes('tenma_guide')) dropRate = 0.40;

      let bonusGems = 0;
      if (Math.random() < dropRate) {
        bonusGems = 600;
        setGemNotification({ id: Date.now(), amount: 600 });
        setTimeout(() => setGemNotification(null), 3000);
      }

      // Apply Facility Bonus for Coins
      const vaultBonus = 1 + (facilities.vault || 0) * 0.05;

      setResources(prev => ({ 
        ...prev, 
        coins: prev.coins + Math.floor(quest.rewardCoins * vaultBonus),
        gems: prev.gems + bonusGems
      }));

      // Base 5% Chance, Pet Hunt mode makes it 20%
      const petDropChance = isPetHuntMode ? 0.20 : 0.05;
      
      if (Math.random() < petDropChance) {
        import('../data/items').then(({ GACHA_POOL }) => {
          const petPool = GACHA_POOL.filter(i => i.type === 'pet_entity');
          const totalWeight = petPool.reduce((sum, item) => sum + item.weight, 0);
          let randomNum = Math.random() * totalWeight;
          let drawnPet = petPool[0]; 
          
          for (const item of petPool) {
            if (randomNum < item.weight) {
              drawnPet = item;
              break;
            }
            randomNum -= item.weight;
          }

          const newPetInstance = {
            ...drawnPet,
            id: `pet_drop_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            upgradeLevel: 0
          };

          // Trigger intense visual FX sequence for Pet Catch
          setIsPetPulling(drawnPet.rarity);
          
          setTimeout(() => {
            setIsPetPulling(null);
            setInventory(prev => [...prev, newPetInstance]);
            setPetResult(newPetInstance);
          }, 1500);
        });
      }
    } else {
      setActiveQuestIds([...activeQuestIds, quest.id]);
    }
  };

  const handleDeleteQuest = (questId) => {
    setCustomQuests(customQuests.filter(q => q.id !== questId));
    setSwipedQuestId(null);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e, questId) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) {
      setSwipedQuestId(questId);
    } else if (diff < -50) {
      setSwipedQuestId(null);
    }
  };

  const getDisplayedExp = (baseExp, type) => {
    let expMultiplier = 1;
    if (type === 'atk' && activePassives.includes('efficient_learning')) expMultiplier = 1.2;
    if (type === 'hp' && activePassives.includes('super_recovery')) expMultiplier = 1.2;
    return Math.floor(baseExp * expMultiplier);
  };

  const dropRateText = activePassives.includes('golden_spirit') ? '25%' : '10%';

  // Defense Result Overlay state
  const [defenseResult, setDefenseResult] = useState(null); // { type: 'victory' | 'defeat', name: string, coins?: number, gems?: number }
  const [upgradeToast, setUpgradeToast] = useState(null);

  // --- Handlers for Facilities ---
  const handleUpgradeFacility = (facilityId) => {
    const currentLv = facilities[facilityId] || 0;
    const cost = Math.floor(1000 * Math.pow(1.5, currentLv));
    
    if (resources.coins >= cost) {
      setFacilities(f => ({ ...f, [facilityId]: currentLv + 1 }));
      setResources(prev => ({ ...prev, coins: prev.coins - cost }));
    } else {
      setUpgradeToast('コインが足りません！');
      setTimeout(() => setUpgradeToast(null), 2000);
    }
  };

  // --- Handlers for Defense Battle ---
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    setBadHabits(prev => [...prev, {
      id: Date.now().toString(),
      name: newHabitName,
      level: 1,
      maxHp: 100,
      currentHp: 100,
      streak: 0
    }]);
    setNewHabitName('');
  };

  const handleHabitEndured = (habitId) => {
    setBadHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const damage = 30; // Fixed damage per endure
        const nextHp = h.currentHp - damage;
        if (nextHp <= 0) {
           const rewardCoins = 2000 * h.level;
           const rewardGems = 10 * h.level;
           
           setResources(r => ({
              ...r,
              coins: r.coins + rewardCoins,
              gems: r.gems + rewardGems
           }));
           
           setDefenseResult({ 
             type: 'victory', 
             name: h.name, 
             coins: rewardCoins, 
             gems: rewardGems 
           });
           
           return { ...h, level: h.level + 1, maxHp: h.maxHp + 50, currentHp: h.maxHp + 50, streak: h.streak + 1 };
        }
        return { ...h, currentHp: nextHp, streak: h.streak + 1 };
      }
      return h;
    }));
  };

  const handleHabitYielded = (habitId) => {
    setBadHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        setResources(r => ({
           ...r,
           coins: Math.max(0, r.coins - 500)
        }));
        
        setDefenseResult({ 
          type: 'defeat', 
          name: h.name,
          penalty: 500
        });
        
        return { ...h, streak: 0, currentHp: Math.min(h.maxHp, h.currentHp + Math.floor(h.maxHp * 0.2)) };
      }
      return h;
    }));
  };

  const handleDeleteHabit = (habitId) => {
    setBadHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // === EPIC QUEST HANDLERS ===
  const handleAddEpicQuest = (e) => {
    e.preventDefault();
    if (!newEpicTitle.trim()) return;
    const validChildren = newEpicChildren.filter(c => c.trim());
    if (validChildren.length < 1) return;

    const newEpic = {
      id: Date.now().toString(),
      title: newEpicTitle,
      children: validChildren.map((c, i) => ({
        id: `${Date.now()}_child_${i}`,
        title: c,
        completed: false,
      })),
    };
    setEpicQuests([...epicQuests, newEpic]);
    setNewEpicTitle('');
    setNewEpicChildren(['', '']);
    setIsCreatingEpic(false);
  };

  const handleEpicChildComplete = (questId, childId) => {
    const quest = epicQuests.find(q => q.id === questId);
    if (!quest) return;
    const childIndex = quest.children.findIndex(c => c.id === childId);
    if (childIndex === -1 || quest.children[childIndex].completed) return;

    // Trigger damage effect + screen flash + shake
    setEpicDamageEffect({ id: Date.now(), atk: playerFinalATK });
    setEpicScreenFlash(true);
    setEpicShatterIndex({ questId, childIndex });

    setTimeout(() => setEpicScreenFlash(false), 500);
    setTimeout(() => setEpicDamageEffect(null), 1800);
    setTimeout(() => setEpicShatterIndex(null), 1000);

    // Update quest data
    const updatedQuests = epicQuests.map(q => {
      if (q.id !== questId) return q;
      const updatedChildren = q.children.map(c =>
        c.id === childId ? { ...c, completed: true } : c
      );
      return { ...q, children: updatedChildren };
    });
    setEpicQuests(updatedQuests);

    // Small reward per child
    const childRewardCoins = 300;
    const childRewardExp = 80;
    setResources(prev => ({ ...prev, coins: prev.coins + childRewardCoins }));
    setStats(prev => ({ ...prev, atk: prev.atk + childRewardExp }));

    // Check if ALL children complete = boss defeated
    const updatedQuest = updatedQuests.find(q => q.id === questId);
    if (updatedQuest && updatedQuest.children.every(c => c.completed)) {
      // Boss defeat after shatter finishes
      setTimeout(() => {
        setEpicBossExploding(questId);
        // After explosion, show reward
        setTimeout(() => {
          setEpicBossExploding(null);
          const rewardGems = 1500;
          const rewardCoins = 5000;
          setResources(prev => ({
            ...prev,
            gems: prev.gems + rewardGems,
            coins: prev.coins + rewardCoins,
          }));
          setEpicRewardResult({
            title: updatedQuest.title,
            gems: rewardGems,
            coins: rewardCoins,
            childCount: updatedQuest.children.length,
          });
          // Remove from list
          setEpicQuests(prev => prev.filter(q => q.id !== questId));
        }, 1500);
      }, 800);
    }
  };

  const handleDeleteEpicQuest = (questId) => {
    setEpicQuests(epicQuests.filter(q => q.id !== questId));
  };



  return (
    <div className="p-4 h-full flex flex-col animate-in slide-in-from-right duration-300 relative">
      
      <div className="flex items-center justify-between mb-2 pt-2">
        <h2 className="text-xl font-black italic tracking-wider filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          GUILD HALL
        </h2>
        
        {activeGuildTab === 'quests' && (
          <button 
            onClick={() => setIsPetHuntMode(!isPetHuntMode)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5 shadow-md hover:scale-105 ${
              isPetHuntMode 
                ? 'bg-game-accent/20 border-game-accent text-game-accent shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse' 
                : 'bg-[#111827] border-game-surface text-gray-500 hover:border-game-muted'
            }`}
          >
            <Target size={12} />
            {isPetHuntMode ? 'ペット探索モード (ON)' : 'ペット探索モード (OFF)'}
          </button>
        )}
      </div>

      {/* TABS Navigation */}
      <div className="flex bg-[#111827] rounded-lg p-1 mb-4 border border-game-surface">
        <button 
          onClick={() => setActiveGuildTab('quests')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeGuildTab === 'quests' ? 'bg-game-surface text-white shadow-sm' : 'text-gray-500'}`}
        >
          <Flag size={12}/> クエスト
        </button>
        <button 
          onClick={() => setActiveGuildTab('epic')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeGuildTab === 'epic' ? 'bg-red-500/30 text-red-400 shadow-sm shadow-red-500/20' : 'text-gray-500'}`}
        >
          <Swords size={12}/> エピック
        </button>
        <button 
          onClick={() => setActiveGuildTab('facilities')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeGuildTab === 'facilities' ? 'bg-game-surface text-white shadow-sm' : 'text-gray-500'}`}
        >
          <BookOpen size={12}/> 施設
        </button>
        <button 
          onClick={() => setActiveGuildTab('defense')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeGuildTab === 'defense' ? 'bg-game-surface text-white shadow-sm' : 'text-gray-500'}`}
        >
          <Skull size={12}/> 防衛戦
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-20 pr-1 custom-scrollbar">
        {activeGuildTab === 'quests' && (
          <>
            {!isCreating ? (
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-4 border-2 border-dashed border-game-surface rounded-xl text-game-muted font-bold flex items-center justify-center gap-2 hover:border-game-primary hover:text-game-primary hover:bg-game-primary/5 transition-all"
              >
                <Plus size={20} /> ＋新しいクエストを作成
              </button>
            ) : (
              <form onSubmit={handleAddQuest} className="glass-panel p-4 border-game-primary/50 relative">
                <button type="button" onClick={() => setIsCreating(false)} className="absolute top-2 right-2 text-game-muted hover:text-white">
                  <X size={16} />
                </button>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Flag size={14} className="text-game-primary" /> クエスト発行</h3>
                
                <input 
                  type="text" 
                  value={newQuestTitle}
                  onChange={(e) => setNewQuestTitle(e.target.value)}
                  placeholder="クエストの名前を入力..." 
                  className="w-full bg-[#111827] border border-game-surface text-white p-2 rounded mb-3 text-sm focus:outline-none focus:border-game-primary"
                  autoFocus
                />
                
                <div className="flex gap-2 mb-4">
                  <label className={`flex-1 flex items-center justify-center p-2 rounded border cursor-pointer ${newQuestReward === 'atk' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[#111827] border-game-surface text-gray-500'}`}>
                    <input type="radio" value="atk" checked={newQuestReward === 'atk'} onChange={(e) => setNewQuestReward(e.target.value)} className="hidden" />
                    ATK 成長 (EXP)
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-2 rounded border cursor-pointer ${newQuestReward === 'hp' ? 'bg-game-primary/20 border-game-primary text-game-primary' : 'bg-[#111827] border-game-surface text-gray-500'}`}>
                    <input type="radio" value="hp" checked={newQuestReward === 'hp'} onChange={(e) => setNewQuestReward(e.target.value)} className="hidden" />
                    HP 成長 (EXP)
                  </label>
                </div>
                
                <p className="text-[10px] text-game-muted mb-3 text-center">完了報酬: EXP +150 / 💰 600 コイン</p>

                <button type="submit" className="w-full bg-game-primary text-[#111827] font-black py-2 rounded flex items-center justify-center gap-1 shadow-neon hover:bg-game-primary/90 transition-all">
                  発行する
                </button>
              </form>
            )}

            {customQuests.length === 0 && !isCreating && (
              <p className="text-center text-game-muted text-sm mt-8">討伐待ちのクエストはありません。</p>
            )}
            
            {customQuests.map((quest) => {
          const isActive = activeQuestIds.includes(quest.id);
              
              // Local calc for base EXP display before Hunt Mode cuts it
              let baseExpMult = 1;
              if (quest.type === 'atk' && activePassives.includes('efficient_learning')) baseExpMult += 0.2;
              if (quest.type === 'hp' && activePassives.includes('super_recovery')) baseExpMult += 0.2;
              if (activePassives.includes('bunbu_ryodo')) baseExpMult += 0.2;
              if (activePassives.includes('tenma_guide')) baseExpMult += 0.3;
              
              const baseGain = quest.rewardExp;
              const passiveGain = Math.floor(baseGain * (baseExpMult - 1.0));
              let huntPenalty = 0;
              
              if (isPetHuntMode) {
                 const totalBeforePenalty = baseGain + passiveGain;
                 huntPenalty = Math.floor(totalBeforePenalty * 0.5);
              }
              
              // Apply Facility Bonus for EXP display
              const libraryBonusDisplay = 1 + (facilities.library || 0) * 0.05;
              const facilityExpGain = Math.floor((baseGain + passiveGain - huntPenalty) * (libraryBonusDisplay - 1));
              const finalExp = Math.max(1, Math.floor((baseGain + passiveGain - huntPenalty) * libraryBonusDisplay));
              
              // Apply Facility Bonus for Coins display
              const vaultBonusDisplay = 1 + (facilities.vault || 0) * 0.05;
              const displayCoins = Math.floor(quest.rewardCoins * vaultBonusDisplay);
              
              // Construct Breakdown string
              let breakdownStr = `基本${baseGain}`;
              if (passiveGain > 0) breakdownStr += ` + ボーナス${passiveGain}`;
              if (huntPenalty > 0) breakdownStr += ` - 探索影響${huntPenalty}`;
              if (facilityExpGain > 0) breakdownStr += ` + 図書館${facilityExpGain}`;
              
              let currentDropRateText = '10%';
              if (activePassives.includes('golden_spirit_15')) currentDropRateText = '15%';
              if (activePassives.includes('golden_spirit_25')) currentDropRateText = '25%';
              if (activePassives.includes('tenma_guide')) currentDropRateText = '40%';
              
              const petChanceText = isPetHuntMode ? '20%' : '5%';
              
              return (
                <div key={quest.id} className="relative overflow-hidden rounded-xl">
                  {/* Delete Button (Behind) */}
                  <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-red-600 text-white">
                    <button 
                      onClick={() => handleDeleteQuest(quest.id)}
                      className="w-full h-full flex flex-col items-center justify-center gap-1 active:bg-red-700 transition-colors"
                    >
                      <Trash2 size={24} />
                      <span className="text-[10px] font-bold">削除</span>
                    </button>
                  </div>

                  <div 
                    onTouchStart={handleTouchStart}
                    onTouchEnd={(e) => handleTouchEnd(e, quest.id)}
                    style={{ transform: swipedQuestId === quest.id ? 'translateX(-80px)' : 'translateX(0)' }}
                    className={`glass-panel p-4 relative overflow-hidden transition-transform duration-300 z-10 ${isActive ? 'border-game-accent/50 shadow-[0_0_15px_rgba(251,191,36,0.15)] bg-game-surface' : ''}`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-game-accent shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>}

                    <div className="flex items-start justify-between">
                      <div className="w-full">
                        <h3 className={`font-bold text-sm mb-1 ${isActive ? 'text-white' : 'text-gray-300'}`}>{quest.title}</h3>
                        <div className="mt-2 bg-[#111827] border border-game-surface rounded-md p-2">
                          {/* ... reward content ... */}
                          <span className="text-[10px] text-game-muted block mb-1">■ 獲得予定</span>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={`text-[11px] font-bold ${quest.type === 'atk' ? 'text-red-400' : 'text-game-primary'}`}>
                              EXP +{finalExp} <span className="text-[9px] text-gray-500">({quest.type === 'atk' ? 'ATK' : 'HP'}成長 / {breakdownStr})</span>
                            </span>
                            <span className="text-[11px] text-gray-500">/</span>
                            <span className="text-[11px] text-[#fbbf24] font-bold">💰 {displayCoins} コイン{(facilities.vault || 0) > 0 ? ` (金庫+${(facilities.vault || 0) * 5}%)` : ''}</span>
                            <span className="text-[11px] text-gray-500">/</span>
                            <span className="text-[11px] text-game-accent">💎 {currentDropRateText}でジェム</span>
                            {isPetHuntMode && (
                               <>
                                 <span className="text-[11px] text-gray-500">/</span>
                                 <span className="text-[11px] text-game-accent font-bold animate-pulse">🐾 ペット確率 {petChanceText}</span>
                               </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleQuestAction(quest)}
                      className={`w-full mt-4 py-2.5 rounded-lg font-bold text-sm tracking-widest transition-all duration-300 active:scale-[0.98] flex justify-center items-center gap-2
                        ${isActive 
                          ? 'bg-game-primary/20 text-game-primary border border-game-primary hover:bg-game-primary/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                          : 'bg-game-surface border border-game-surface/50 text-white hover:bg-game-surface/80'
                        }`}
                    >
                      {isActive ? <><CheckCircle2 size={16} /> 討伐完了 (報酬GET)</> : 'クエストを受注'}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* === EPIC QUEST TAB === */}
        {activeGuildTab === 'epic' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Creation Button / Form */}
            {!isCreatingEpic ? (
              <button
                onClick={() => setIsCreatingEpic(true)}
                className="w-full py-4 border-2 border-dashed border-red-500/30 rounded-xl text-red-400/60 font-bold flex items-center justify-center gap-2 hover:border-red-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                <Swords size={20} /> ＋ エピッククエストを作成
              </button>
            ) : (
              <form onSubmit={handleAddEpicQuest} className="glass-panel p-4 border-red-500/50 relative">
                <button type="button" onClick={() => setIsCreatingEpic(false)} className="absolute top-2 right-2 text-game-muted hover:text-white">
                  <X size={16} />
                </button>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Skull size={14} className="text-red-400" /> エピッククエスト発行
                </h3>

                <label className="text-[10px] text-gray-400 font-bold block mb-1">ボス名（親タスク）</label>
                <input
                  type="text"
                  value={newEpicTitle}
                  onChange={(e) => setNewEpicTitle(e.target.value)}
                  placeholder="例: 確定申告を終わらせる"
                  className="w-full bg-[#111827] border border-game-surface text-white p-2 rounded mb-3 text-sm focus:outline-none focus:border-red-500"
                  autoFocus
                />

                <label className="text-[10px] text-gray-400 font-bold block mb-1">アーマー（子タスク）</label>
                {newEpicChildren.map((child, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <span className="text-[10px] text-gray-500 font-bold mt-2.5 w-4">{i + 1}.</span>
                    <input
                      type="text"
                      value={child}
                      onChange={(e) => {
                        const updated = [...newEpicChildren];
                        updated[i] = e.target.value;
                        setNewEpicChildren(updated);
                      }}
                      placeholder={`子タスク ${i + 1}`}
                      className="flex-1 bg-[#111827] border border-game-surface text-white p-2 rounded text-xs focus:outline-none focus:border-red-500"
                    />
                    {newEpicChildren.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewEpicChildren(newEpicChildren.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-300 px-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewEpicChildren([...newEpicChildren, ''])}
                  className="text-[10px] text-red-400 font-bold mb-3 flex items-center gap-1 hover:text-red-300"
                >
                  <Plus size={12} /> 子タスクを追加
                </button>

                <p className="text-[10px] text-game-muted mb-3 text-center">
                  討伐報酬: 💎 1,500 ジェム / 💰 5,000 コイン
                </p>

                <button
                  type="submit"
                  className="w-full bg-red-500 text-white font-black py-2 rounded flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-400 transition-all"
                >
                  <Flame size={16} /> レイドボスを発行する
                </button>
              </form>
            )}

            {epicQuests.length === 0 && !isCreatingEpic && (
              <p className="text-center text-game-muted text-sm mt-8">エピッククエストはありません。<br/>大きなタスクを分割して挑戦しましょう。</p>
            )}

            {/* Epic Quest Boss Cards */}
            {epicQuests.map((quest) => {
              const totalChildren = quest.children.length;
              const completedChildren = quest.children.filter(c => c.completed).length;
              const isExploding = epicBossExploding === quest.id;

              return (
                <div key={quest.id} className="relative">
                  {/* Boss Card */}
                  <div className={`glass-panel p-0 overflow-hidden border-red-500/30 relative ${isExploding ? 'animate-boss-explode' : ''}`}>
                    {/* Boss Header */}
                    <div className="relative bg-gradient-to-r from-red-900/60 via-red-800/40 to-red-900/60 p-4 border-b border-red-500/20">
                      <div className="absolute inset-0 animate-boss-aura rounded-t-xl pointer-events-none"></div>
                      <div className="relative flex items-center gap-3">
                        {/* Boss Icon */}
                        <div className="w-14 h-14 rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse">
                          <Skull size={28} className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black tracking-widest bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full border border-red-500/50">EPIC BOSS</span>
                          </div>
                          <h3 className="font-black text-white text-base tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                            {quest.title}
                          </h3>
                          <span className="text-[10px] text-red-300/80">アーマー残り: {totalChildren - completedChildren} / {totalChildren}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteEpicQuest(quest.id)}
                          className="absolute top-2 right-2 text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Multi-layer HP Bars */}
                    <div className="px-4 pt-3 pb-1">
                      <div className="text-[9px] font-black text-red-400 tracking-widest mb-2 flex items-center gap-1">
                        <Shield size={10} /> BOSS HP GAUGE
                      </div>
                      <div className="space-y-1.5">
                        {quest.children.map((child, idx) => {
                          const color = BOSS_HP_COLORS[idx % BOSS_HP_COLORS.length];
                          const isShattered = child.completed;
                          const isCurrentlyShatterAnim = epicShatterIndex?.questId === quest.id && epicShatterIndex?.childIndex === idx;

                          return (
                            <div key={child.id} className="relative">
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-bold w-12 truncate ${isShattered ? 'text-gray-600 line-through' : color.label}`}>
                                  {child.title.slice(0, 6)}
                                </span>
                                <div className={`flex-1 h-3 bg-gray-800/80 rounded-full overflow-hidden border ${isShattered ? 'border-gray-700' : color.border}`}>
                                  <div
                                    className={`h-full bg-gradient-to-r ${color.bg} transition-all duration-500 rounded-full relative overflow-hidden
                                      ${isCurrentlyShatterAnim ? 'animate-hp-shatter' : ''}
                                      ${isShattered && !isCurrentlyShatterAnim ? 'w-0' : 'w-full'}
                                    `}
                                  >
                                    {!isShattered && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Child Tasks Checklist */}
                    <div className="px-4 pt-3 pb-4">
                      <div className="text-[9px] font-black text-gray-400 tracking-widest mb-2 flex items-center gap-1">
                        <Target size={10} /> TARGET LIST
                      </div>
                      <div className="space-y-2">
                        {quest.children.map((child, idx) => {
                          const color = BOSS_HP_COLORS[idx % BOSS_HP_COLORS.length];
                          return (
                            <div
                              key={child.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                child.completed
                                  ? 'bg-gray-800/30 border-gray-700/50'
                                  : 'bg-[#111827] border-game-surface hover:border-red-500/30'
                              }`}
                            >
                              {child.completed ? (
                                <CheckCircle2 size={16} className="text-gray-500 flex-shrink-0" />
                              ) : (
                                <div className={`w-4 h-4 rounded-full border-2 ${color.border} flex-shrink-0`}></div>
                              )}
                              <span className={`text-xs flex-1 ${child.completed ? 'text-gray-500 line-through' : 'text-white font-bold'}`}>
                                {child.title}
                              </span>
                              {!child.completed && (
                                <button
                                  onClick={() => handleEpicChildComplete(quest.id, child.id)}
                                  className="px-3 py-1.5 bg-red-500/20 border border-red-500 text-red-400 rounded-lg text-[10px] font-black tracking-wider hover:bg-red-500/30 active:scale-95 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] flex items-center gap-1"
                                >
                                  <Zap size={10} /> 討伐
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Reward Preview */}
                      <div className="mt-3 bg-[#111827] border border-game-surface rounded-md p-2">
                        <span className="text-[10px] text-game-muted block mb-1">■ 完全討伐報酬</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-game-accent font-bold">💎 1,500 ジェム</span>
                          <span className="text-[11px] text-gray-500">/</span>
                          <span className="text-[11px] text-[#fbbf24] font-bold">💰 5,000 コイン</span>
                          <span className="text-[11px] text-gray-500">/</span>
                          <span className="text-[11px] text-red-400 font-bold">EXP +80×{totalChildren}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- FACILITIES TAB --- */}
        {activeGuildTab === 'facilities' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div className="glass-panel p-4 flex items-center gap-4">
               <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/50">
                 <BookOpen size={24} className="text-blue-400" />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-white text-sm">図書館 <span className="text-xs text-blue-400">Lv.{facilities.library || 0}</span></h3>
                 </div>
                 <p className="text-[10px] text-gray-400 mb-2">手動クエストの【獲得EXP】が +{(facilities.library || 0) * 5}% 増加</p>
                 <button 
                   onClick={() => handleUpgradeFacility('library')}
                   className="w-full py-1.5 bg-[#111827] border border-blue-500/30 text-blue-400 rounded text-xs font-bold hover:bg-blue-500/10 flex justify-center items-center gap-1"
                 >
                   <ChevronRight size={14}/> 改築する (💰 {Math.floor(1000 * Math.pow(1.5, facilities.library || 0)).toLocaleString()})
                 </button>
               </div>
             </div>

             <div className="glass-panel p-4 flex items-center gap-4">
               <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/50">
                 <Dumbbell size={24} className="text-red-400" />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-white text-sm">訓練所 <span className="text-xs text-red-400">Lv.{facilities.training || 0}</span></h3>
                 </div>
                 <p className="text-[10px] text-gray-400 mb-2">基礎ATKが +{(facilities.training || 0) * 5}% 増加</p>
                 <button 
                   onClick={() => handleUpgradeFacility('training')}
                   className="w-full py-1.5 bg-[#111827] border border-red-500/30 text-red-400 rounded text-xs font-bold hover:bg-red-500/10 flex justify-center items-center gap-1"
                 >
                   <ChevronRight size={14}/> 改築する (💰 {Math.floor(1000 * Math.pow(1.5, facilities.training || 0)).toLocaleString()})
                 </button>
               </div>
             </div>

             <div className="glass-panel p-4 flex items-center gap-4">
               <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/50">
                 <Vault size={24} className="text-yellow-400" />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-white text-sm">金庫 <span className="text-xs text-yellow-400">Lv.{facilities.vault || 0}</span></h3>
                 </div>
                 <p className="text-[10px] text-gray-400 mb-2">手動クエストの【獲得コイン】が +{(facilities.vault || 0) * 5}% 増加</p>
                 <button 
                   onClick={() => handleUpgradeFacility('vault')}
                   className="w-full py-1.5 bg-[#111827] border border-yellow-500/30 text-yellow-400 rounded text-xs font-bold hover:bg-yellow-500/10 flex justify-center items-center gap-1"
                 >
                   <ChevronRight size={14}/> 改築する (💰 {Math.floor(1000 * Math.pow(1.5, facilities.vault || 0)).toLocaleString()})
                 </button>
               </div>
             </div>
             
             <p className="text-center text-[10px] text-gray-500 mt-4 leading-relaxed">
               施設をレベルアップすると、恒久的な恩恵を受けられます。<br/>
               コストは指数関数的に増加しますが、ガチャと違い確実に強くなります。
             </p>
          </div>
        )}

        {/* --- DEFENSE TAB --- */}
        {activeGuildTab === 'defense' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <form onSubmit={handleAddHabit} className="glass-panel p-4 border-purple-500/30">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Skull size={14} className="text-purple-400" /> 悪習慣を登録（ボス追加）</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="例: 夜食を食べる、SNSダラダラ" 
                    className="flex-1 bg-[#111827] border border-game-surface text-white p-2 rounded text-xs focus:outline-none focus:border-purple-500"
                  />
                  <button type="submit" className="bg-purple-600 outline-none text-white px-3 font-bold text-xs rounded hover:bg-purple-500 transition-colors">
                    追加
                  </button>
                </div>
             </form>

             {badHabits.length === 0 ? (
               <p className="text-center text-game-muted text-xs mt-8">登録された悪習慣はありません。<br/>倒すべき誘惑を追加してください。</p>
             ) : (
               badHabits.map(habit => {
                 const hpPercent = Math.max(0, Math.min(100, (habit.currentHp / habit.maxHp) * 100));
                 return (
                   <div key={habit.id} className="relative overflow-hidden rounded-xl">
                      <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-red-600 text-white">
                        <button onClick={() => handleDeleteHabit(habit.id)} className="w-full h-full flex flex-col items-center justify-center gap-1 active:bg-red-700">
                          <Trash2 size={24} />
                          <span className="text-[10px] font-bold">削除</span>
                        </button>
                      </div>

                      <div 
                        onTouchStart={handleTouchStart}
                        onTouchEnd={(e) => handleTouchEnd(e, habit.id)}
                        style={{ transform: swipedQuestId === habit.id ? 'translateX(-80px)' : 'translateX(0)' }}
                        className="glass-panel p-4 relative overflow-hidden transition-transform duration-300 z-10 border-purple-500/20"
                      >
                         <div className="flex justify-between items-start mb-2">
                            <div>
                               <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                  <Ghost size={16} className="text-purple-400" /> {habit.name}
                               </h3>
                               <span className="text-[10px] text-gray-400 tracking-wider">Lv.{habit.level} BOSS / STREAK: {habit.streak}日</span>
                            </div>
                         </div>
                         
                         {/* HP Bar */}
                         <div className="mb-3">
                            <div className="flex justify-between text-[9px] font-bold mb-1">
                               <span className="text-purple-400">BOSS HP</span>
                               <span className="text-white">{habit.currentHp} / {habit.maxHp}</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                               <div className="h-full bg-gradient-to-r from-purple-600 to-red-500 transition-all duration-500" style={{ width: `${hpPercent}%` }}></div>
                            </div>
                         </div>

                         <div className="flex gap-2 mt-4">
                            <button 
                              onClick={() => handleHabitEndured(habit.id)}
                              className="flex-1 py-3 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded font-bold text-xs flex justify-center items-center gap-1 active:scale-95 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            >
                              <Zap size={14}/> 我慢できた！ (攻撃)
                            </button>
                            <button 
                              onClick={() => handleHabitYielded(habit.id)}
                              className="flex-1 py-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded font-bold text-xs flex justify-center items-center gap-1 active:scale-95 transition-all"
                            >
                              <HeartPulse size={14}/> 負けた… (申告)
                            </button>
                         </div>
                      </div>
                   </div>
                 );
               })
             )}
          </div>
        )}

      </div>
      
      {/* Gem Bonus Notification Toast */}
      {gemNotification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-game-surface border-2 border-game-accent px-6 py-3 rounded-full shadow-neon flex items-center gap-3">
            <div className="bg-game-accent text-black p-1.5 rounded-full animate-bounce">
              <GemIcon size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-game-accent font-black text-sm tracking-wider">BONUS DROP!</span>
              <span className="text-white font-bold text-xs">ジェム +{gemNotification.amount} 獲得</span>
            </div>
          </div>
        </div>
      )}

      {/* Pet Catch Flash FX Overlay */}
      {isPetPulling && (
        <div className={`fixed inset-0 z-[100] animate-pull-${isPetPulling} pointer-events-none`}>
        </div>
      )}

      {/* Pet Character Modal */}
      {petResult && !isPetPulling && (
        <div className="absolute inset-x-0 bottom-0 top-[-64px] z-50 bg-[#111827]/96 backdrop-blur-xl flex items-center justify-center flex-col animate-in fade-in duration-300">
          <div className="absolute flex flex-col items-center top-[15%] pointer-events-none fade-in slide-in-from-top-4 duration-500 delay-300 fill-mode-both">
            <span className="text-2xl font-bold text-game-accent animate-pulse tracking-widest drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">RARE ENCOUNTER!</span>
            <span className="text-sm text-game-accent">ペットが仲間になりたそうにこちらを見ている…</span>
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>

          <h2 className={`text-4xl font-black mb-8 italic tracking-widest animate-in slide-in-from-top-4 duration-500 mt-16 ${getRarityStyle(petResult.rarity)}`}>
            {getRarityName(petResult.rarity)}
          </h2>
          
          <div className={`w-40 h-40 rounded-full border-4 bg-game-bg flex items-center justify-center mb-6 relative shadow-2xl animate-in zoom-in-50 duration-500 fill-mode-both ${getRarityStyle(petResult.rarity)}`}>
            {/* Glow behind icon */}
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 ${petResult.rarity === 'legendary' ? 'bg-game-accent' : petResult.rarity === 'epic' ? 'bg-game-secondary' : 'bg-blue-500'}`}></div>
            <div className="relative z-10 animate-bounce mt-4">
              {renderIcon(petResult.iconName, getRarityStyle(petResult.rarity))}
            </div>
          </div>

          <div className="text-center animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both max-w-[80vw]">
            <h3 className="text-2xl font-bold text-white tracking-wide mb-3">{petResult.label}</h3>
            
            <div className={`inline-block border rounded-lg p-3 mb-6 bg-black/50 ${getRarityStyle(petResult.rarity)} border-opacity-40`}>
              <div className="flex flex-col items-center gap-2">
                <span className="font-bold text-sm tracking-widest flex items-center gap-1 opacity-80">
                  <Target size={14} /> NEW COMPANION
                </span>
                <span className="font-bold text-white text-md">ATK+{petResult.bonusATK} / HP+{petResult.bonusHP}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setPetResult(null)}
            className="mt-4 px-12 py-3 rounded-full font-bold text-white border border-gray-600 hover:bg-gray-800 transition-all active:scale-95 animate-in slide-in-from-bottom-8 duration-500 delay-500 fill-mode-both"
          >
            一緒に帰る
          </button>
        </div>
      )}

      {/* Defense Result Overlay */}
      {defenseResult && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"></div>
          <div className="glass-panel p-8 w-full max-w-sm border-purple-500/50 relative z-10 animate-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-neon border-2 ${defenseResult.type === 'victory' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
               {defenseResult.type === 'victory' ? <CheckCircle2 size={40} /> : <Skull size={40} />}
            </div>
            
            <h2 className={`text-2xl font-black mb-2 tracking-tight ${defenseResult.type === 'victory' ? 'text-emerald-400' : 'text-red-500'}`}>
              {defenseResult.type === 'victory' ? 'EVIL HABIT PURGED!' : 'DEFEATED BY TEMPTATION...'}
            </h2>
            
            <p className="text-gray-400 text-sm mb-6">
              {defenseResult.type === 'victory' 
                ? `【${defenseResult.name}】の誘惑に打ち勝ちました！素晴らしい自己管理能力です。` 
                : `【${defenseResult.name}】の誘惑に負けてしまいました。次は絶対に勝ちましょう！`}
            </p>

            {defenseResult.type === 'victory' ? (
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-[#111827] border border-game-surface p-4 rounded-xl flex flex-col items-center">
                  <Coins className="text-[#fbbf24] mb-1" size={24} />
                  <span className="text-xs text-game-muted font-bold">COINS</span>
                  <span className="text-lg font-black text-white">+{defenseResult.coins.toLocaleString()}</span>
                </div>
                <div className="bg-[#111827] border border-game-surface p-4 rounded-xl flex flex-col items-center">
                  <GemIcon className="text-game-accent mb-1" size={24} />
                  <span className="text-xs text-game-muted font-bold">GEMS</span>
                  <span className="text-lg font-black text-white">+{defenseResult.gems.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl w-full mb-8 flex flex-col items-center">
                <span className="text-xs text-red-400 font-bold mb-1">PENALTY</span>
                <span className="text-lg font-black text-red-500 flex items-center gap-1">
                  <Coins size={18} /> -{defenseResult.penalty} COINS
                </span>
                <p className="text-[10px] text-gray-500 mt-2">ボスのHPが回復してしまいました。</p>
              </div>
            )}

            <button 
              onClick={() => setDefenseResult(null)}
              className={`w-full py-4 text-[#111827] font-black rounded-xl shadow-neon active:scale-95 transition-all ${defenseResult.type === 'victory' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
            >
              ギルドに戻る
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Toast */}
      {upgradeToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm tracking-wider flex items-center gap-2">
            <X size={18} className="bg-white/20 rounded-full" />
            {upgradeToast}
          </div>
        </div>
      )}

      {/* === EPIC QUEST OVERLAYS === */}

      {/* Screen Flash on Child Complete */}
      {epicScreenFlash && (
        <div className="fixed inset-0 z-[400] bg-red-500 animate-screen-flash pointer-events-none"></div>
      )}

      {/* Critical Damage Number */}
      {epicDamageEffect && (
        <div className="fixed inset-0 z-[500] pointer-events-none flex items-center justify-center">
          <div
            key={epicDamageEffect.id}
            className="animate-critical-hit absolute top-1/2 left-1/2 flex flex-col items-center"
          >
            <span className="text-[10px] font-black tracking-[0.3em] text-yellow-400 mb-1 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
              CRITICAL HIT!
            </span>
            <span className="text-5xl font-black text-red-500 drop-shadow-[0_2px_20px_rgba(239,68,68,0.9)] italic tracking-tight">
              {epicDamageEffect.atk.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-white tracking-widest mt-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
              ATK DAMAGE
            </span>
          </div>
        </div>
      )}

      {/* Epic Boss Defeat Reward Modal */}
      {epicRewardResult && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"></div>
          <div className="relative z-10 w-full max-w-sm animate-epic-result flex flex-col items-center text-center">
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15)_0%,transparent_70%)] pointer-events-none"></div>

            {/* Crown Icon */}
            <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
              <Trophy size={48} className="text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
            </div>

            <h2 className="text-3xl font-black text-red-400 tracking-tight mb-1 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] italic">
              EPIC BOSS SLAIN!
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              【{epicRewardResult.title}】を完全討伐しました！
            </p>

            {/* Loot display */}
            <div className="glass-panel p-6 w-full border-red-500/30 mb-6">
              <h3 className="text-[10px] font-black text-red-400 tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
                <Gift size={14} /> EPIC LOOT DROP
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111827] border border-game-accent/30 p-4 rounded-xl flex flex-col items-center animate-gem-bounce">
                  <GemIcon className="text-game-accent mb-2" size={28} />
                  <span className="text-[10px] text-game-muted font-bold">GEMS</span>
                  <span className="text-xl font-black text-game-accent">+{epicRewardResult.gems.toLocaleString()}</span>
                </div>
                <div className="bg-[#111827] border border-yellow-500/30 p-4 rounded-xl flex flex-col items-center">
                  <Coins className="text-[#fbbf24] mb-2" size={28} />
                  <span className="text-[10px] text-game-muted font-bold">COINS</span>
                  <span className="text-xl font-black text-white">+{epicRewardResult.coins.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-center gap-2">
                <Flame size={14} className="text-red-400" />
                <span className="text-[11px] text-red-300 font-bold">{epicRewardResult.childCount}段階のアーマーを全て破壊！</span>
              </div>
            </div>

            <button
              onClick={() => setEpicRewardResult(null)}
              className="w-full py-4 bg-red-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-95 transition-all text-lg tracking-wider"
            >
              ギルドに戻る
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
