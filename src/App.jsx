import { useState, useEffect, useRef } from 'react';
import { Home, ShieldAlert, ShoppingBag, Save, Star, ChevronRight, Gem } from 'lucide-react';
import TopResourceBar from './components/TopResourceBar';
import BottomNavigation from './components/BottomNavigation';
import HomeArea from './components/HomeArea';
import GuildArea from './components/GuildArea';
import ShopArea from './components/ShopArea';
import BattleArea from './components/BattleArea';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateLevelData } from './utils/level';
import { runMigration } from './utils/saveMigration';

// Run migration BEFORE any component renders to ensure data integrity
runMigration();

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [levelUpData, setLevelUpData] = useState(null);

  // Infinite progression state persisted
  const [stats, setStats] = useLocalStorage('gemini_survivor_stats', {
    atk: 0,
    hp: 0
  });
  const [inventory, setInventory] = useLocalStorage('gemini_survivor_inventory', []);
  const [equippedItems, setEquippedItems] = useLocalStorage('gemini_survivor_equipped', {
    weapon: null,
    armor: null,
    necklace: null,
    gloves: null,
    belt: null,
    boots: null,
    collar: null,
    toy: null,
    pet_entity: null
  });

  // Currencies persisted
  const [resources, setResources] = useLocalStorage('gemini_survivor_resources', {
    stamina: 0,
    coins: 0,
    gems: 0
  });

  const [facilities, setFacilities] = useLocalStorage('gemini_survivor_facilities', { library: 0, training: 0, vault: 0 });
  const [badHabits, setBadHabits] = useLocalStorage('gemini_survivor_bad_habits', []);
  
  // Avatar & Reincarnation States
  const [playerRank, setPlayerRank] = useLocalStorage('gemini_survivor_rank', 1);
  const [activeSkin, setActiveSkin] = useLocalStorage('gemini_survivor_skin', null);
  const [reincarnationCount, setReincarnationCount] = useLocalStorage('gemini_survivor_reincarnation', 0);

  // Visual Save Indicator logic
  const [isSaving, setIsSaving] = useState(false);

  // Trigger save indicator when critical persistence states change
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => setIsSaving(false), 1500);
    return () => clearTimeout(timer);
  }, [stats, inventory, equippedItems, resources]);

  // Level & Progression Logic
  const previousLevelRef = useRef(null);
  
  useEffect(() => {
    // V7 Fix: Level is purely driven by Base EXP (Stats gained from Quests).
    // V9 Fix: Level EXP is now dynamic instead of a flat 500.
    const baseExp = stats.atk + stats.hp; 
    const { currentLevel } = calculateLevelData(baseExp);

    if (previousLevelRef.current === null) {
      previousLevelRef.current = currentLevel;
    } else if (currentLevel > previousLevelRef.current) {
      // Level Up Occurred!
      const levelDiff = currentLevel - previousLevelRef.current;
      setResources(prev => ({ ...prev, gems: prev.gems + (300 * levelDiff) }));
      
      setLevelUpData({ level: currentLevel, diff: levelDiff, prevLevel: previousLevelRef.current });
      
      previousLevelRef.current = currentLevel;
    }

  }, [stats, setResources]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeArea stats={stats} setStats={setStats} inventory={inventory} setInventory={setInventory} equippedItems={equippedItems} setEquippedItems={setEquippedItems} facilities={facilities} playerRank={playerRank} setPlayerRank={setPlayerRank} activeSkin={activeSkin} setActiveSkin={setActiveSkin} reincarnationCount={reincarnationCount} setReincarnationCount={setReincarnationCount} />;
      case 'guild': return <GuildArea resources={resources} setStats={setStats} setResources={setResources} inventory={inventory} setInventory={setInventory} equippedItems={equippedItems} facilities={facilities} setFacilities={setFacilities} badHabits={badHabits} setBadHabits={setBadHabits} reincarnationCount={reincarnationCount} />;
      case 'shop': return <ShopArea resources={resources} setResources={setResources} setInventory={setInventory} />;
      case 'battle': return <BattleArea stats={stats} setStats={setStats} resources={resources} setResources={setResources} inventory={inventory} equippedItems={equippedItems} facilities={facilities} reincarnationCount={reincarnationCount} activeSkin={activeSkin} playerRank={playerRank} />;
      default: return <HomeArea stats={stats} setStats={setStats} inventory={inventory} setInventory={setInventory} equippedItems={equippedItems} setEquippedItems={setEquippedItems} facilities={facilities} playerRank={playerRank} setPlayerRank={setPlayerRank} activeSkin={activeSkin} setActiveSkin={setActiveSkin} reincarnationCount={reincarnationCount} setReincarnationCount={setReincarnationCount} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-game-bg text-game-text overflow-hidden relative">
      <TopResourceBar resources={resources} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-game-bg to-game-surface opacity-50 pointer-events-none"></div>
        {renderContent()}
      </main>

      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Auto Saving Indicator */}
      <div className={`absolute top-20 right-4 z-50 transition-all duration-500 pointer-events-none ${isSaving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <div className="bg-game-surface border border-game-primary/30 px-3 py-1.5 rounded-full shadow-neon flex items-center gap-2">
          <Save size={14} className="text-game-primary animate-pulse" />
          <span className="text-[10px] font-bold text-game-primary tracking-widest hidden sm:inline">Auto Saving...</span>
        </div>
      </div>

      {/* Level Up Modal Animation */}
      {levelUpData && (
        <div className="absolute inset-0 z-[200] bg-[#111827]/96 backdrop-blur-xl flex items-center justify-center flex-col animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0%,transparent_70%)] pointer-events-none"></div>

          <div className="relative flex flex-col items-center">
            <Star size={80} className="text-game-accent mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] fill-game-accent" />
            
            <h2 className="text-5xl font-black mb-2 italic tracking-widest text-game-accent drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-in slide-in-from-bottom-8 duration-700">
              LEVEL UP!
            </h2>
            
            <div className="flex items-center gap-4 my-8 animate-in zoom-in-50 duration-500 delay-300 fill-mode-both">
              <span className="text-4xl font-black text-gray-500">{levelUpData.prevLevel}</span>
              <ChevronRight size={32} className="text-game-accent animate-pulse" />
              <span className="text-6xl font-black text-white shadow-neon drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] px-4">{levelUpData.level}</span>
            </div>

            <div className="glass-panel p-6 border-game-accent/50 w-80 mb-8 animate-in slide-in-from-bottom-8 duration-500 delay-500 fill-mode-both">
              <h3 className="text-center font-bold text-game-accent mb-4">ステータスボーナス</h3>
              <div className="flex justify-between items-center mb-2 border-b border-game-surface pb-2">
                <span className="text-gray-400 text-sm">基礎ステータス上昇</span>
                <span className="font-bold text-white text-lg font-mono">x {Math.min(100, levelUpData.level).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-game-secondary text-sm flex items-center gap-1"><Gem size={14}/>ジェム報酬</span>
                <span className="font-bold text-game-secondary text-lg">+{300 * levelUpData.diff}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setLevelUpData(null)}
              className="px-12 py-4 rounded-full font-black text-[#111827] bg-game-accent hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-in slide-in-from-bottom-8 duration-500 delay-700 fill-mode-both"
            >
              確認
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
