import { useState, useRef } from 'react';
import { PackageOpen, Zap, Instagram, Youtube, PlaySquare, ChevronRight, X, Download, Upload } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { GACHA_POOL } from '../data/items';
import { exportSaveData, importSaveData } from '../utils/saveMigration';

export default function ShopArea({ resources, setResources, setInventory }) {
  const [gachaResult, setGachaResult] = useState(null); 
  const [isPulling, setIsPulling] = useState(null); // 'legendary' | 'epic' | 'rare' | 'normal' | null

  // Fixed SNS Costs as per the economic finalization
  const snsItems = [
    { id: 'youtube', name: 'YouTube', label: '30分解放', cost: 500, icon: Youtube, color: 'text-red-500' },
    { id: 'insta', name: 'Instagram', label: '30分解放', cost: 800, icon: Instagram, color: 'text-pink-500' },
    { id: 'tiktok', name: 'TikTok', label: '30分解放', cost: 800, icon: PlaySquare, color: 'text-[#00f2fe]' },
  ];

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

  const handleBuyStamina = (cost) => {
    if (resources.coins >= cost) {
      setResources(prev => ({ ...prev, coins: prev.coins - cost, stamina: prev.stamina + 30 }));
    } else {
      alert('コインが足りません！');
    }
  };

  const handleExchange = () => {
    if (resources.coins >= 300) {
      setResources(prev => ({ ...prev, coins: prev.coins - 300, gems: prev.gems + 100 }));
    } else {
      alert('コインが足りません！');
    }
  };

  const handleBuyAnt = () => {
    if (resources.coins >= 1000) {
      setResources(prev => ({ ...prev, coins: prev.coins - 1000 }));
      const baseAnt = GACHA_POOL.find(i => i.label === '働きアリ');
      const newItemInstance = {
        ...baseAnt,
        id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        upgradeLevel: 0
      };
      setIsPulling('uncommon');
      setTimeout(() => {
        setIsPulling(null);
        setInventory(prev => [...prev, newItemInstance]);
        setGachaResult(newItemInstance);
      }, 1500);
    } else {
      alert('コインが足りません！ (1000コイン必要です)');
    }
  };

  const handlePullGacha = (allowedTypes = []) => {
    if (resources.gems >= 300) {
      // Deduct gems
      setResources(prev => ({ ...prev, gems: prev.gems - 300 }));
      
      // Filter the pool based on the requested gacha box
      const pool = GACHA_POOL.filter(item => allowedTypes.includes(item.type));

      // Calculate weighted probability from the filtered pool
      const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
      let randomNum = Math.random() * totalWeight;
      let drawnBaseItem = pool[0]; 
      
      for (const item of pool) {
        if (randomNum < item.weight) {
          drawnBaseItem = item;
          break;
        }
        randomNum -= item.weight;
      }

      // Create unique instance
      const newItemInstance = {
        ...drawnBaseItem,
        id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        upgradeLevel: 0
      };

      // Start intense visual FX sequence
      setIsPulling(drawnBaseItem.rarity);
      
      setTimeout(() => {
        setIsPulling(null);
        setInventory(prev => [...prev, newItemInstance]);
        setGachaResult(newItemInstance);
      }, 1500);
      
    } else {
      alert('ジェムが足りません！');
    }
  };

  const closeGachaModal = () => {
    setGachaResult(null);
  };

  return (
    <div className="p-4 h-full flex flex-col space-y-8 animate-in slide-in-from-left duration-300 relative">
      <h2 className="text-xl font-black italic tracking-wider filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] pt-2 text-[#fbbf24]">
        REWARD SHOP
      </h2>

      <div className="flex gap-3 flex-shrink-0">
        {/* Equipment Gacha Section */}
        <div className="glass-panel p-1 relative overflow-hidden flex-1 border-game-secondary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-game-secondary/10 to-transparent"></div>
          <div className="p-3 relative z-10 flex-1 flex flex-col">
            <h3 className="font-bold text-game-secondary text-sm flex items-center gap-1 mb-1 truncate">
              <PackageOpen size={16} /> 装備品ボックス
            </h3>
            <p className="text-[10px] text-game-muted mb-2">武器・防具・装飾品</p>
            
            <div className="w-full h-20 rounded-lg bg-[#111827] border border-game-surface mb-3 flex items-center justify-center relative overflow-hidden group">
              <PackageOpen size={40} className="text-game-secondary drop-shadow-[0_0_10px_rgba(139,92,246,0.6)] group-hover:scale-110 transition-transform duration-500" />
            </div>

            <button 
              onClick={() => handlePullGacha(['weapon', 'armor', 'necklace', 'gloves', 'belt', 'boots'])}
              className="w-full glass-btn py-2 bg-game-secondary/20 border-game-secondary text-game-secondary font-bold text-xs hover:bg-game-secondary/30"
            >
              引く (300 💎)
            </button>
          </div>
        </div>

        {/* Pet Gacha Section */}
        <div className="glass-panel p-1 relative overflow-hidden flex-1 border-game-accent/50 shadow-[0_0_15px_rgba(251,191,36,0.15)] flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-game-accent/10 to-transparent"></div>
          <div className="p-3 relative z-10 flex-1 flex flex-col">
            <h3 className="font-bold text-game-accent text-sm flex items-center gap-1 mb-1 truncate">
              <PackageOpen size={16} /> ペット用品箱
            </h3>
            <p className="text-[10px] text-game-muted mb-2">首輪・玩具</p>
            
            <div className="w-full h-20 rounded-lg bg-[#111827] border border-game-surface mb-3 flex items-center justify-center relative overflow-hidden group">
              <PackageOpen size={40} className="text-game-accent drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] group-hover:scale-110 transition-transform duration-500" />
            </div>

            <button 
              onClick={() => handlePullGacha(['collar', 'toy'])}
              className="w-full glass-btn py-2 bg-game-accent/20 border-game-accent text-game-accent font-bold text-xs hover:bg-game-accent/30"
            >
              引く (300 💎)
            </button>
          </div>
        </div>
      </div>

      {/* Pet Entity Deterministic Purchase */}
      <div className="flex-shrink-0">
        <h3 className="text-sm font-bold text-game-muted mb-2 flex items-center gap-2">
          <LucideIcons.Bug size={16} className="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" /> ペットの固定購入
        </h3>
        <div className="glass-panel p-3 border-l-4 border-l-green-400 flex items-center justify-between group overflow-hidden relative">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-lg bg-[#111827] flex items-center justify-center border border-game-surface shadow-md">
              <LucideIcons.Bug size={24} className="text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wide text-white">働きアリ <span className="text-[10px] bg-green-500/10 text-green-400 px-1 py-0.5 rounded">UNCOMMON</span></h4>
              <span className="text-[10px] text-game-muted block mt-0.5">装備補正: x1.0 (合成で成長)</span>
            </div>
          </div>
          <button 
            onClick={handleBuyAnt}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95
              ${resources.coins >= 1000 
                ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/50 hover:bg-[#fbbf24]/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]' 
                : 'bg-game-surface text-gray-500 border border-game-surface/50 opacity-50'
              }`}
          >
            💰 1000
          </button>
        </div>
      </div>

      {/* SNS Time Shop & Exchange */}
      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar pr-1">
        <h3 className="text-sm font-bold text-game-muted mb-4 flex items-center gap-2">
          <Zap size={16} className="text-game-primary drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" /> スタミナ（SNS）購入
        </h3>
        
        <div className="space-y-3 mb-6">
          {snsItems.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="glass-panel p-3 flex items-center justify-between transition-transform duration-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-game-bg flex items-center justify-center border border-game-surface shadow-md ${item.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-wide">{item.name}</h4>
                    <span className="text-[10px] text-game-muted block mt-0.5">{item.label}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleBuyStamina(item.cost)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95
                    ${resources.coins >= item.cost 
                      ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/50 hover:bg-[#fbbf24]/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]' 
                      : 'bg-game-surface text-gray-500 border border-game-surface/50 opacity-50'
                    }`}
                >
                  <div className="flex items-center gap-1">
                    💰 {item.cost}
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
        
        <h3 className="text-sm font-bold text-game-muted mb-4 flex items-center gap-2">
          <Zap size={16} className="text-gray-400 drop-shadow-[0_0_5px_rgba(156,163,175,0.8)]" /> 取引所
        </h3>
        <div className="glass-panel p-3 flex items-center justify-between transition-transform duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-game-bg flex items-center justify-center border border-game-surface shadow-md text-blue-400">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wide">ジェム交換</h4>
              <span className="text-[10px] text-game-muted block mt-0.5">💎100 個と交換</span>
            </div>
          </div>
          <button 
            onClick={handleExchange}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95
              ${resources.coins >= 300 
                ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/50 hover:bg-[#fbbf24]/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]' 
                : 'bg-game-surface text-gray-500 border border-game-surface/50 opacity-50'
              }`}
          >
            <div className="flex items-center gap-1">
              💰 300
            </div>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Save Data Management */}
      <div className="flex-shrink-0 pb-24">
        <h3 className="text-sm font-bold text-game-muted mb-3 flex items-center gap-2">
          <Download size={16} className="text-gray-400" /> セーブデータ管理
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const data = exportSaveData();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `save_${new Date().toISOString().slice(0,10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 glass-panel p-3 flex flex-col items-center gap-2 border-game-primary/30 hover:border-game-primary/60 cursor-pointer transition-all active:scale-95"
          >
            <Download size={20} className="text-game-primary" />
            <span className="text-[11px] font-bold text-game-primary">エクスポート</span>
            <span className="text-[9px] text-game-muted">バックアップ保存</span>
          </button>
          <label
            className="flex-1 glass-panel p-3 flex flex-col items-center gap-2 border-game-accent/30 hover:border-game-accent/60 cursor-pointer transition-all active:scale-95"
          >
            <Upload size={20} className="text-game-accent" />
            <span className="text-[11px] font-bold text-game-accent">インポート</span>
            <span className="text-[9px] text-game-muted">データ復元</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const data = JSON.parse(ev.target.result);
                    importSaveData(data);
                    alert('セーブデータを復元しました！ページを再読み込みします。');
                    window.location.reload();
                  } catch (err) {
                    alert('ファイルの読み込みに失敗しました。正しいセーブデータファイルを選択してください。');
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {/* Gacha Flash FX Overlay */}
      {isPulling && (
        <div className={`fixed inset-0 z-[100] animate-pull-${isPulling} pointer-events-none`}>
        </div>
      )}

      {/* Gacha Result Modal */}
      {gachaResult && !isPulling && (
        <div className="absolute inset-x-0 bottom-0 top-[-64px] z-50 bg-[#111827]/96 backdrop-blur-xl flex items-center justify-center flex-col animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>

          <h2 className={`text-4xl font-black mb-8 italic tracking-widest animate-in slide-in-from-top-4 duration-500 ${getRarityStyle(gachaResult.rarity)}`}>
            {getRarityName(gachaResult.rarity)}
          </h2>
          
          <div className={`w-40 h-40 rounded-2xl border-4 bg-game-bg flex items-center justify-center mb-6 relative shadow-2xl animate-in zoom-in-50 duration-500 fill-mode-both ${getRarityStyle(gachaResult.rarity)}`}>
            {/* Glow behind icon */}
            <div className={`absolute inset-0 blur-2xl opacity-40 ${gachaResult.rarity === 'legendary' ? 'bg-game-accent' : gachaResult.rarity === 'epic' ? 'bg-game-secondary' : 'bg-blue-500'}`}></div>
            {/* Render dynamically mapped Lucide Icon */}
            <div className="relative z-10 animate-bounce mt-4">
              {renderIcon(gachaResult.iconName, getRarityStyle(gachaResult.rarity))}
            </div>
          </div>

          <div className="text-center animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both max-w-[80vw]">
            <span className="text-sm font-bold text-game-muted block mb-1">獲得しました！</span>
            <h3 className="text-2xl font-bold text-white tracking-wide mb-3">{gachaResult.label}</h3>
            <div className="flex justify-center gap-3 text-sm">
              {gachaResult.bonusATK > 0 && <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">ATK +{gachaResult.bonusATK}</span>}
              {gachaResult.bonusHP > 0 && <span className="text-game-primary font-bold bg-game-primary/10 px-2 py-0.5 rounded">HP +{gachaResult.bonusHP}</span>}
            </div>
          </div>

          <button 
            onClick={closeGachaModal}
            className="mt-12 w-48 py-3 bg-game-surface border-2 border-game-surface text-white rounded-full font-bold tracking-widest hover:border-game-primary hover:text-game-primary transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <X size={20} /> とじる
          </button>
        </div>
      )}
    </div>
  );
}
