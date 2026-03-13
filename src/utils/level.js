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
