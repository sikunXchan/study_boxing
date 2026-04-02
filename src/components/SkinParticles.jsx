import { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';

const SKIN_THEMES = {
  beach_boy: {
    icons: ['Umbrella', 'Sun', 'Waves', 'Anchor', 'Ship', 'Fish'],
    colors: ['#06b6d4', '#0891b2', '#22d3ee', '#7dd3fc', '#bae6fd']
  },
  halloween_pumpkin: {
    icons: ['Ghost', 'Moon', 'Skull', 'Candy', 'Cat', 'Graveyard'],
    colors: ['#f97316', '#fb923c', '#c026d3', '#8b5cf6', '#4c1d95']
  },
  cyberpunk: {
    icons: ['Cpu', 'Zap', 'Hash', 'Terminal', 'Database', 'Activity'],
    colors: ['#e879f9', '#d946ef', '#22d3ee', '#10b981', '#f43f5e']
  },
  awakened: {
    icons: ['Infinity', 'Crown', 'Star', 'Sparkles', 'Trophy', 'Medal'],
    colors: ['#facc15', '#fde047', '#fbbf24', '#fef9c3', '#ffffff']
  },
  default: {
    icons: ['Star', 'Heart', 'Gem', 'Sparkles', 'Zap', 'Crown'],
    colors: ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
  }
};

export default function SkinParticles({ activeSkin }) {
  const [particles, setParticles] = useState([]);
  const idCounter = useRef(0);

  useEffect(() => {
    if (!activeSkin) {
      setParticles([]);
      return;
    }

    const theme = SKIN_THEMES[activeSkin] || SKIN_THEMES.default;

    // Spawn particles at interval
    const spawnInterval = setInterval(() => {
      const newParticle = {
        id: idCounter.current++,
        icon: theme.icons[Math.floor(Math.random() * theme.icons.length)],
        color: theme.colors[Math.floor(Math.random() * theme.colors.length)],
        x: Math.random() * 100, // % from left
        size: 10 + Math.random() * 14, // 10-24px
        duration: 4 + Math.random() * 4, // 4-8s
        delay: Math.random() * 0.5,
        sway: -30 + Math.random() * 60, // horizontal sway px
        rotation: Math.random() * 360,
      };

      setParticles(prev => {
        const updated = [...prev, newParticle];
        // Limit to 18 particles max for performance
        if (updated.length > 18) {
          return updated.slice(-18);
        }
        return updated;
      });
    }, 600);

    // Cleanup dead particles periodically
    const cleanupInterval = setInterval(() => {
      setParticles(prev => prev.slice(-18));
    }, 10000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(cleanupInterval);
    };
  }, [activeSkin]);

  if (!activeSkin || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden">
      {particles.map(particle => {
        const IconComp = LucideIcons[particle.icon] || LucideIcons.Star;
        return (
          <div
            key={particle.id}
            className="absolute animate-skin-particle-fall"
            style={{
              left: `${particle.x}%`,
              top: '-30px',
              '--sway-x': `${particle.sway}px`,
              '--fall-duration': `${particle.duration}s`,
              '--fall-delay': `${particle.delay}s`,
              '--spin-deg': `${particle.rotation}deg`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            <IconComp
              size={particle.size}
              style={{
                color: particle.color,
                filter: `drop-shadow(0 0 6px ${particle.color}80)`,
                opacity: 0.7,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
