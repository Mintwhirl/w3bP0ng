/**
 * Level Data Storage
 * Handles saving, loading, and managing custom levels with localStorage
 * Now with Zod validation and data protection
 */

import { z } from 'zod';
import { obfuscate, deobfuscate } from '../../utils/CryptoUtils';
import type {
  CustomLevel,
  LevelMetadata,
  LevelStorage,
  ImportResult,
  ExportOptions,
} from './types';
import { validateLevel } from './LevelEditorEngine';

// ═══════════════════════════════════════════════════════════
// ZOD SCHEMAS FOR VALIDATION
// ═══════════════════════════════════════════════════════════

const BlockSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  type: z.enum(['normal', 'tough', 'explosive', 'target', 'immovable', 'swapper']),
  health: z.number(),
  active: z.boolean(),
  color: z.string().optional(),
});

const PortalSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  radius: z.number(),
  linkedTo: z.string(),
  color: z.enum(['cyan', 'magenta', 'green', 'orange']),
  rotation: z.number(),
  active: z.boolean(),
});

const BouncePadSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  angle: z.number(),
  power: z.number(),
});

const GravityZoneSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  strength: z.number(),
  direction: z.enum(['down', 'up', 'left', 'right']),
});

const LevelGoalSchema = z.object({
  type: z.enum(['destroy_all', 'destroy_targets', 'time_limit', 'hit_limit']),
  value: z.number().optional(),
});

const LevelSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  starThresholds: z.object({
    time: z.number().optional(),
    hits: z.number().optional(),
  }),
  blocks: z.array(BlockSchema),
  portals: z.array(PortalSchema),
  bouncePads: z.array(BouncePadSchema).optional(),
  gravityZones: z.array(GravityZoneSchema).optional(),
  goal: LevelGoalSchema,
  ballSpeed: z.number().optional(),
  ballCount: z.number().optional(),
  canvas: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
});

const LevelMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  author: z.string().optional(),
  created: z.number(),
  modified: z.number(),
  version: z.string(),
});

const PlacedObjectSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.any()),
  selected: z.boolean().optional(),
});

const EditorGridSchema = z.object({
  enabled: z.boolean(),
  size: z.number(),
  snap: z.boolean(),
  visible: z.boolean(),
});

const EditorCameraSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
});

const EditorStateSchema = z.object({
  mode: z.enum(['place', 'delete', 'select', 'test']),
  currentTool: z.string(),
  levelMetadata: LevelMetadataSchema,
  placedObjects: z.array(PlacedObjectSchema),
  grid: EditorGridSchema,
  camera: EditorCameraSchema,
  isTestMode: z.boolean(),
  canvas: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export const CustomLevelSchema = z.object({
  metadata: LevelMetadataSchema,
  levelData: LevelSchema,
  editorState: EditorStateSchema.optional(),
});

export const LevelStorageSchema = z.object({
  levels: z.record(z.string(), CustomLevelSchema),
  metadata: z.object({
    totalLevels: z.number(),
    lastModified: z.number(),
    version: z.string(),
  }),
});

// ═══════════════════════════════════════════════════════════
// STORAGE KEYS AND CONFIGURATION
// ═══════════════════════════════════════════════════════════

const STORAGE_KEY = 'w3bp0ng_levels_v2';
const STORAGE_VERSION = '1.0.0';
const MAX_LEVELS = 100;
const BACKUP_KEY = 'w3bp0ng_levels_backup';
const LEGACY_KEY = 'w3bp0ng_levels';

// ═══════════════════════════════════════════════════════════
// STORAGE INITIALIZATION
// ═══════════════════════════════════════════════════════════

export function initializeStorage(): LevelStorage {
  try {
    let rawStorage: any = null;

    // 1. Try modern protected storage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        rawStorage = JSON.parse(deobfuscate(stored));
      } catch (e) {
        console.warn('Modern level storage corrupted');
      }
    }

    // 2. Try backup
    if (!rawStorage) {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        try {
          rawStorage = JSON.parse(deobfuscate(backup));
        } catch (e) {
          console.warn('Level backup corrupted');
        }
      }
    }

    // 3. Try legacy
    if (!rawStorage) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        try {
          rawStorage = JSON.parse(legacy);
          console.log('Migrated legacy level data');
        } catch (e) {
          console.warn('Legacy level data invalid');
        }
      }
    }

    if (!rawStorage) {
      const emptyStorage: LevelStorage = {
        levels: {},
        metadata: {
          totalLevels: 0,
          lastModified: Date.now(),
          version: STORAGE_VERSION,
        },
      };
      saveStorage(emptyStorage);
      return emptyStorage;
    }

    const result = LevelStorageSchema.safeParse(rawStorage);
    if (!result.success) {
      return migrateStorage(rawStorage);
    }

    return result.data;
  } catch (error) {
    console.error('Failed to initialize level storage:', error);
    return {
      levels: {},
      metadata: { totalLevels: 0, lastModified: Date.now(), version: STORAGE_VERSION },
    };
  }
}

function migrateStorage(storage: any): LevelStorage {
  const migratedStorage: LevelStorage = {
    levels: {},
    metadata: {
      totalLevels: 0,
      lastModified: Date.now(),
      version: STORAGE_VERSION,
    },
  };

  if (storage && storage.levels && typeof storage.levels === 'object') {
    Object.entries(storage.levels).forEach(([name, level]: [string, any]) => {
      const result = CustomLevelSchema.safeParse(level);
      if (result.success) {
        migratedStorage.levels[name] = result.data;
      }
    });
  }

  migratedStorage.metadata.totalLevels = Object.keys(migratedStorage.levels).length;
  saveStorage(migratedStorage);
  return migratedStorage;
}

function saveStorage(storage: LevelStorage): void {
  try {
    const result = LevelStorageSchema.safeParse(storage);
    if (!result.success) {
      console.error('Invalid level storage:', result.error);
      return;
    }

    const protectedData = obfuscate(JSON.stringify(result.data));

    // Backup current
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      try {
        localStorage.setItem(BACKUP_KEY, current);
      } catch (e) {}
    }

    try {
      localStorage.setItem(STORAGE_KEY, protectedData);
    } catch (quotaError) {
      if (quotaError instanceof Error && 
          (quotaError.name === 'QuotaExceededError' || quotaError.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        handleQuotaExceeded();
      }
    }
  } catch (error) {
    console.error('Failed to save levels:', error);
  }
}

function handleQuotaExceeded(): void {
  try {
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════
// LEVEL MANAGEMENT (Core logic remains the same, uses saveStorage)
// ═══════════════════════════════════════════════════════════

export function saveLevel(name: string, level: CustomLevel): boolean {
  try {
    const storage = initializeStorage();
    if (Object.keys(storage.levels).length >= MAX_LEVELS && !storage.levels[name]) {
      throw new Error('Max levels reached');
    }

    const zodResult = CustomLevelSchema.safeParse(level);
    if (!zodResult.success) throw new Error('Schema invalid');

    const validatedLevel = zodResult.data;
    const validation = validateLevel(validatedLevel);
    if (!validation.valid) throw new Error('Logic invalid');

    const storageLevel: CustomLevel = {
      ...validatedLevel,
      metadata: { ...validatedLevel.metadata, name: name.trim(), modified: Date.now() },
    };

    storage.levels[name] = storageLevel;
    storage.metadata.totalLevels = Object.keys(storage.levels).length;
    storage.metadata.lastModified = Date.now();

    saveStorage(storage);
    return true;
  } catch (error) {
    console.error('Failed to save level:', error);
    return false;
  }
}

export function loadLevel(name: string): CustomLevel | null {
  try {
    const storage = initializeStorage();
    const level = storage.levels[name];
    if (!level) return null;
    const result = CustomLevelSchema.safeParse(level);
    return result.success ? result.data : null;
  } catch (error) {
    return null;
  }
}

export function deleteLevel(name: string): boolean {
  try {
    const storage = initializeStorage();
    if (!storage.levels[name]) return false;
    delete storage.levels[name];
    storage.metadata.totalLevels = Object.keys(storage.levels).length;
    storage.metadata.lastModified = Date.now();
    saveStorage(storage);
    return true;
  } catch (error) {
    return false;
  }
}

export function listLevels(): { name: string; metadata: LevelMetadata }[] {
  try {
    const storage = initializeStorage();
    return Object.entries(storage.levels)
      .map(([name, level]) => ({ name, metadata: level.metadata }))
      .sort((a, b) => b.metadata.modified - a.metadata.modified);
  } catch (error) {
    return [];
  }
}

export function getLevelCount(): number {
  const storage = initializeStorage();
  return storage.metadata.totalLevels;
}

export function levelExists(name: string): boolean {
  const storage = initializeStorage();
  return name in storage.levels;
}

export function renameLevel(oldName: string, newName: string): boolean {
  try {
    const storage = initializeStorage();
    if (!storage.levels[oldName] || storage.levels[newName]) return false;
    storage.levels[newName] = storage.levels[oldName];
    storage.levels[newName].metadata.name = newName.trim();
    storage.levels[newName].metadata.modified = Date.now();
    delete storage.levels[oldName];
    saveStorage(storage);
    return true;
  } catch (error) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// IMPORT/EXPORT FUNCTIONALITY
// ═══════════════════════════════════════════════════════════

export function exportLevel(name: string, options: ExportOptions = {}): string | null {
  try {
    const level = loadLevel(name);
    if (!level) return null;
    const exportData: any = {
      levelData: level.levelData,
      metadata: level.metadata,
      exportVersion: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
    };
    if (options.includeEditorState) exportData.editorState = level.editorState;
    return JSON.stringify(exportData, null, options.pretty ? 2 : 0);
  } catch (error) {
    return null;
  }
}

export function importLevel(levelData: string, name?: string): ImportResult {
  try {
    const rawData = JSON.parse(levelData);
    if (!rawData.levelData || !rawData.metadata) return { success: false, errors: ['Invalid format'] };

    const customLevel: CustomLevel = {
      levelData: rawData.levelData,
      metadata: {
        ...rawData.metadata,
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: (name || rawData.metadata.name || 'Imported').trim(),
        created: Date.now(),
        modified: Date.now(),
        version: STORAGE_VERSION,
      },
      editorState: rawData.editorState,
    };

    const result = CustomLevelSchema.safeParse(customLevel);
    if (!result.success) return { success: false, errors: [result.error.message] };

    const validated = result.data;
    if (!validateLevel(validated).valid) return { success: false, errors: ['Logic invalid'] };

    let finalName = validated.metadata.name;
    let counter = 1;
    while (levelExists(finalName)) {
      finalName = `${validated.metadata.name} (${counter++})`;
    }
    validated.metadata.name = finalName;

    const success = saveLevel(finalName, validated);
    return { success, errors: success ? [] : ['Save failed'], level: success ? validated : undefined };
  } catch (error) {
    return { success: false, errors: ['Corrupted data'] };
  }
}

export function exportAllLevels(): string | null {
  try {
    const storage = initializeStorage();
    return JSON.stringify({ ...storage, exportDate: new Date().toISOString() }, null, 2);
  } catch (error) {
    return null;
  }
}

export function importAllLevels(exportData: string): { success: boolean; imported: number; errors: string[] } {
  try {
    const data = JSON.parse(exportData);
    if (!data.levels) return { success: false, imported: 0, errors: ['Invalid format'] };
    let imported = 0;
    const errors: string[] = [];

    for (const [name, level] of Object.entries(data.levels)) {
      const result = CustomLevelSchema.safeParse(level);
      if (!result.success) {
        errors.push(`${name}: Invalid`);
        continue;
      }
      if (saveLevel(name, result.data as CustomLevel)) imported++;
      else errors.push(`${name}: Failed`);
    }
    return { success: imported > 0, imported, errors };
  } catch (error) {
    return { success: false, imported: 0, errors: ['Invalid JSON'] };
  }
}

export function clearAllLevels(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

export function getStorageInfo() {
  const storage = initializeStorage();
  const size = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size;
  return { usedSpace: size, maxSpace: 5 * 1024 * 1024, levelCount: storage.metadata.totalLevels, version: STORAGE_VERSION };
}

export function repairStorage(): boolean {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (!current) return true;
    try {
      const parsed = JSON.parse(deobfuscate(current));
      return LevelStorageSchema.safeParse(parsed).success;
    } catch (e) {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        localStorage.setItem(STORAGE_KEY, backup);
        return true;
      }
    }
    initializeStorage();
    return false;
  } catch (error) {
    return false;
  }
}

function generateLevelId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export type { CustomLevel } from './types';

export function createExampleLevel(): CustomLevel {
  const id = generateLevelId();
  return {
    metadata: { id, name: 'Example', description: 'Sample', difficulty: 2, author: 'W3BP0NG', created: Date.now(), modified: Date.now(), version: STORAGE_VERSION },
    levelData: { id: 0, name: 'Example', description: 'Sample', difficulty: 2, starThresholds: { time: 60, hits: 25 }, blocks: [], portals: [], goal: { type: 'destroy_targets' }, ballSpeed: 5 },
    editorState: { mode: 'select', currentTool: 'block-normal', levelMetadata: { id, name: 'Example', description: 'Sample', difficulty: 2, created: Date.now(), modified: Date.now(), version: STORAGE_VERSION }, placedObjects: [], grid: { enabled: true, size: 20, snap: true, visible: true }, camera: { x: 0, y: 0, zoom: 1.0 }, isTestMode: false, canvas: { width: 800, height: 600 } }
  };
}
