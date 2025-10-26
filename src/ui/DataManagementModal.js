import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Data Management Modal
 * Settings panel for save data, export/import, and achievements
 */
import { useState, useEffect } from 'react';
import { GlassPanel, GlassButton, StatsDisplay, } from './GlassHUD';
import { getSaveDataInfo, exportSaveData, importSaveData, resetSaveData, getCompletionPercentage, } from '../utils/saveManager';
import { getAchievementStats, getRecentlyUnlocked, getAchievementsByCategory, achievementManager, } from '../core/achievements';
import '../styles/glassmorphism.css';
export default function DataManagementModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [saveInfo, setSaveInfo] = useState(getSaveDataInfo());
    const [completionStats, setCompletionStats] = useState(getCompletionPercentage());
    const [achievementStats, setAchievementStats] = useState(getAchievementStats());
    const [recentAchievements, setRecentAchievements] = useState(getRecentlyUnlocked());
    const [importResult, setImportResult] = useState(null);
    const [exportData, setExportData] = useState(null);
    // Refresh data when modal opens
    useEffect(() => {
        if (isOpen) {
            setSaveInfo(getSaveDataInfo());
            setCompletionStats(getCompletionPercentage());
            setAchievementStats(getAchievementStats());
            setRecentAchievements(getRecentlyUnlocked());
        }
    }, [isOpen]);
    // Handle export
    const handleExport = () => {
        const data = exportSaveData();
        if (data) {
            setExportData(data);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `w3bp0ng-save-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };
    // Handle import
    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            const result = importSaveData(content);
            setImportResult(result);
            if (result.success) {
                // Refresh data after successful import
                setTimeout(() => {
                    setSaveInfo(getSaveDataInfo());
                    setCompletionStats(getCompletionPercentage());
                    setAchievementStats(getAchievementStats());
                }, 100);
            }
        };
        reader.readAsText(file);
    };
    // Handle reset
    const handleReset = () => {
        if (window.confirm('⚠️ This will delete ALL your progress, achievements, and settings. This action cannot be undone.\\n\\nAre you absolutely sure you want to reset all data?')) {
            if (window.confirm('🔥 Final confirmation: This will permanently delete your save data. Type "RESET" to confirm:')) {
                const confirmation = prompt('Please type "RESET" to confirm data deletion:');
                if (confirmation === 'RESET') {
                    const success = resetSaveData();
                    if (success) {
                        setSaveInfo(getSaveDataInfo());
                        setCompletionStats(getCompletionPercentage());
                        setAchievementStats(getAchievementStats());
                        alert('✅ Save data has been reset successfully');
                    }
                    else {
                        alert('❌ Failed to reset save data');
                    }
                }
            }
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "data-management-modal", children: [_jsxs(GlassPanel, { variant: "elevated", neonAccent: "cyan", className: "modal-panel", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { className: "modal-title", children: "\uD83C\uDFAE DATA MANAGEMENT" }), _jsx(GlassButton, { onClick: onClose, neonAccent: "red", children: "\u2715" })] }), _jsxs("div", { className: "tab-navigation", children: [_jsx(GlassButton, { className: activeTab === 'overview' ? 'active' : '', neonAccent: "cyan", onClick: () => setActiveTab('overview'), children: "\uD83D\uDCCA Overview" }), _jsx(GlassButton, { className: activeTab === 'achievements' ? 'active' : '', neonAccent: "magenta", onClick: () => setActiveTab('achievements'), children: "\uD83C\uDFC6 Achievements" }), _jsx(GlassButton, { className: activeTab === 'export' ? 'active' : '', neonAccent: "green", onClick: () => setActiveTab('export'), children: "\uD83D\uDCE4 Export" }), _jsx(GlassButton, { className: activeTab === 'import' ? 'active' : '', neonAccent: "orange", onClick: () => setActiveTab('import'), children: "\uD83D\uDCE5 Import" })] }), _jsxs("div", { className: "tab-content", children: [activeTab === 'overview' && (_jsxs("div", { className: "overview-tab", children: [_jsxs("div", { className: "save-info-section", children: [_jsx("h3", { className: "section-title", children: "\uD83D\uDCBE Save Data" }), _jsx(StatsDisplay, { stats: [
                                                    { label: 'Last Saved', value: saveInfo.lastSaved },
                                                    { label: 'File Size', value: saveInfo.fileSize },
                                                    { label: 'Total Stars', value: saveInfo.totalStars },
                                                    { label: 'Achievements', value: `${saveInfo.achievementsUnlocked}/${saveInfo.totalAchievements}` },
                                                ] })] }), _jsxs("div", { className: "progress-section", children: [_jsx("h3", { className: "section-title", children: "\uD83D\uDCC8 Completion" }), _jsxs("div", { className: "progress-grid", children: [_jsxs("div", { className: "progress-item", children: [_jsx("span", { className: "progress-label", children: "Puzzle" }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${completionStats.puzzle}%` } }) }), _jsxs("span", { className: "progress-value", children: [completionStats.puzzle, "%"] })] }), _jsxs("div", { className: "progress-item", children: [_jsx("span", { className: "progress-label", children: "Rhythm" }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${completionStats.rhythm}%` } }) }), _jsxs("span", { className: "progress-value", children: [completionStats.rhythm, "%"] })] }), _jsxs("div", { className: "progress-item", children: [_jsx("span", { className: "progress-label", children: "Battle Royale" }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${completionStats.battleRoyale}%` } }) }), _jsxs("span", { className: "progress-value", children: [completionStats.battleRoyale, "%"] })] }), _jsxs("div", { className: "progress-item", children: [_jsx("span", { className: "progress-label", children: "Overall" }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill progress-gold", style: { width: `${completionStats.overall}%` } }) }), _jsxs("span", { className: "progress-value", children: [completionStats.overall, "%"] })] })] })] }), _jsxs("div", { className: "action-section", children: [_jsx(GlassButton, { neonAccent: "green", onClick: handleExport, children: "\uD83D\uDCE4 Export Save" }), _jsx(GlassButton, { neonAccent: "orange", onClick: () => setActiveTab('import'), children: "\uD83D\uDCE5 Import Save" }), _jsx(GlassButton, { neonAccent: "red", onClick: handleReset, children: "\uD83D\uDD04 Reset All Data" })] })] })), activeTab === 'achievements' && (_jsxs("div", { className: "achievements-tab", children: [_jsx("div", { className: "achievements-summary", children: _jsx(StatsDisplay, { stats: [
                                                { label: 'Unlocked', value: achievementStats.unlocked },
                                                { label: 'Total', value: achievementStats.total },
                                                { label: 'Completion', value: `${Math.round((achievementStats.unlocked / achievementStats.total) * 100)}%` },
                                                { label: 'Points', value: achievementStats.earnedPoints },
                                            ] }) }), _jsxs("div", { className: "recent-achievements", children: [_jsx("h3", { className: "section-title", children: "\uD83C\uDF89 Recent Unlocks" }), _jsx("div", { className: "recent-list", children: recentAchievements.length > 0 ? (recentAchievements.map(({ achievement, unlockedAt }) => (_jsxs("div", { className: "recent-achievement", children: [_jsx("span", { className: "achievement-icon", children: achievement.icon }), _jsxs("div", { className: "achievement-info", children: [_jsx("span", { className: "achievement-name", children: achievement.name }), _jsx("span", { className: "achievement-time", children: new Date(unlockedAt).toLocaleDateString() })] })] }, achievement.id)))) : (_jsx("p", { className: "no-achievements", children: "No recent achievements" })) })] }), _jsx("div", { className: "achievement-categories", children: ['puzzle', 'rhythm', 'battle', 'editor', 'general'].map(category => {
                                            const categoryStats = achievementStats.byCategory[category];
                                            const categoryAchievements = getAchievementsByCategory(category);
                                            return (_jsxs("div", { className: "achievement-category", children: [_jsxs("h4", { className: "category-title", children: [category === 'puzzle' && '🧩 Puzzle', category === 'rhythm' && '🎵 Rhythm', category === 'battle' && '⚔️ Battle', category === 'editor' && '🛠️ Editor', category === 'general' && '🎮 General'] }), _jsxs("div", { className: "category-stats", children: [categoryStats.unlocked, "/", categoryStats.total] }), _jsx("div", { className: "category-achievements", children: categoryAchievements.map(achievement => (_jsxs("div", { className: `achievement-item ${achievementManager.isAchievementUnlocked(achievement.id) ? 'unlocked' : 'locked'}`, title: `${achievement.name}: ${achievement.description}`, children: [_jsx("span", { className: "achievement-icon", children: achievement.icon }), _jsx("span", { className: "achievement-name", children: achievement.name })] }, achievement.id))) })] }, category));
                                        }) })] })), activeTab === 'export' && (_jsxs("div", { className: "export-tab", children: [_jsxs("div", { className: "export-instructions", children: [_jsx("p", { children: "\uD83D\uDCE4 Export your save data to backup your progress:" }), _jsxs("ul", { children: [_jsx("li", { children: "All achievements and progress" }), _jsx("li", { children: "Settings and preferences" }), _jsx("li", { children: "Custom levels and statistics" })] })] }), _jsx(GlassButton, { neonAccent: "green", onClick: handleExport, children: "\uD83D\uDCE4 Download Save Data" }), exportData && (_jsxs("div", { className: "export-preview", children: [_jsx("h4", { children: "Export Preview:" }), _jsx("div", { className: "json-preview", children: _jsxs("pre", { children: [exportData.substring(0, 500), exportData.length > 500 ? '...' : ''] }) })] }))] })), activeTab === 'import' && (_jsxs("div", { className: "import-tab", children: [_jsxs("div", { className: "import-instructions", children: [_jsx("p", { children: "\uD83D\uDCE5 Import save data from backup file:" }), _jsxs("ul", { children: [_jsx("li", { children: "Restore your progress on another device" }), _jsx("li", { children: "Merge with existing data" }), _jsx("li", { children: "Recover from accidental reset" })] })] }), _jsx("div", { className: "import-area", children: _jsx("input", { type: "file", accept: ".json", onChange: handleImport, className: "file-input" }) }), importResult && (_jsx("div", { className: `import-result ${importResult.success ? 'success' : 'error'}`, children: importResult.success ? (_jsx("p", { children: "\u2705 Import successful! Your save data has been restored." })) : (_jsxs("p", { children: ["\u274C Import failed: ", importResult.error] })) })), _jsx("div", { className: "import-warning", children: _jsx("p", { children: "\u26A0\uFE0F Warning: Importing will overwrite existing save data for the same content." }) })] }))] })] }), _jsx("style", { jsx: true, children: `
        .data-management-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .modal-panel {
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-title {
          font-family: 'Orbitron', monospace;
          font-size: 1.5rem;
          color: #ffffff;
          margin: 0;
        }

        .tab-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tab-navigation .glass-button.active {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 211, 238, 0.2));
          border-color: currentColor;
        }

        .tab-content {
          min-height: 400px;
        }

        .section-title {
          font-family: 'Orbitron', monospace;
          font-size: 1.1rem;
          color: #22d3ee;
          margin: 0 0 20px 0;
        }

        .save-info-section {
          margin-bottom: 30px;
        }

        .progress-section {
          margin-bottom: 30px;
        }

        .progress-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22d3ee, #a855f7);
          transition: width 0.3s ease;
        }

        .progress-fill.progress-gold {
          background: linear-gradient(90deg, #f59e0b, #f97316);
        }

        .progress-value {
          color: #ffffff;
          font-weight: bold;
        }

        .action-section {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .achievements-summary {
          margin-bottom: 30px;
        }

        .recent-achievements {
          margin-bottom: 30px;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .recent-achievement {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .achievement-icon {
          font-size: 2rem;
        }

        .achievement-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .achievement-name {
          color: #ffffff;
          font-weight: 600;
        }

        .achievement-time {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
        }

        .no-achievements {
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          font-style: italic;
        }

        .achievement-categories {
          display: grid;
          gap: 30px;
        }

        .achievement-category {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .category-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
          font-weight: bold;
          margin-bottom: 15px;
        }

        .category-stats {
          color: #22d3ee;
          font-size: 0.9rem;
          margin-left: auto;
        }

        .category-achievements {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
        }

        .achievement-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          cursor: default;
        }

        .achievement-item.unlocked {
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
        }

        .achievement-item.locked {
          opacity: 0.5;
          filter: grayscale(0.8);
        }

        .export-instructions,
        .import-instructions {
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .export-instructions ul,
        .import-instructions ul {
          color: rgba(255, 255, 255, 0.8);
          margin: 15px 0 0 20px;
        }

        .export-tab .json-preview {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 8px;
          padding: 15px;
          overflow-y: auto;
          max-height: 200px;
          margin-top: 20px;
        }

        .json-preview pre {
          color: #22d3ee;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          margin: 0;
          white-space: pre-wrap;
        }

        .file-input {
          width: 100%;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px dashed rgba(34, 211, 238, 0.5);
          border-radius: 8px;
          color: #ffffff;
          font-size: 1rem;
        }

        .file-input:focus {
          outline: none;
          border-color: rgba(34, 211, 238, 0.8);
        }

        .import-result {
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }

        .import-result.success {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.5);
          color: #22c55e;
        }

        .import-result.error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #ef4444;
        }

        .import-warning {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.5);
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
          color: #f59e0b;
        }

        @media (max-width: 768px) {
          .modal-panel {
            width: 95%;
            max-height: 95vh;
          }

          .tab-navigation {
            gap: 5px;
          }

          .tab-navigation .glass-button {
            padding: 8px 12px;
            font-size: 0.8rem;
          }

          .progress-grid {
            grid-template-columns: 1fr;
          }

          .achievement-categories {
            grid-template-columns: 1fr;
          }

          .action-section {
            flex-direction: column;
            align-items: center;
          }
        }
      ` })] }));
}
