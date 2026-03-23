import fs from 'fs';

const inventory = [
  { id: '1', label: 'Item A', type: 'weapon', rarity: 'normal', bonusATK: 50, bonusHP: 50, upgradeLevel: 4, awakened: 0 },
  { id: '2', label: 'Item B', type: 'weapon', rarity: 'rare', bonusATK: 300, bonusHP: 300, upgradeLevel: 0, awakened: 0 }
];

function calcStats(equippedItemId) {
  let baseBonusATK = 0;
  let passiveBonusATK = 0;
  
  const equippedItems = { weapon: equippedItemId };
  const equippedItemIds = new Set(Object.values(equippedItems).filter(Boolean));

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

  return { baseBonusATK, passiveBonusATK, total: baseBonusATK + passiveBonusATK };
}

console.log("Stats with A (Collection):", calcStats('1'));
console.log("Stats with B (No Collection):", calcStats('2'));
