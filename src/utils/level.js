export function calculateLevelData(totalExp) {
  let currentLevel = 1;
  let expRemaining = totalExp;
  let expRequiredForNext = 500;

  // Simulate level up curve
  while (expRemaining >= expRequiredForNext) {
    expRemaining -= expRequiredForNext;
    currentLevel++;
    
    // Growth curve: +50 EXP per level, capped at 2000
    if (expRequiredForNext < 2000) {
      expRequiredForNext += 50;
      if (expRequiredForNext > 2000) expRequiredForNext = 2000;
    }
  }

  const progressPercentage = Math.min(100, (expRemaining / expRequiredForNext) * 100);

  return {
    currentLevel,
    currentExpInLevel: expRemaining,
    expRequiredForNext,
    progressPercentage
  };
}

/**
 * V12: Linear Multiplier Logic
 * Multiplier = Level, capped at 100x.
 * Reaches 100x at Level 100 and stays there.
 */
export function calculateMultiplier(level) {
  return Math.min(100, level);
}

export const AVATAR_RANKS = [
  { id: 1, name: '生徒', reqLevel: 1, reqAtk: 0, icon: 'User' },
  { id: 2, name: '見習い剣士', reqLevel: 5, reqAtk: 10000, icon: 'UserCheck' },
  { id: 3, name: '熟練の戦士', reqLevel: 10, reqAtk: 100000, icon: 'Swords' },
  { id: 4, name: '騎士', reqLevel: 20, reqAtk: 1000000, icon: 'Shield' },
  { id: 5, name: 'ソードマスター', reqLevel: 40, reqAtk: 2000000, icon: 'Sword' },
  { id: 6, name: '勇者', reqLevel: 80, reqAtk: 4000000, icon: 'Crown' }
];

export const SKINS = [
  { id: 'beach_boy', name: 'ビーチボーイ（水着）', condition: '総ATK 500万以上', icon: 'Umbrella', checkUnlock: (stats) => stats.atk >= 5000000,
    theme: { primary: '#06b6d4', primaryRgb: '6, 182, 212', neon: '0 0 10px rgba(6,182,212,0.5), 0 0 20px rgba(6,182,212,0.3)', bg: '#0c1a2e' } },
  { id: 'halloween_pumpkin', name: 'ハロウィンパンプキン', condition: '総HP 500万以上', icon: 'Ghost', checkUnlock: (stats) => stats.hp >= 5000000,
    theme: { primary: '#f97316', primaryRgb: '249, 115, 22', neon: '0 0 10px rgba(249,115,22,0.5), 0 0 20px rgba(249,115,22,0.3)', bg: '#1a0f05' } },
  { id: 'cyberpunk', name: 'サイバーパンク', condition: '総レベル100以上', icon: 'Cpu', checkUnlock: (stats, level) => level >= 100,
    theme: { primary: '#e879f9', primaryRgb: '232, 121, 249', neon: '0 0 10px rgba(232,121,249,0.5), 0 0 20px rgba(232,121,249,0.3)', bg: '#1a0a1e' } },
  { id: 'awakened', name: '覚醒者 (Awakened)', condition: '転生1回以上', icon: 'Infinity', checkUnlock: (stats, level, reincarnations) => reincarnations >= 1,
    theme: { primary: '#facc15', primaryRgb: '250, 204, 21', neon: '0 0 10px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.3)', bg: '#1a1505' } },
  { id: 'valkyrie', name: 'ヴァルキリー', condition: '総ATK 1000万以上', icon: 'Zap', checkUnlock: (stats) => stats.atk >= 10000000, specialEffect: 'gold_strike',
    theme: { primary: '#fde047', primaryRgb: '253, 224, 71', neon: '0 0 15px rgba(253,224,71,0.6)', bg: '#1e1b03' } },
  { id: 'behemoth', name: 'ベヒーモス', condition: '総HP 1000万以上', icon: 'ShieldAlert', checkUnlock: (stats) => stats.hp >= 10000000, specialEffect: 'earthquake',
    theme: { primary: '#ef4444', primaryRgb: '239, 68, 68', neon: '0 0 15px rgba(239,68,68,0.6)', bg: '#1e0303' } },
  { id: 'demigod', name: '半神 (Demigod)', condition: '総合 3000万以上', icon: 'Sun', checkUnlock: (stats) => (stats.atk + stats.hp) >= 30000000, specialEffect: 'aura_flare',
    theme: { primary: '#38bdf8', primaryRgb: '56, 189, 248', neon: '0 0 20px rgba(56,189,248,0.7)', bg: '#081a2e' } },
  { id: 'overlord', name: 'オーバーロード', condition: '総合 5000万以上', icon: 'Skull', checkUnlock: (stats) => (stats.atk + stats.hp) >= 50000000, specialEffect: 'void_burst',
    theme: { primary: '#a855f7', primaryRgb: '168, 85, 247', neon: '0 0 25px rgba(168,85,247,0.8)', bg: '#0f051a' } }
];
