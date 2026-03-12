// 30+ UNIQUE ITEMS (Weapons, Necklaces, Gloves, Armor, Belts, Boots)
// Themed around High School Studying & Boxing/Fitness

export const GACHA_POOL = [
  // --- WEAPONS (12 items) ---
  { label: '見習いの木刀', type: 'weapon', iconName: 'Wand', rarity: 'normal', bonusATK: 50, bonusHP: 0, weight: 50 },
  { label: '使い込んだシャープペンシル', type: 'weapon', iconName: 'PenTool', rarity: 'normal', bonusATK: 60, bonusHP: 0, weight: 45 },
  { label: '軽量スキップロープ', type: 'weapon', iconName: 'Orbit', rarity: 'uncommon', bonusATK: 0, bonusHP: 80, weight: 25 },
  { label: '鈍色の鉄アレイ', type: 'weapon', iconName: 'Dumbbell', rarity: 'uncommon', bonusATK: 20, bonusHP: 100, weight: 20 },
  { label: '英単語ターゲット1900', type: 'weapon', iconName: 'Book', rarity: 'rare', bonusATK: 250, bonusHP: 0, weight: 12 },
  { label: 'プロ用ミット', type: 'weapon', iconName: 'HandMetal', rarity: 'rare', bonusATK: 100, bonusHP: 200, weight: 10 },
  { label: '歴戦の赤本', type: 'weapon', iconName: 'BookOpen', rarity: 'epic', bonusATK: 450, bonusHP: 50, weight: 5 },
  { label: '燃えるヘビーサンドバッグ', type: 'weapon', iconName: 'Anchor', rarity: 'epic', bonusATK: 150, bonusHP: 400, weight: 4 },
  { label: '不眠の万年筆', type: 'weapon', iconName: 'ScrollText', rarity: 'legendary', bonusATK: 1000, bonusHP: -100, weight: 1 },
  { label: '覇者のチャンピオンベルト(打撃用)', type: 'weapon', iconName: 'Medal', rarity: 'legendary', bonusATK: 500, bonusHP: 600, weight: 0.8 },
  { label: '魔導士の教科書', type: 'weapon', iconName: 'BookMarked', rarity: 'legendary', bonusATK: 1200, bonusHP: 0, weight: 0.5 },

  // --- ARMOR (10 items) ---
  { label: '指定ジャージ(夏)', type: 'armor', iconName: 'Shirt', rarity: 'normal', bonusATK: 0, bonusHP: 60, weight: 40 },
  { label: 'よれよれのスウェット', type: 'armor', iconName: 'Trello', rarity: 'normal', bonusATK: 0, bonusHP: 70, weight: 35 }, // Replacing Hoodie with Trello since it doesn't exist
  { label: '清潔な学ラン', type: 'armor', iconName: 'GraduationCap', rarity: 'uncommon', bonusATK: 50, bonusHP: 100, weight: 20 },
  { label: '防具付きヘッドギア', type: 'armor', iconName: 'HardHat', rarity: 'uncommon', bonusATK: 0, bonusHP: 180, weight: 15 },
  { label: '集中力を高める白衣', type: 'armor', iconName: 'TestTube', rarity: 'rare', bonusATK: 200, bonusHP: 100, weight: 10 },
  { label: '特注のサウナスーツ', type: 'armor', iconName: 'FlameKindling', rarity: 'rare', bonusATK: 0, bonusHP: 350, weight: 8 },
  { label: 'チタンのヘッドギア', type: 'armor', iconName: 'Hexagon', rarity: 'epic', bonusATK: 50, bonusHP: 600, weight: 4 },
  { label: '賢者のローブ', type: 'armor', iconName: 'Sparkles', rarity: 'epic', bonusATK: 400, bonusHP: 200, weight: 3 },
  { label: '絶対防御のプロテクター', type: 'armor', iconName: 'ShieldCheck', rarity: 'legendary', bonusATK: 100, bonusHP: 1200, weight: 0.8 },
  { label: '全知の学生服', type: 'armor', iconName: 'Award', rarity: 'legendary', bonusATK: 900, bonusHP: 300, weight: 0.5 },

  // --- NECKLACE (6 items) ---
  { label: 'ただの石のペンダント', type: 'necklace', iconName: 'Diamond', rarity: 'normal', bonusATK: 20, bonusHP: 20, weight: 30 },
  { label: '合格祈願のお守り', type: 'necklace', iconName: 'Ticket', rarity: 'uncommon', bonusATK: 80, bonusHP: 30, weight: 15 },
  { label: 'ジムの会員証', type: 'necklace', iconName: 'CreditCard', rarity: 'rare', bonusATK: 30, bonusHP: 150, weight: 10 },
  { label: 'フクロウのペンダント', type: 'necklace', iconName: 'Ghost', rarity: 'epic', bonusATK: 300, bonusHP: 100, weight: 5 },
  { label: '闘神のチョーカー', type: 'necklace', iconName: 'Zap', rarity: 'legendary', bonusATK: 350, bonusHP: 800, weight: 0.8 },
  { label: 'アインシュタインのロケット', type: 'necklace', iconName: 'Atom', rarity: 'legendary', bonusATK: 1050, bonusHP: 0, weight: 0.5 },

  // --- GLOVES (6 items) ---
  { label: '軍手', type: 'gloves', iconName: 'Hand', rarity: 'normal', bonusATK: 20, bonusHP: 30, weight: 30 },
  { label: 'バンテージ', type: 'gloves', iconName: 'Hash', rarity: 'uncommon', bonusATK: 0, bonusHP: 120, weight: 15 },
  { label: '速記用サポーター', type: 'gloves', iconName: 'PenLine', rarity: 'rare', bonusATK: 200, bonusHP: 0, weight: 10 }, // Replacing Signature
  { label: '14オンス・グローブ', type: 'gloves', iconName: 'Target', rarity: 'epic', bonusATK: 150, bonusHP: 400, weight: 5 },
  { label: '鳳凰のバンテージ', type: 'gloves', iconName: 'FireExtinguisher', rarity: 'legendary', bonusATK: 450, bonusHP: 900, weight: 0.8 },
  { label: '神速のタイピンググローブ', type: 'gloves', iconName: 'Keyboard', rarity: 'legendary', bonusATK: 1100, bonusHP: 50, weight: 0.5 },

  // --- BELT (4 items) ---
  { label: '使い古した革ベルト', type: 'belt', iconName: 'GripHorizontal', rarity: 'normal', bonusATK: 25, bonusHP: 25, weight: 25 },
  { label: '重量挙げ用ベルト', type: 'belt', iconName: 'LifeBuoy', rarity: 'uncommon', bonusATK: 30, bonusHP: 120, weight: 15 }, // Replacing Lifesaver
  { label: '集中持続の腹巻き', type: 'belt', iconName: 'Focus', rarity: 'rare', bonusATK: 250, bonusHP: 50, weight: 8 },
  { label: '世界王者のベルト', type: 'belt', iconName: 'Star', rarity: 'legendary', bonusATK: 600, bonusHP: 600, weight: 0.8 },

  // --- BOOTS (4 items) ---
  { label: 'すり減った上履き', type: 'boots', iconName: 'Grip', rarity: 'normal', bonusATK: 0, bonusHP: 40, weight: 25 },
  { label: '陸上シューズ', type: 'boots', iconName: 'FastForward', rarity: 'uncommon', bonusATK: 50, bonusHP: 80, weight: 15 },
  { label: 'プロボクサーシューズ', type: 'boots', iconName: 'TrendingUp', rarity: 'epic', bonusATK: 200, bonusHP: 350, weight: 5 },
  { label: 'ヘルメスの靴', type: 'boots', iconName: 'Zap', rarity: 'legendary', bonusATK: 500, bonusHP: 550, weight: 0.8 }, // ZapFast not exist

  // === PET GEAR (10 items) ===
  // --- COLLAR (5 items) ---
  { label: '布の首輪', type: 'collar', iconName: 'CircleDashed', rarity: 'normal', bonusATK: 15, bonusHP: 15, weight: 20 },
  { label: '鈴付きカラー', type: 'collar', iconName: 'Bell', rarity: 'uncommon', bonusATK: 40, bonusHP: 40, weight: 10 },
  { label: 'スパイクカラー', type: 'collar', iconName: 'TriangleRight', rarity: 'rare', bonusATK: 100, bonusHP: 0, weight: 8 },
  { label: '黄金の首輪', type: 'collar', iconName: 'Coins', rarity: 'epic', bonusATK: 250, bonusHP: 250, weight: 4 },
  { label: '神獣のチョーカー', type: 'collar', iconName: 'Sun', rarity: 'legendary', bonusATK: 600, bonusHP: 600, weight: 0.5 },

  // --- TOY (5 items) ---
  { label: 'ただの木の枝', type: 'toy', iconName: 'Scaling', rarity: 'normal', bonusATK: 0, bonusHP: 30, weight: 20 },
  { label: 'フリスビー', type: 'toy', iconName: 'Disc', rarity: 'uncommon', bonusATK: 60, bonusHP: 20, weight: 10 },
  { label: 'かみかみボーン', type: 'toy', iconName: 'Bone', rarity: 'rare', bonusATK: 0, bonusHP: 150, weight: 8 },
  { label: '知育パズル', type: 'toy', iconName: 'Puzzle', rarity: 'epic', bonusATK: 400, bonusHP: 0, weight: 4 },
  { label: '無限プロテインボール', type: 'toy', iconName: 'Dna', rarity: 'legendary', bonusATK: 0, bonusHP: 900, weight: 0.5 },

  // === PET ENTITY (10 items) ===
  // Pet entities provide base stats that merge infinitely at x1.1 per duplicate. Passives only work while equipped.
  { label: '働きアリ', type: 'pet_entity', iconName: 'Bug', rarity: 'uncommon', bonusATK: 100, bonusHP: 100, weight: 15 },
  { label: '黄金のスカラベ', type: 'pet_entity', iconName: 'Egg', rarity: 'uncommon', bonusATK: 50, bonusHP: 50, weight: 10, passive: 'golden_spirit_15' },
  
  { label: '野良猫', type: 'pet_entity', iconName: 'Cat', rarity: 'rare', bonusATK: 300, bonusHP: 300, weight: 8, passive: 'pet_toy_boost_1.2' },
  { label: '番犬ピットブル', type: 'pet_entity', iconName: 'Dog', rarity: 'rare', bonusATK: 400, bonusHP: 200, weight: 8, passive: 'pet_collar_boost_1.2' }, 
  { label: '働きバチ', type: 'pet_entity', iconName: 'Flower2', rarity: 'rare', bonusATK: 350, bonusHP: 250, weight: 5, passive: 'efficient_learning' },
  
  { label: '賢いフクロウ', type: 'pet_entity', iconName: 'Glasses', rarity: 'epic', bonusATK: 800, bonusHP: 800, weight: 3, passive: 'bunbu_ryodo' }, 
  { label: '忠犬ハチ公', type: 'pet_entity', iconName: 'Navigation', rarity: 'epic', bonusATK: 700, bonusHP: 900, weight: 3, passive: 'golden_spirit_25' }, 
  { label: '野生のグリズリー', type: 'pet_entity', iconName: 'PawPrint', rarity: 'epic', bonusATK: 1200, bonusHP: 400, weight: 2, passive: 'pet_gear_boost_1.3' }, 
  
  { label: '不死鳥', type: 'pet_entity', iconName: 'Flame', rarity: 'legendary', bonusATK: 2000, bonusHP: 2000, weight: 0.8, passive: 'pet_gear_boost_1.5' }, 
  { label: 'ペガサス', type: 'pet_entity', iconName: 'Bird', rarity: 'legendary', bonusATK: 1500, bonusHP: 2500, weight: 0.5, passive: 'tenma_guide' },
];
