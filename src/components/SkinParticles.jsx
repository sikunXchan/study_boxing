import { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';

const SKIN_THEMES = {
  beach_boy: {
    icons: ['Umbrella', 'Sun', 'Waves', 'Anchor', 'Ship', 'Fish'],
    colors: ['#06b6d4', '#0891b2', '#22d3ee', '#7dd3fc', '#bae6fd'],
    interval: 250,
    maxParticles: 40
  },
  halloween_pumpkin: {
    icons: ['Ghost', 'Moon', 'Skull', 'Candy', 'Cat', 'Graveyard'],
    colors: ['#f97316', '#fb923c', '#c026d3', '#8b5cf6', '#4c1d95'],
    interval: 250,
    maxParticles: 40
  },
  cyberpunk: {
    icons: ['Cpu', 'Zap', 'Hash', 'Terminal', 'Database', 'Activity'],
    colors: ['#e879f9', '#d946ef', '#22d3ee', '#10b981', '#f43f5e'],
    interval: 250,
    maxParticles: 40
  },
  awakened: {
    icons: ['Infinity', 'Crown', 'Star', 'Sparkles', 'Trophy', 'Medal'],
    colors: ['#facc15', '#fde047', '#fbbf24', '#fef9c3', '#ffffff'],
    interval: 80, // Much faster for Awakened
    maxParticles: 80, // More particles
    glow: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, transparent 70%)'
  },
  default: {
    icons: ['Star', 'Heart', 'Gem', 'Sparkles', 'Zap', 'Crown'],
    colors: ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
    interval: 250,
    maxParticles: 40
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
        size: 8 + Math.random() * 20, // 8-28px
        duration: 3 + Math.random() * 5, // 3-8s
        delay: Math.random() * 0.2,
        sway: -50 + Math.random() * 100, // horizontal sway px
        rotation: Math.random() * 720, // more rotation
        pulse: 0.5 + Math.random() * 1.5, // pulse duration scale
      };

      setParticles(prev => {
        const updated = [...prev, newParticle];
        const max = theme.maxParticles || 40;
        if (updated.length > max) {
          return updated.slice(-max);
        }
        return updated;
      });
    }, theme.interval || 250);

    // Cleanup dead particles periodically
    const cleanupInterval = setInterval(() => {
      setParticles(prev => prev.slice(-40));
    }, 8000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(cleanupInterval);
    };
  }, [activeSkin]);

  if (!activeSkin || (particles.length === 0 && !theme.glow)) return null;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden">
      {theme.glow && (
        <div 
          className="absolute inset-0 animate-pulse duration-[3000ms]" 
          style={{ background: theme.glow }}
        ></div>
      )}
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
