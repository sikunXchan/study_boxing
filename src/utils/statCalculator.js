export function calculateTotalStats(inventory, equippedItems, facilities = { training: 0 }) {
    let baseBonusATK = 0;
    let baseBonusHP = 0;
    const passives = new Set();
    
    // 1. Check pet setup constraints
    let pet = null;
    let collarMultiplierATK = 1.0;
    let collarMultiplierHP = 1.0;
    let toyMultiplierATK = 1.0;
    let toyMultiplierHP = 1.0;

    const equippedPetId = equippedItems.pet_entity;
    if (equippedPetId) {
       pet = inventory.find(i => i.id === equippedPetId);
       if (pet && pet.passive) {
         passives.add(pet.passive);
         
         // Apply pet-specific gear multipliers based on their passive!
         switch(pet.passive) {
            case 'pet_toy_boost_1.2':
              toyMultiplierHP = 1.2;
              break;
            case 'pet_collar_boost_1.2':
              collarMultiplierATK = 1.2;
              break;
            case 'pet_gear_boost_1.3':
              collarMultiplierATK = 1.3;
              collarMultiplierHP = 1.3;
              toyMultiplierATK = 1.3;
              toyMultiplierHP = 1.3;
              break;
            case 'pet_gear_boost_1.5':
              collarMultiplierATK = 1.5;
              collarMultiplierHP = 1.5;
              toyMultiplierATK = 1.5;
              toyMultiplierHP = 1.5;
              break;
            default: break;
         }
       }
    }
    
    // Calculate stats from Collection Bonus
    let passiveBonusATK = 0;
    let passiveBonusHP = 0;
    const equippedItemIds = new Set(Object.values(equippedItems).filter(Boolean));

    inventory.forEach(item => {
      const isGear = item.type !== 'pet_entity';
      const isMax = (item.upgradeLevel || 0) >= 4;
      const isCollectionItem = (isMax || (item.awakened || 0) > 0 || item.rarity === 'god');

      if (isCollectionItem) {
         const upgradeFactor = Math.pow(isGear ? 1.5 : 1.1, item.upgradeLevel || 0);
         const awakeFactor = 1 + (item.awakened || 0) * (isGear ? 0.2 : 0.1);
         passiveBonusATK += Math.floor((item.bonusATK || 0) * upgradeFactor * awakeFactor);
         passiveBonusHP += Math.floor((item.bonusHP || 0) * upgradeFactor * awakeFactor);
      }
    });
    
    equippedItemIds.forEach(itemId => {
      const item = inventory.find(i => i.id === itemId);
      if (item) {
        const isGear = item.type !== 'pet_entity';
        const upgradeFactor = Math.pow(isGear ? 1.5 : 1.1, item.upgradeLevel || 0);
        const awakeFactor = 1 + (item.awakened || 0) * (isGear ? 0.2 : 0.1);

        let finalItemATK = Math.floor((item.bonusATK || 0) * upgradeFactor * awakeFactor);
        let finalItemHP = Math.floor((item.bonusHP || 0) * upgradeFactor * awakeFactor);

        if (item.type === 'collar') {
           finalItemATK = Math.floor(finalItemATK * collarMultiplierATK);
           finalItemHP = Math.floor(finalItemHP * collarMultiplierHP);
        } else if (item.type === 'toy') {
           finalItemATK = Math.floor(finalItemATK * toyMultiplierATK);
           finalItemHP = Math.floor(finalItemHP * toyMultiplierHP);
        }

        baseBonusATK += finalItemATK;
        baseBonusHP += finalItemHP;
      }
    });

    const trainingMultiplier = 1 + (facilities.training || 0) * 0.05;
    const totalATK = Math.floor((baseBonusATK + passiveBonusATK) * trainingMultiplier);
    const totalHP = baseBonusHP + passiveBonusHP;

    return { 
      bonusATK: totalATK, 
      bonusHP: totalHP, 
      activePassives: Array.from(passives),
      activePet: pet,
      rawPassiveATK: passiveBonusATK,
      rawPassiveHP: passiveBonusHP
    };
}
