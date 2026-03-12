import { Home, ShieldAlert, ShoppingBag } from 'lucide-react';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: '装備', icon: Home },
    { id: 'guild', label: 'ギルド', icon: ShieldAlert },
    { id: 'shop', label: 'ショップ', icon: ShoppingBag },
  ];

  return (
    <nav className="h-20 bg-game-surface border-t border-game-surface/50 flex justify-around items-center px-2 pb-4 pt-2 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-50">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
              isActive ? 'text-game-primary' : 'text-game-muted hover:text-white'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${
              isActive ? 'bg-game-primary/20 shadow-neon scale-110' : 'bg-transparent'
            }`}>
              <Icon size={isActive ? 28 : 24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''} />
            </div>
            <span className={`text-xs font-bold ${isActive ? 'text-game-primary text-shadow-neon' : ''}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
