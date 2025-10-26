/**
 * Level Data Storage
 * Handles saving, loading, and managing custom levels with localStorage
 */
import { validateLevel } from './LevelEditorEngine';
// ═══════════════════════════════════════════════════════════
// STORAGE KEYS AND CONFIGURATION
// ═══════════════════════════════════════════════════════════
const STORAGE_KEY = 'w3bp0ng_levels';
const STORAGE_VERSION = '1.0.0';
const MAX_LEVELS = 100; // Maximum number of custom levels
const BACKUP_KEY = 'w3bp0ng_levels_backup';
// ═══════════════════════════════════════════════════════════
// STORAGE INITIALIZATION
// ═══════════════════════════════════════════════════════════
export function initializeStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // Create empty storage
            const emptyStorage = {
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
        const storage = JSON.parse(stored);
        // Validate and migrate storage format
        return migrateStorage(storage);
    }
    catch (error) {
        console.error('Failed to initialize level storage:', error);
        // Try to restore from backup
        try {
            const backup = localStorage.getItem(BACKUP_KEY);
            if (backup) {
                const backupStorage = JSON.parse(backup);
                saveStorage(backupStorage);
                return backupStorage;
            }
        }
        catch (backupError) {
            console.error('Failed to restore from backup:', backupError);
        }
        // Fallback to empty storage
        return initializeStorage();
    }
}
function migrateStorage(storage) {
    // Handle different storage versions and migrations
    if (storage.version === STORAGE_VERSION) {
        return storage;
    }
    // Add migration logic here for future versions
    const migratedStorage = {
        levels: storage.levels || {},
        metadata: {
            totalLevels: storage.metadata?.totalLevels || 0,
            lastModified: storage.metadata?.lastModified || Date.now(),
            version: STORAGE_VERSION,
        },
    };
    saveStorage(migratedStorage);
    return migratedStorage;
}
function saveStorage(storage) {
    try {
        // Create backup before saving
        const current = localStorage.getItem(STORAGE_KEY);
        if (current) {
            localStorage.setItem(BACKUP_KEY, current);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    }
    catch (error) {
        console.error('Failed to save storage:', error);
        throw new Error('Storage save failed: ' + error);
    }
}
// ═══════════════════════════════════════════════════════════
// LEVEL MANAGEMENT
// ═══════════════════════════════════════════════════════════
export function saveLevel(name, level) {
    try {
        const storage = initializeStorage();
        // Check if we've reached the maximum number of levels
        if (Object.keys(storage.levels).length >= MAX_LEVELS && !storage.levels[name]) {
            throw new Error(`Cannot save level: maximum of ${MAX_LEVELS} custom levels reached`);
        }
        // Validate level before saving
        const validation = validateLevel(level);
        if (!validation.valid) {
            throw new Error('Level validation failed: ' + validation.errors.join(', '));
        }
        // Update metadata
        const metadata = {
            ...level.metadata,
            name: name.trim(),
            modified: Date.now(),
        };
        // Prepare level for storage
        const storageLevel = {
            ...level,
            metadata,
        };
        // Save to storage
        storage.levels[name] = storageLevel;
        storage.metadata.totalLevels = Object.keys(storage.levels).length;
        storage.metadata.lastModified = Date.now();
        saveStorage(storage);
        return true;
    }
    catch (error) {
        console.error('Failed to save level:', error);
        return false;
    }
}
export function loadLevel(name) {
    try {
        const storage = initializeStorage();
        const level = storage.levels[name];
        if (!level) {
            return null;
        }
        // Validate loaded level
        const validation = validateLevel(level);
        if (!validation.valid) {
            console.warn('Loaded level has validation errors:', validation.errors);
        }
        return level;
    }
    catch (error) {
        console.error('Failed to load level:', error);
        return null;
    }
}
export function deleteLevel(name) {
    try {
        const storage = initializeStorage();
        if (!storage.levels[name]) {
            return false; // Level doesn't exist
        }
        delete storage.levels[name];
        storage.metadata.totalLevels = Object.keys(storage.levels).length;
        storage.metadata.lastModified = Date.now();
        saveStorage(storage);
        return true;
    }
    catch (error) {
        console.error('Failed to delete level:', error);
        return false;
    }
}
export function listLevels() {
    try {
        const storage = initializeStorage();
        const levels = Object.entries(storage.levels).map(([name, level]) => ({
            name,
            metadata: level.metadata,
        }));
        // Sort by modified date (most recent first)
        levels.sort((a, b) => b.metadata.modified - a.metadata.modified);
        return levels;
    }
    catch (error) {
        console.error('Failed to list levels:', error);
        return [];
    }
}
export function getLevelCount() {
    try {
        const storage = initializeStorage();
        return storage.metadata.totalLevels;
    }
    catch (error) {
        console.error('Failed to get level count:', error);
        return 0;
    }
}
export function levelExists(name) {
    try {
        const storage = initializeStorage();
        return name in storage.levels;
    }
    catch (error) {
        console.error('Failed to check level existence:', error);
        return false;
    }
}
export function renameLevel(oldName, newName) {
    try {
        if (oldName === newName) {
            return true;
        }
        const storage = initializeStorage();
        if (!storage.levels[oldName]) {
            throw new Error('Source level does not exist');
        }
        if (storage.levels[newName]) {
            throw new Error('Target level name already exists');
        }
        // Move level to new name
        storage.levels[newName] = storage.levels[oldName];
        storage.levels[newName].metadata.name = newName.trim();
        storage.levels[newName].metadata.modified = Date.now();
        delete storage.levels[oldName];
        saveStorage(storage);
        return true;
    }
    catch (error) {
        console.error('Failed to rename level:', error);
        return false;
    }
}
// ═══════════════════════════════════════════════════════════
// IMPORT/EXPORT FUNCTIONALITY
// ═══════════════════════════════════════════════════════════
export function exportLevel(name, options = {}) {
    try {
        const level = loadLevel(name);
        if (!level) {
            throw new Error('Level not found');
        }
        const exportData = {
            levelData: level.levelData,
            metadata: level.metadata,
        };
        if (options.includeEditorState) {
            exportData.editorState = level.editorState;
        }
        exportData.exportVersion = STORAGE_VERSION;
        exportData.exportDate = new Date().toISOString();
        const jsonString = JSON.stringify(exportData, null, options.pretty ? 2 : 0);
        return jsonString;
    }
    catch (error) {
        console.error('Failed to export level:', error);
        return null;
    }
}
export function importLevel(levelData, name) {
    try {
        const data = JSON.parse(levelData);
        // Validate import data structure
        if (!data.levelData || !data.metadata) {
            return {
                success: false,
                errors: ['Invalid level data format'],
            };
        }
        // Create custom level object
        const customLevel = {
            levelData: data.levelData,
            metadata: {
                ...data.metadata,
                id: generateLevelId(),
                name: (name || data.metadata.name || 'Imported Level').trim(),
                created: Date.now(),
                modified: Date.now(),
                version: STORAGE_VERSION,
            },
            editorState: data.editorState || undefined,
        };
        // Validate the imported level
        const validation = validateLevel(customLevel);
        if (!validation.valid) {
            return {
                success: false,
                errors: validation.errors,
            };
        }
        // Ensure unique name
        let finalName = customLevel.metadata.name;
        let counter = 1;
        while (levelExists(finalName)) {
            finalName = `${customLevel.metadata.name} (${counter})`;
            counter++;
        }
        customLevel.metadata.name = finalName;
        // Save the imported level
        const success = saveLevel(finalName, customLevel);
        return {
            success,
            level: success ? customLevel : undefined,
            errors: success ? [] : ['Failed to save imported level'],
        };
    }
    catch (error) {
        console.error('Failed to import level:', error);
        return {
            success: false,
            errors: ['Invalid JSON format or corrupted level data'],
        };
    }
}
export function exportAllLevels() {
    try {
        const storage = initializeStorage();
        const exportData = {
            levels: storage.levels,
            metadata: storage.metadata,
            exportVersion: STORAGE_VERSION,
            exportDate: new Date().toISOString(),
            totalLevels: Object.keys(storage.levels).length,
        };
        return JSON.stringify(exportData, null, 2);
    }
    catch (error) {
        console.error('Failed to export all levels:', error);
        return null;
    }
}
export function importAllLevels(exportData) {
    try {
        const data = JSON.parse(exportData);
        if (!data.levels || !data.metadata) {
            return {
                success: false,
                imported: 0,
                errors: ['Invalid export data format'],
            };
        }
        let imported = 0;
        const errors = [];
        for (const [name, level] of Object.entries(data.levels)) {
            try {
                // Generate new ID to avoid conflicts
                const customLevel = {
                    ...level,
                    metadata: {
                        ...level.metadata,
                        id: generateLevelId(),
                        created: Date.now(),
                        modified: Date.now(),
                    },
                };
                const validation = validateLevel(customLevel);
                if (!validation.valid) {
                    errors.push(`${name}: ${validation.errors.join(', ')}`);
                    continue;
                }
                // Ensure unique name
                let finalName = name;
                let counter = 1;
                while (levelExists(finalName)) {
                    finalName = `${name} (${counter})`;
                    counter++;
                }
                if (saveLevel(finalName, customLevel)) {
                    imported++;
                }
                else {
                    errors.push(`${name}: Failed to save`);
                }
            }
            catch (error) {
                errors.push(`${name}: ${error}`);
            }
        }
        return {
            success: imported > 0,
            imported,
            errors,
        };
    }
    catch (error) {
        console.error('Failed to import all levels:', error);
        return {
            success: false,
            imported: 0,
            errors: ['Invalid JSON format'],
        };
    }
}
// ═══════════════════════════════════════════════════════════
// STORAGE MAINTENANCE
// ═══════════════════════════════════════════════════════════
export function clearAllLevels() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(BACKUP_KEY);
        initializeStorage(); // Reinitialize empty storage
        return true;
    }
    catch (error) {
        console.error('Failed to clear all levels:', error);
        return false;
    }
}
export function getStorageInfo() {
    try {
        const storage = initializeStorage();
        const storageString = localStorage.getItem(STORAGE_KEY) || '{}';
        const usedSpace = new Blob([storageString]).size;
        // Estimate localStorage capacity (usually 5-10MB)
        const maxSpace = 5 * 1024 * 1024; // 5MB
        return {
            usedSpace,
            maxSpace,
            levelCount: storage.metadata.totalLevels,
            version: storage.metadata.version,
        };
    }
    catch (error) {
        console.error('Failed to get storage info:', error);
        return {
            usedSpace: 0,
            maxSpace: 5 * 1024 * 1024,
            levelCount: 0,
            version: STORAGE_VERSION,
        };
    }
}
export function repairStorage() {
    try {
        // Attempt to repair corrupted storage
        const current = localStorage.getItem(STORAGE_KEY);
        if (!current) {
            return true; // Nothing to repair
        }
        try {
            JSON.parse(current);
            return true; // Storage is valid
        }
        catch (parseError) {
            // Storage is corrupted, try backup
            const backup = localStorage.getItem(BACKUP_KEY);
            if (backup) {
                try {
                    JSON.parse(backup);
                    localStorage.setItem(STORAGE_KEY, backup);
                    return true; // Restored from backup
                }
                catch (backupError) {
                    // Backup is also corrupted
                }
            }
        }
        // Both primary and backup are corrupted, reinitialize
        initializeStorage();
        return false;
    }
    catch (error) {
        console.error('Failed to repair storage:', error);
        return false;
    }
}
// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════
function generateLevelId() {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}
export function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
export function createExampleLevel() {
    const now = Date.now();
    return {
        metadata: {
            id: generateLevelId(),
            name: 'Example Level',
            description: 'A sample level demonstrating various features',
            difficulty: 2,
            author: 'W3BP0NG',
            created: now,
            modified: now,
            version: STORAGE_VERSION,
        },
        levelData: {
            id: 0,
            name: 'Example Level',
            description: 'A sample level demonstrating various features',
            difficulty: 2,
            starThresholds: {
                time: 60,
                hits: 25,
            },
            blocks: [
                {
                    x: 100,
                    y: 100,
                    width: 60,
                    height: 20,
                    type: 'normal',
                    health: 1,
                    active: true,
                },
                {
                    x: 200,
                    y: 100,
                    width: 60,
                    height: 20,
                    type: 'target',
                    health: 1,
                    active: true,
                },
                {
                    x: 300,
                    y: 100,
                    width: 60,
                    height: 20,
                    type: 'tough',
                    health: 3,
                    active: true,
                },
            ],
            portals: [
                {
                    id: 'portal1',
                    x: 150,
                    y: 200,
                    radius: 20,
                    linkedTo: 'portal2',
                    color: 'cyan',
                    rotation: 0,
                    active: true,
                },
                {
                    id: 'portal2',
                    x: 450,
                    y: 200,
                    radius: 20,
                    linkedTo: 'portal1',
                    color: 'magenta',
                    rotation: Math.PI,
                    active: true,
                },
            ],
            bouncePads: [
                {
                    x: 250,
                    y: 300,
                    width: 40,
                    height: 10,
                    angle: -Math.PI / 4,
                    power: 1.5,
                },
            ],
            gravityZones: [
                {
                    x: 350,
                    y: 250,
                    width: 120,
                    height: 120,
                    strength: 1.0,
                    direction: 'down',
                },
            ],
            goal: {
                type: 'destroy_targets',
            },
            ballSpeed: 5,
        },
        editorState: undefined, // Will be set when edited
    };
}
