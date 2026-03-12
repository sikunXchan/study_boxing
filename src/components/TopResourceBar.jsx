import { Zap, Coins, Gem } from 'lucide-react';

export default function TopResourceBar({ resources }) {
  return (
    <header className="h-16 bg-game-surface border-b border-game-surface/50 flex items-center justify-between px-4 shadow-lg sticky top-0 z-50">
      
      {/* Stamina/SNS Time */}
      <div className="flex items-center space-x-2 bg-game-bg/80 rounded-full px-3 py-1 border border-game-primary/30">
        <div className="bg-game-primary p-1 rounded-full shadow-neon">
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-bold text-game-primary drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">
          {resources.stamina}m
        </span>
      </div>

      {/* Currency Section */}
      <div className="flex space-x-3">
        {/* Coins */}
        <div className="flex items-center space-x-1.5 bg-game-bg/80 rounded-full pr-3 pl-1 py-1 border border-[#fbbf24]/30">
          <div className="bg-[#fbbf24] p-1 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]">
            <Coins size={14} className="text-white" />
          </div>
          <span className="font-bold text-[#fbbf24]">{resources.coins}</span>
        </div>

        {/* Gems */}
        <div className="flex items-center space-x-1.5 bg-game-bg/80 rounded-full pr-3 pl-1 py-1 border border-game-secondary/30">
          <div className="bg-game-secondary p-1 rounded-full shadow-neon-purple">
            <Gem size={14} className="text-white" />
          </div>
          <span className="font-bold text-game-secondary">{resources.gems}</span>
        </div>
      </div>
      
    </header>
  );
}
