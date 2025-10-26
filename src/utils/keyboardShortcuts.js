/**
 * Universal Keyboard Shortcuts Manager
 * Handles global keyboard shortcuts across all game modes
 */
import { useGameStore } from '../hooks/useGameStore';
import { togglePerformanceOverlay } from './perfMonitor';
import { updateAudioSettings, getAudioSettings } from '../audio/AudioEngine';
export class KeyboardShortcutManager {
    constructor() {
        Object.defineProperty(this, "shortcuts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "isListening", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    static getInstance() {
        if (!KeyboardShortcutManager.instance) {
            KeyboardShortcutManager.instance = new KeyboardShortcutManager();
        }
        return KeyboardShortcutManager.instance;
    }
    // ═════════════════════════════════════════════════════════
    // SHORTCUT MANAGEMENT
    // ═════════════════════════════════════════════════════════
    registerShortcut(shortcut) {
        const key = this.getShortcutKey(shortcut);
        this.shortcuts.set(key, shortcut);
    }
    unregisterShortcut(id) {
        for (const [key, shortcut] of this.shortcuts.entries()) {
            if (shortcut.id === id) {
                this.shortcuts.delete(key);
                break;
            }
        }
    }
    enableShortcut(id, enabled = true) {
        for (const shortcut of this.shortcuts.values()) {
            if (shortcut.id === id) {
                shortcut.enabled = enabled;
                break;
            }
        }
    }
    isShortcutEnabled(id) {
        for (const shortcut of this.shortcuts.values()) {
            if (shortcut.id === id) {
                return shortcut.enabled;
            }
        }
        return false;
    }
    // ═════════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═════════════════════════════════════════════════════════
    startListening() {
        if (this.isListening)
            return;
        this.isListening = true;
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        // Register default shortcuts
        this.registerDefaultShortcuts();
    }
    stopListening() {
        if (!this.isListening)
            return;
        this.isListening = false;
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
    handleKeyDown(event) {
        const shortcut = this.getMatchingShortcut(event);
        if (!shortcut || !shortcut.enabled)
            return;
        event.preventDefault();
        shortcut.action();
    }
    handleKeyUp(event) {
        // Handle key release if needed for any shortcuts
    }
    getMatchingShortcut(event) {
        const key = event.key.toLowerCase();
        const modifiers = [];
        if (event.ctrlKey)
            modifiers.push('ctrl');
        if (event.shiftKey)
            modifiers.push('shift');
        if (event.altKey)
            modifiers.push('alt');
        // Find exact match
        for (const shortcut of this.shortcuts.values()) {
            if (!shortcut.enabled)
                continue;
            if (!shortcut.global) {
                // Only check global shortcuts if mode-specific ones shouldn't trigger
                continue;
            }
            if (this.matchesShortcut(shortcut, key, modifiers)) {
                return shortcut;
            }
        }
        return null;
    }
    matchesShortcut(shortcut, key, modifiers) {
        if (shortcut.key !== key)
            return false;
        const shortcutModifiers = shortcut.modifiers || [];
        if (shortcutModifiers.length !== modifiers.length)
            return false;
        return modifiers.every(mod => shortcutModifiers.includes(mod));
    }
    getShortcutKey(shortcut) {
        const modifiers = (shortcut.modifiers || []).sort().join('+');
        return `${modifiers}+${shortcut.key}`.toLowerCase();
    }
    // ═════════════════════════════════════════════════════════
    // DEFAULT SHORTCUTS
    // ═════════════════════════════════════════════════════════
    registerDefaultShortcuts() {
        const { setMode, returnToMenu, toggleSettingsPanel } = useGameStore.getState();
        // Global shortcuts (work in all modes)
        this.registerShortcut({
            id: 'escape',
            key: 'escape',
            action: () => {
                const { currentMode } = useGameStore.getState();
                if (currentMode === 'title') {
                    // ESC on title screen does nothing
                    return;
                }
                // Trigger escape action (mode-specific)
                const escapeShortcut = this.shortcuts.get('escape');
                if (escapeShortcut && escapeShortcut.enabled) {
                    // Let the current mode handle escape
                }
            },
            description: 'Back/Exit',
            enabled: true,
            global: true,
        });
        this.registerShortcut({
            id: 'mute',
            key: 'm',
            action: () => {
                const settings = getAudioSettings();
                updateAudioSettings({ soundEnabled: !settings.soundEnabled });
            },
            description: 'Mute/Unmute Audio',
            enabled: true,
            global: true,
        });
        this.registerShortcut({
            id: 'fullscreen',
            key: 'f11',
            action: () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                else {
                    document.documentElement.requestFullscreen();
                }
            },
            description: 'Toggle Fullscreen',
            enabled: true,
            global: true,
        });
        this.registerShortcut({
            id: 'performance',
            key: 'f3',
            action: () => {
                togglePerformanceOverlay();
            },
            description: 'Toggle Performance Overlay',
            enabled: true,
            global: true,
        });
        this.registerShortcut({
            id: 'settings',
            key: 'tab',
            modifiers: ['shift'],
            action: () => {
                toggleSettingsPanel();
            },
            description: 'Open Settings',
            enabled: true,
            global: true,
        });
        // Menu shortcuts
        this.registerShortcut({
            id: 'return_to_menu',
            key: 'q',
            action: () => {
                returnToMenu();
            },
            description: 'Return to Menu',
            enabled: true,
            global: false, // Mode-specific
        });
        // Number keys for quick selection
        for (let i = 1; i <= 9; i++) {
            this.registerShortcut({
                id: `number_${i}`,
                key: i.toString(),
                action: () => {
                    // Mode-specific number actions handled by individual modes
                    console.log(`Number ${i} pressed`);
                },
                description: `Number ${i}`,
                enabled: true,
                global: false,
            });
        }
    }
    // ═════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═════════════════════════════════════════════════════════
    getAllShortcuts() {
        return Array.from(this.shortcuts.values());
    }
    getShortcutsByType(globalOnly = true) {
        const shortcuts = this.getAllShortcuts();
        return {
            global: shortcuts.filter(s => s.global === globalOnly),
            modeSpecific: shortcuts.filter(s => s.global === false),
        };
    }
    formatShortcutKey(shortcut) {
        const keyMap = {
            'escape': 'ESC',
            'enter': 'ENTER',
            ' ': 'SPACE',
            'arrowup': '↑',
            'arrowdown': '↓',
            'arrowleft': '←',
            'arrowright': '→',
            'f11': 'F11',
            'f3': 'F3',
            'tab': 'TAB',
        };
        const key = keyMap[shortcut.key] || shortcut.key.toUpperCase();
        const modifiers = shortcut.modifiers || [];
        const modifierMap = {
            'ctrl': 'Ctrl',
            'shift': 'Shift',
            'alt': 'Alt',
        };
        const modifierStr = modifiers.map(mod => modifierMap[mod]).join('+');
        return modifierStr ? `${modifierStr}+${key}` : key;
    }
    // ═════════════════════════════════════════════════════════
    // CLEANUP
    // ═════════════════════════════════════════════════════════
    dispose() {
        this.stopListening();
        this.shortcuts.clear();
    }
}
// ═════════════════════════════════════════════════════════
// GLOBAL INSTANCE AND EXPORTS
// ═══════════════════════════════════════════════════════════
export const keyboardManager = KeyboardShortcutManager.getInstance();
// Convenience functions
export function startKeyboardShortcuts() {
    keyboardManager.startListening();
}
export function stopKeyboardShortcuts() {
    keyboardManager.stopListening();
}
export function registerShortcut(shortcut) {
    keyboardManager.registerShortcut(shortcut);
}
export function enableShortcut(id, enabled = true) {
    keyboardManager.enableShortcut(id, enabled);
}
export function getAllShortcuts() {
    return keyboardManager.getAllShortcuts();
}
