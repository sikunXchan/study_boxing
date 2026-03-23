import { Target, CheckCircle2, Plus, Bell, X, Flag, ChevronRight, Trash2, Gem as GemIcon, BookOpen, Dumbbell, Vault, Skull, HeartPulse, Zap, Ghost } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function GuildArea({ setStats, setResources, inventory, setInventory, equippedItems, facilities = {}, setFacilities, badHabits = [], setBadHabits }) {
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

  const [activeGuildTab, setActiveGuildTab] = useState('quests'); // 'quests', 'facilities', 'defense'

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

  // --- Handlers for Facilities ---
  const handleUpgradeFacility = (facilityId) => {
    const currentLv = facilities[facilityId] || 0;
    const cost = Math.floor(1000 * Math.pow(1.5, currentLv));
    setResources(prev => {
      if (prev.coins >= cost) {
        setFacilities(f => ({ ...f, [facilityId]: currentLv + 1 }));
        return { ...prev, coins: prev.coins - cost };
      } else {
        alert('コインが足りません！');
        return prev;
      }
    });
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
        const damage = Math.floor(h.maxHp * 0.3); // 30% damage
        const nextHp = h.currentHp - damage;
        if (nextHp <= 0) {
           alert(`【${h.name}】の誘惑を完全に断ち切った！\n報酬としてジェムと大金を手に入れました！`);
           setResources(r => ({
              ...r,
              coins: r.coins + 2000 * h.level,
              gems: r.gems + 10 * h.level
           }));
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
        alert(`無念...【${h.name}】の誘惑に負けてしまった。\nペナルティとしてコインを500失い、ボスのHPが回復しました。`);
        setResources(r => ({
           ...r,
           coins: Math.max(0, r.coins - 500)
        }));
        return { ...h, streak: 0, currentHp: Math.min(h.maxHp, h.currentHp + Math.floor(h.maxHp * 0.2)) };
      }
      return h;
    }));
  };

  const handleDeleteHabit = (habitId) => {
    setBadHabits(prev => prev.filter(h => h.id !== habitId));
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
          onClick={() => setActiveGuildTab('facilities')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeGuildTab === 'facilities' ? 'bg-game-surface text-white shadow-sm' : 'text-gray-500'}`}
        >
          <BookOpen size={12}/> 施設投資
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
              
              const finalExp = Math.max(1, baseGain + passiveGain - huntPenalty);
              
              // Construct Breakdown string
              let breakdownStr = `基本${baseGain}`;
              if (passiveGain > 0) breakdownStr += ` + ボーナス${passiveGain}`;
              if (huntPenalty > 0) breakdownStr += ` - 探索影響${huntPenalty}`;
              
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
                            <span className="text-[11px] text-[#fbbf24] font-bold">💰 {quest.rewardCoins} コイン</span>
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

    </div>
  );
}
