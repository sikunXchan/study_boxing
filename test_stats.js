const fs = require('fs');

const inventory = [
  { id: 'A', type: 'weapon', label: 'Item A', rarity: 'normal', bonusATK: 50, bonusHP: 50, upgradeLevel: 4, awakened: 0 },
  { id: 'B', type: 'weapon', label: 'Item B', rarity: 'rare', bonusATK: 500, bonusHP: 500, upgradeLevel: 0, awakened: 0 }
];

function calcStats(equippedItemId) {
  let baseBonusATK = 0;
  let passiveBonusATK = 0;
  
  inventory.forEach(item => {
    const isGear = item.type !== 'pet_entity';
    const isMax = (item.upgradeLevel || 0) >= 4;
    const isCollectionItem = (isMax || (item.awakened || 0) > 0 || item.rarity === 'god');

    if (isCollectionItem) {
       const upgradeFactor = Math.pow(isGear ? 1.5 : 1.1, item.upgradeLevel || 0);
       const awakeFactor = 1 + (item.awakened || 0) * (isGear ? 0.2 : 0.1);
       passiveBonusATK += Math.floor((item.bonusATK || 0) * upgradeFactor * awakeFactor * 0.1);
    }
  });

  const equippedItemIds = [equippedItemId];
  equippedItemIds.forEach(itemId => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      const isGear = item.type !== 'pet_entity';
      const upgradeFactor = Math.pow(isGear ? 1.5 : 1.1, item.upgradeLevel || 0);
      const awakeFactor = 1 + (item.awakened || 0) * (isGear ? 0.2 : 0.1);

      let finalItemATK = Math.floor((item.bonusATK || 0) * upgradeFactor * awakeFactor);
      baseBonusATK += finalItemATK;
    }
  });

  return baseBonusATK + passiveBonusATK;
}

console.log("Equipping A (Collection):", calcStats('A'));
console.log("Equipping B (No Collection):", calcStats('B'));
