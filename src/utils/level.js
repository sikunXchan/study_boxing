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
    theme: { primary: '#facc15', primaryRgb: '250, 204, 21', neon: '0 0 10px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.3)', bg: '#1a1505' } }
];
