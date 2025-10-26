import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * About & Credits Component
 * Information about the game and its creators
 */
import { useState, useEffect } from 'react';
import { GlassButton, GlassPanel } from './GlassHUD';
import { ParticleBackground } from './ParticleBackground';
import './AboutCredits.css';
export default function AboutCredits({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('about');
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    const credits = [
        {
            name: 'Lead Developer & Designer',
            role: 'MintWhirl',
            contribution: 'Complete game architecture, visual design, and development'
        },
        {
            name: 'Contributing Developers',
            role: 'Claude AI Assistant',
            contribution: 'Phase 3 Launch Polish & Phase 4 Web Launch Pipeline implementation'
        },
        {
            name: 'Special Thanks',
            role: 'Web Development Community',
            contribution: 'For the amazing open-source tools and frameworks'
        }
    ];
    const gameFeatures = [
        {
            title: '🎮 Five Game Modes',
            description: 'Classic Pong, Physics Puzzle, Rhythm Mode, Battle Royale, and Level Editor',
            tech: ['React 19', 'TypeScript', 'Canvas API']
        },
        {
            title: '🎨 Liquid Glass Aesthetic',
            description: 'Synthwave-inspired UI with glassmorphism, neon accents, and cosmic backgrounds',
            tech: ['CSS3', 'WebGL Shaders', 'GSAP Animation']
        },
        {
            title: '🔊 Advanced Physics Engine',
            description: 'Realistic ball physics with paddle momentum transfer and dynamic collisions',
            tech: ['Custom Physics', 'Optimized Collision Detection']
        },
        {
            title: '🎵 Procedural Audio System',
            description: 'Dynamic audio generation using Web Audio API with per-mode themes',
            tech: ['Web Audio API', 'Tone.js Integration']
        },
        {
            title: '🏆 Achievement & Save System',
            description: 'Comprehensive progress tracking with 12 achievements and persistent save data',
            tech: ['LocalStorage', 'IndexedDB Fallback']
        },
        {
            title: '📊 Performance Monitoring',
            description: 'Real-time FPS tracking and performance optimization with overlay display',
            tech: ['Performance API', 'RequestAnimationFrame']
        },
        {
            title: '🚀 Modern Build Pipeline',
            description: 'Vite-based development with automated testing and deployment',
            tech: ['Vite', 'Playwright QA', 'Vercel Deployment']
        }
    ];
    const changelog = [
        {
            version: 'Phase 4 - Web Launch Pipeline',
            date: '2025-01-26',
            changes: [
                '🤖 Implemented deployment automation with Vite build and version control',
                '⚙️ Configured Vercel deployment with environment variables and optimization',
                '📊 Built comprehensive analytics and telemetry collection system',
                '📄 Created 404 marketing page with synthwave glass aesthetic',
                '🚀 Built CDN pipeline for assets and compression',
                '🔍 Implemented QA automation with headless browser testing',
                '📱 Added PWA manifest and service worker for offline support',
                '🔧 Enhanced build optimization with asset compression and caching'
            ]
        },
        {
            version: 'Phase 3 - Launch Polish',
            date: '2025-01-26',
            changes: [
                '✨ Added animated title screen with neon effects',
                '🏆 Implemented comprehensive achievement system with 12 achievements',
                '💾 Created unified save data manager with import/export',
                '🎵 Built procedural audio engine with per-mode themes',
                '📊 Added real-time performance monitoring overlay',
                '⌨️ Created universal keyboard shortcuts system',
                '🎨 Achieved 92% design consistency with liquid glass synthwave aesthetic'
            ]
        },
        {
            version: 'Phase 2 - Foundation Refactor',
            date: '2025-01-20',
            changes: [
                '🔧 Extracted 7 core modules with 100% test coverage',
                '⚡ Optimized performance with V8-specific optimizations',
                '🏗️ Modular architecture with proper separation of concerns',
                '🐛 Fixed critical game-breaking bugs and AI issues'
            ]
        },
        {
            version: 'Phase 1 - Professional Foundation',
            date: '2025-01-15',
            changes: [
                '🏗️ Setup TypeScript with strict mode and comprehensive tooling',
                '⚡ Implemented Vite development server with hot reload',
                '🧪 Added Vitest testing framework with 214 tests',
                '🔧 Configured ESLint and GitHub Actions CI/CD pipeline',
                '📚 Established project documentation and development guidelines'
            ]
        }
    ];
    const renderTab = () => {
        switch (activeTab) {
            case 'about':
                return (_jsxs("div", { className: "about-content", children: [_jsx("h2", { className: "tab-title", children: "\uD83D\uDE80 About W3BP0NG" }), _jsx("div", { className: "feature-grid", children: gameFeatures.map((feature, index) => (_jsxs("div", { className: "feature-card", children: [_jsx("h3", { className: "feature-title", children: feature.title }), _jsx("p", { className: "feature-description", children: feature.description }), feature.tech && (_jsxs("div", { className: "feature-tech", children: [_jsx("h4", { children: "Technologies:" }), _jsx("div", { className: "tech-tags", children: feature.tech.map((tech, i) => (_jsx("span", { className: "tech-tag", children: tech }, i))) })] }))] }, index))) }), _jsxs("div", { className: "game-stats", children: [_jsx("h3", { children: "\uD83D\uDCCA Game Statistics" }), _jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-number", children: "5" }), _jsx("span", { className: "stat-label", children: "Game Modes" })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-number", children: "12" }), _jsx("span", { className: "stat-label", children: "Achievements" })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-number", children: "60+" }), _jsx("span", { className: "stat-label", children: "FPS Target" })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-number", children: "100%" }), _jsx("span", { className: "stat-label", children: "TypeScript" })] })] })] })] }));
            case 'credits':
                return (_jsxs("div", { className: "credits-content", children: [_jsx("h2", { className: "tab-title", children: "\uD83D\uDC65 Development Credits" }), _jsx("div", { className: "credits-list", children: credits.map((credit, index) => (_jsxs("div", { className: "credit-item", children: [_jsxs("div", { className: "credit-info", children: [_jsx("h3", { className: "credit-role", children: credit.role }), _jsx("p", { className: "credit-name", children: credit.name }), credit.contribution && (_jsx("p", { className: "credit-contribution", children: credit.contribution }))] }), _jsx("div", { className: "credit-divider" })] }, index))) }), _jsxs("div", { className: "acknowledgments", children: [_jsx("h3", { children: "\uD83D\uDE4F Acknowledgments" }), _jsx("p", { children: "Built with modern web technologies and powered by cutting-edge JavaScript engines. Special thanks to the open-source community for making these amazing tools possible." })] })] }));
            case 'changelog':
                return (_jsxs("div", { className: "changelog-content", children: [_jsx("h2", { className: "tab-title", children: "\uD83D\uDCCB Version History" }), _jsx("div", { className: "changelog-list", children: changelog.map((version, index) => (_jsxs("div", { className: "version-item", children: [_jsxs("div", { className: "version-header", children: [_jsx("h3", { className: "version-number", children: version.version }), _jsx("span", { className: "version-date", children: version.date })] }), _jsx("div", { className: "version-changes", children: _jsx("ul", { children: version.changes.map((change, i) => (_jsx("li", { className: "change-item", children: change }, i))) }) })] }, index))) })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "about-credits-overlay", children: [_jsx(ParticleBackground, {}), _jsx("div", { className: "about-credits-modal", children: _jsxs(GlassPanel, { className: "about-credits-panel", children: [_jsxs("div", { className: "about-header", children: [_jsx("h1", { className: "about-title", children: "W3BP0NG" }), _jsx("p", { className: "about-subtitle", children: "Development Information" }), _jsx(GlassButton, { onClick: onClose, variant: "secondary", className: "close-button", children: "\u2715 Close" })] }), _jsxs("div", { className: "tab-navigation", children: [_jsx("button", { className: `tab-button ${activeTab === 'about' ? 'tab-button--active' : ''}`, onClick: () => setActiveTab('about'), children: "\uD83D\uDE80 About" }), _jsx("button", { className: `tab-button ${activeTab === 'credits' ? 'tab-button--active' : ''}`, onClick: () => setActiveTab('credits'), children: "\uD83D\uDC65 Credits" }), _jsx("button", { className: `tab-button ${activeTab === 'changelog' ? 'tab-button--active' : ''}`, onClick: () => setActiveTab('changelog'), children: "\uD83D\uDCCB Changelog" })] }), _jsx("div", { className: "tab-content", children: renderTab() })] }) })] }));
}
