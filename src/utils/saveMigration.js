/**
 * Save Data Migration System
 * 
 * Ensures that save data is NEVER lost across app updates.
 * When new fields are added to the game, they are automatically
 * filled with default values without overwriting existing data.
 */

const CURRENT_SAVE_VERSION = 2;
const SAVE_VERSION_KEY = 'gemini_survivor_save_version';

// All localStorage keys used by the game
const GAME_KEYS = [
  'gemini_survivor_stats',
  'gemini_survivor_inventory',
  'gemini_survivor_equipped',
  'gemini_survivor_resources',
  'gemini_survivor_quests',
  'gemini_survivor_pethunt',
  'gemini_survivor_epic_quests',
];

// Default values for each key (must match App.jsx initial values)
const DEFAULTS = {
  gemini_survivor_stats: { atk: 0, hp: 0 },
  gemini_survivor_inventory: [],
  gemini_survivor_equipped: {
    weapon: null,
    armor: null,
    necklace: null,
    gloves: null,
    belt: null,
    boots: null,
    collar: null,
    toy: null,
    pet_entity: null
  },
  gemini_survivor_resources: { stamina: 0, coins: 0, gems: 0 },
  gemini_survivor_quests: [],
  gemini_survivor_pethunt: false,
  gemini_survivor_epic_quests: [],
};

/**
 * Safely merge missing keys into an existing object without overwriting.
 */
function safeMerge(existing, defaults) {
  if (typeof defaults !== 'object' || defaults === null || Array.isArray(defaults)) {
    return existing;
  }
  const merged = { ...existing };
  for (const key of Object.keys(defaults)) {
    if (!(key in merged)) {
      merged[key] = defaults[key];
    }
  }
  return merged;
}

/**
 * Migration functions: each migrates from version N to N+1.
 * Add new functions here when the data schema changes.
 * 
 * IMPORTANT: Never delete existing fields. Only ADD new ones.
 */
const migrations = {
  // v0 -> v1: Initial public release - full reset of any dev/test data
  0: () => {
    for (const key of GAME_KEYS) {
      localStorage.removeItem(key);
    }
    // Also remove legacy keys
    localStorage.removeItem('gemini_survivor_notices');
    console.log('[SaveMigration] v0->v1: Cleared all dev data for initial release.');
  },
  // v1 -> v2: Forced reset for production release
  1: () => {
    for (const key of GAME_KEYS) {
      localStorage.removeItem(key);
    }
    console.log('[SaveMigration] v1->v2: Forced production reset complete.');
  },
};

/**
 * Run all necessary migrations from the saved version to the current version.
 * Called once on app startup.
 */
export function runMigration() {
  let savedVersion = 0;
  try {
    const raw = localStorage.getItem(SAVE_VERSION_KEY);
    if (raw !== null) {
      savedVersion = parseInt(raw, 10);
      if (isNaN(savedVersion)) savedVersion = 0;
    }
  } catch (e) {
    console.warn('Migration: Could not read save version:', e);
  }

  if (savedVersion < CURRENT_SAVE_VERSION) {
    console.log(`[SaveMigration] Migrating from v${savedVersion} to v${CURRENT_SAVE_VERSION}...`);
    
    for (let v = savedVersion; v < CURRENT_SAVE_VERSION; v++) {
      if (migrations[v]) {
        try {
          migrations[v]();
          console.log(`[SaveMigration] v${v} -> v${v + 1} complete.`);
        } catch (e) {
          console.error(`[SaveMigration] Error in migration v${v}:`, e);
          // Continue to next migration - never abort and lose data
        }
      }
    }
    
    localStorage.setItem(SAVE_VERSION_KEY, String(CURRENT_SAVE_VERSION));
    console.log(`[SaveMigration] All migrations complete. Now at v${CURRENT_SAVE_VERSION}.`);
  }
}

/**
 * Export all game save data as a JSON object.
 */
export function exportSaveData() {
  const data = {};
  for (const key of GAME_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        data[key] = JSON.parse(raw);
      }
    } catch (e) {
      console.warn(`Export: Could not read key "${key}":`, e);
    }
  }
  data[SAVE_VERSION_KEY] = CURRENT_SAVE_VERSION;
  return data;
}

/**
 * Import save data from a JSON object, overwriting current data.
 */
export function importSaveData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid save data format');
  }
  
  for (const key of GAME_KEYS) {
    if (key in data) {
      try {
        localStorage.setItem(key, JSON.stringify(data[key]));
      } catch (e) {
        console.error(`Import: Could not write key "${key}":`, e);
      }
    }
  }
  
  if (SAVE_VERSION_KEY in data) {
    localStorage.setItem(SAVE_VERSION_KEY, String(data[SAVE_VERSION_KEY]));
  }
}
