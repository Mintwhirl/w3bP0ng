import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Settings Panel Component
 * Modal panel for game settings (sound, theme, etc.)
 */
import { useGameStore } from '../hooks/useGameStore';
import { THEMES } from '../rendering/types';
import './SettingsPanel.css';
export default function SettingsPanel() {
    const { settingsPanelOpen, soundEnabled, currentTheme, toggleSound, setTheme, toggleSettingsPanel } = useGameStore();
    if (!settingsPanelOpen) {
        return null;
    }
    const themeOptions = Object.keys(THEMES);
    return (_jsx("div", { className: "settings-overlay", onClick: toggleSettingsPanel, children: _jsxs("div", { className: "settings-panel", onClick: (e) => e.stopPropagation(), role: "dialog", "aria-labelledby": "settings-title", "aria-modal": "true", children: [_jsxs("header", { className: "settings-header", children: [_jsx("h2", { id: "settings-title", className: "settings-title", children: "Settings" }), _jsx("button", { className: "settings-close", onClick: toggleSettingsPanel, "aria-label": "Close settings", children: "\u2715" })] }), _jsxs("div", { className: "settings-content", children: [_jsxs("div", { className: "settings-section", children: [_jsx("h3", { className: "settings-section-title", children: "Audio" }), _jsxs("label", { className: "settings-toggle", children: [_jsx("span", { className: "settings-label", children: "Sound Effects" }), _jsx("button", { className: `toggle-button ${soundEnabled ? 'toggle-button--on' : 'toggle-button--off'}`, onClick: toggleSound, "aria-label": `Sound ${soundEnabled ? 'enabled' : 'disabled'}`, "aria-pressed": soundEnabled, children: _jsx("span", { className: "toggle-slider" }) })] })] }), _jsxs("div", { className: "settings-section", children: [_jsx("h3", { className: "settings-section-title", children: "Visual Theme" }), _jsx("div", { className: "theme-selector", children: themeOptions.map((themeId) => {
                                        const theme = THEMES[themeId];
                                        if (!theme)
                                            return null;
                                        const isActive = currentTheme === themeId;
                                        return (_jsxs("button", { className: `theme-option ${isActive ? 'theme-option--active' : ''}`, onClick: () => setTheme(themeId), "aria-label": `Select ${theme.name} theme`, "aria-pressed": isActive, children: [_jsx("div", { className: "theme-preview", style: {
                                                        background: `linear-gradient(135deg, ${theme.paddle.left.color}, ${theme.paddle.right.color})`
                                                    } }), _jsx("span", { className: "theme-name", children: theme.name }), isActive && _jsx("span", { className: "theme-checkmark", children: "\u2713" })] }, themeId));
                                    }) })] }), _jsxs("div", { className: "settings-section", children: [_jsx("h3", { className: "settings-section-title", children: "About" }), _jsxs("p", { className: "settings-info", children: [_jsx("strong", { children: "w3bP0ng v0.1.0" }), _jsx("br", {}), "A modern multi-mode web game showcasing professional TypeScript, React, and WebGL development."] })] })] })] }) }));
}
