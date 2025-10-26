import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Main Menu Component
 * Landing screen with mode selection and settings
 */
import { useState, useCallback } from 'react';
import { useGameStore, GAME_MODES } from '../hooks/useGameStore';
import { LeftPaddle, RightPaddle } from './DecorativePaddles';
import { EnergyBall } from './EnergyBall';
import { ParticleBackground } from './ParticleBackground';
import './MainMenu.css';
export default function MainMenu() {
    const { setMode, toggleSettingsPanel } = useGameStore();
    const [showAbout, setShowAbout] = useState(false);
    const handleModeSelect = useCallback((modeId, available) => {
        if (available) {
            setMode(modeId);
        }
    }, [setMode]);
    const toggleAbout = useCallback(() => {
        setShowAbout(prev => !prev);
    }, []);
    return (_jsxs("div", { className: "main-menu", children: [_jsx(ParticleBackground, {}), _jsx("div", { className: "decorative-paddle decorative-paddle--left", "aria-hidden": "true", children: _jsx(LeftPaddle, {}) }), _jsx("div", { className: "decorative-paddle decorative-paddle--right", "aria-hidden": "true", children: _jsx(RightPaddle, {}) }), _jsx("div", { className: "floating-ball-container", "aria-hidden": "true", children: _jsx(EnergyBall, {}) }), _jsxs("header", { className: "menu-header", children: [_jsx("h1", { className: "menu-title", children: "w3bP0ng" }), _jsx("p", { className: "menu-subtitle", children: "ARCADE MAYHEM UNLEASHED" })] }), _jsx("div", { className: "mode-grid", children: GAME_MODES.map((mode) => (_jsxs("button", { className: `mode-card ${!mode.available ? 'mode-card--disabled' : ''}`, onClick: () => handleModeSelect(mode.id, mode.available), disabled: !mode.available, "aria-label": `${mode.name} - ${mode.available ? 'Available' : 'Coming Soon'}`, children: [_jsx("div", { className: "mode-card__icon", children: mode.icon }), _jsx("h2", { className: "mode-card__title", children: mode.name }), _jsx("p", { className: "mode-card__description", children: mode.description }), !mode.available && (_jsx("span", { className: "mode-card__badge", children: "Coming Soon" }))] }, mode.id))) }), _jsx("button", { className: "settings-button", onClick: toggleSettingsPanel, "aria-label": "Open settings", children: "\u2699\uFE0F Settings" }), _jsx("footer", { className: "menu-footer", children: _jsxs("p", { children: ["\u00A9 2025 Kevin Stewart. All rights reserved.", _jsx("br", {}), _jsx("a", { href: "https://github.com/mintwhirl/w3bP0ng", target: "_blank", rel: "noopener noreferrer", className: "menu-link", children: "View Source on GitHub" }), _jsx("br", {}), _jsx("button", { onClick: toggleAbout, className: "menu-link about-button", type: "button", children: "\uD83D\uDCCB About & Credits" })] }) })] }));
}
