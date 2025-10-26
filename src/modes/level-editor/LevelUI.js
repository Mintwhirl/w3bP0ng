import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Level Editor UI Component
 * Provides the user interface for the level editor using GlassHUD components
 */
import { useState, useCallback, useEffect } from 'react';
import { GlassPanel, GlassButton, PauseOverlay, } from '../../ui/GlassHUD';
import { useGameStore } from '../../hooks/useGameStore';
import { EDITOR_TOOLS, } from './types';
import { listLevels, exportLevel, importLevel, } from './LevelData';
export default function LevelUI({ editorState, onModeChange, onToolChange, onSaveLevel, onLoadLevel, onDeleteLevel, onTestLevel, onResetLevel, onGridToggle, onUndo, onRedo, canUndo, canRedo, isTestMode, testModeStats, }) {
    const { returnToMenu } = useGameStore();
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showLoadDialog, setShowLoadDialog] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [saveName, setSaveName] = useState(editorState.levelMetadata.name);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [customLevels, setCustomLevels] = useState([]);
    const [importError, setImportError] = useState(null);
    // Load custom levels list when dialogs open
    useEffect(() => {
        if (showLoadDialog) {
            const levels = listLevels().map(level => level.name);
            setCustomLevels(levels);
        }
    }, [showLoadDialog]);
    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((event) => {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    setShowSaveDialog(true);
                    break;
                case 'o':
                    event.preventDefault();
                    setShowLoadDialog(true);
                    break;
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        onRedo();
                    }
                    else {
                        onUndo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    onRedo();
                    break;
            }
        }
        else {
            switch (event.key) {
                case 'Escape':
                    if (isTestMode) {
                        onTestLevel(); // Exit test mode
                    }
                    break;
                case 'g':
                    onGridToggle();
                    break;
                case 'Delete':
                    if (editorState.mode === 'select' && selectedLevel) {
                        onDeleteLevel(selectedLevel);
                    }
                    break;
            }
        }
    }, [editorState.mode, isTestMode, onUndo, onRedo, onGridToggle, onDeleteLevel, selectedLevel]);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    const handleSave = () => {
        const success = onSaveLevel(saveName);
        if (success) {
            setShowSaveDialog(false);
        }
        else {
            setImportError('Failed to save level');
        }
    };
    const handleLoad = () => {
        if (selectedLevel) {
            onLoadLevel(selectedLevel);
            setShowLoadDialog(false);
            setSelectedLevel(null);
        }
    };
    const handleDelete = () => {
        if (selectedLevel && window.confirm(`Delete level "${selectedLevel}"?`)) {
            const success = onDeleteLevel(selectedLevel);
            if (success) {
                setCustomLevels(customLevels.filter(name => name !== selectedLevel));
                setSelectedLevel(null);
            }
        }
    };
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target?.result;
                        const result = importLevel(content);
                        if (result.success) {
                            alert('Level imported successfully!');
                            setShowLoadDialog(true); // Refresh level list
                        }
                        else {
                            setImportError(result.errors?.join(', ') || 'Import failed');
                        }
                    }
                    catch (error) {
                        setImportError('Failed to parse level file');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };
    const handleExport = (levelName) => {
        const exportData = exportLevel(levelName, { pretty: true });
        if (exportData) {
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${levelName}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };
    // Render test mode overlay
    if (isTestMode) {
        return (_jsx(PauseOverlay, { title: "TEST MODE", message: testModeStats ? `Balls: ${testModeStats.balls} | Hits: ${testModeStats.hits} | Time: ${testModeStats.time}` : 'Testing level...', onResume: onTestLevel, onExit: () => {
                onTestLevel(); // Exit test mode
            }, resumeText: "Exit Test Mode", exitText: "Exit Test Mode" }));
    }
    return (_jsxs("div", { className: "level-ui", children: [_jsx(GlassPanel, { variant: "subtle", neonAccent: "cyan", position: "top-left", className: "editor-toolbar", children: _jsxs("div", { className: "toolbar-section", children: [_jsxs("div", { className: "toolbar-group", children: [_jsx(GlassButton, { neonAccent: "magenta", onClick: () => onModeChange('place'), className: editorState.mode === 'place' ? 'active' : '', title: "Place Mode (P)", children: "\uD83D\uDCCD Place" }), _jsx(GlassButton, { neonAccent: "magenta", onClick: () => onModeChange('select'), className: editorState.mode === 'select' ? 'active' : '', title: "Select Mode (S)", children: "\u2B1A Select" }), _jsx(GlassButton, { neonAccent: "magenta", onClick: () => onModeChange('delete'), className: editorState.mode === 'delete' ? 'active' : '', title: "Delete Mode (D)", children: "\uD83D\uDDD1\uFE0F Delete" })] }), _jsxs("div", { className: "toolbar-group", children: [_jsx(GlassButton, { onClick: onUndo, disabled: !canUndo, title: "Undo (Ctrl+Z)", children: "\u21B6 Undo" }), _jsx(GlassButton, { onClick: onRedo, disabled: !canRedo, title: "Redo (Ctrl+Y)", children: "\u21B7 Redo" })] }), _jsxs("div", { className: "toolbar-group", children: [_jsx(GlassButton, { neonAccent: "cyan", onClick: onGridToggle, className: editorState.grid.visible ? 'active' : '', title: "Toggle Grid (G)", children: "\u229E Grid" }), _jsx(GlassButton, { neonAccent: "green", onClick: onResetLevel, title: "Reset Level", children: "\uD83D\uDD04 Reset" })] })] }) }), _jsxs(GlassPanel, { variant: "subtle", neonAccent: "violet", position: "right", className: "tools-panel", children: [_jsx("h3", { className: "panel-title", children: "\uD83D\uDEE0\uFE0F Tools" }), _jsx("div", { className: "tools-grid", children: EDITOR_TOOLS.map((tool) => (_jsxs(GlassButton, { neonAccent: "cyan", onClick: () => onToolChange(tool.id), className: editorState.currentTool === tool.id ? 'active' : '', title: tool.description, children: [_jsx("div", { className: "tool-icon", children: tool.icon }), _jsx("div", { className: "tool-name", children: tool.name })] }, tool.id))) })] }), _jsxs(GlassPanel, { variant: "subtle", neonAccent: "magenta", position: "left", className: "info-panel", children: [_jsx("h3", { className: "panel-title", children: "\uD83D\uDCCB Level Info" }), _jsxs("div", { className: "level-metadata", children: [_jsxs("div", { className: "metadata-field", children: [_jsx("label", { children: "Name:" }), _jsx("span", { children: editorState.levelMetadata.name })] }), _jsxs("div", { className: "metadata-field", children: [_jsx("label", { children: "Description:" }), _jsx("span", { children: editorState.levelMetadata.description })] }), _jsxs("div", { className: "metadata-field", children: [_jsx("label", { children: "Difficulty:" }), _jsx("span", { children: '⭐'.repeat(editorState.levelMetadata.difficulty) })] }), _jsxs("div", { className: "metadata-field", children: [_jsx("label", { children: "Objects:" }), _jsx("span", { children: editorState.placedObjects.length })] }), _jsxs("div", { className: "metadata-field", children: [_jsx("label", { children: "Modified:" }), _jsx("span", { children: new Date(editorState.levelMetadata.modified).toLocaleString() })] })] })] }), _jsx(GlassPanel, { variant: "subtle", neonAccent: "cyan", position: "bottom", className: "control-panel", children: _jsxs("div", { className: "control-buttons", children: [_jsx(GlassButton, { neonAccent: "green", onClick: () => setShowSaveDialog(true), title: "Save Level (Ctrl+S)", children: "\uD83D\uDCBE Save" }), _jsx(GlassButton, { neonAccent: "cyan", onClick: () => setShowLoadDialog(true), title: "Load Level (Ctrl+O)", children: "\uD83D\uDCC2 Load" }), _jsx(GlassButton, { neonAccent: "violet", onClick: onTestLevel, title: "Test Level", children: "\u25B6 Test" }), _jsx(GlassButton, { neonAccent: "magenta", onClick: handleImport, title: "Import Level", children: "\uD83D\uDCE5 Import" }), _jsx(GlassButton, { neonAccent: "orange", onClick: () => returnToMenu(), title: "Exit to Menu", children: "\uD83C\uDFE0 Menu" })] }) }), showSaveDialog && (_jsx("div", { className: "dialog-overlay", children: _jsxs(GlassPanel, { variant: "elevated", neonAccent: "cyan", className: "dialog", children: [_jsx("h3", { children: "\uD83D\uDCBE Save Level" }), _jsxs("div", { className: "form-field", children: [_jsx("label", { children: "Level Name:" }), _jsx("input", { type: "text", value: saveName, onChange: (e) => setSaveName(e.target.value), className: "glass-input", placeholder: "Enter level name...", autoFocus: true })] }), _jsxs("div", { className: "dialog-buttons", children: [_jsx(GlassButton, { neonAccent: "green", onClick: handleSave, children: "Save" }), _jsx(GlassButton, { onClick: () => setShowSaveDialog(false), children: "Cancel" })] }), importError && (_jsx("div", { className: "error-message", children: importError }))] }) })), showLoadDialog && (_jsx("div", { className: "dialog-overlay", children: _jsxs(GlassPanel, { variant: "elevated", neonAccent: "cyan", className: "dialog", children: [_jsx("h3", { children: "\uD83D\uDCC2 Load Level" }), _jsx("div", { className: "level-list", children: customLevels.length === 0 ? (_jsx("p", { children: "No custom levels found. Create one or import a level!" })) : (customLevels.map((levelName) => (_jsxs("div", { className: `level-item ${selectedLevel === levelName ? 'selected' : ''}`, onClick: () => setSelectedLevel(levelName), children: [_jsx("span", { className: "level-name", children: levelName }), _jsxs("div", { className: "level-actions", children: [_jsx(GlassButton, { neonAccent: "green", size: "small", onClick: (e) => {
                                                    e.stopPropagation();
                                                    handleExport(levelName);
                                                }, children: "\uD83D\uDCE4" }), _jsx(GlassButton, { neonAccent: "red", size: "small", onClick: (e) => {
                                                    e.stopPropagation();
                                                    setSelectedLevel(levelName);
                                                    handleDelete();
                                                }, children: "\uD83D\uDDD1\uFE0F" })] })] }, levelName)))) }), _jsxs("div", { className: "dialog-buttons", children: [_jsx(GlassButton, { neonAccent: "green", onClick: handleLoad, disabled: !selectedLevel, children: "Load" }), _jsx(GlassButton, { onClick: () => setShowLoadDialog(false), children: "Cancel" })] }), importError && (_jsx("div", { className: "error-message", children: importError }))] }) })), _jsx("style", { jsx: true, children: `
        .level-ui {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1000;
        }

        .level-ui > * {
          pointer-events: auto;
        }

        .toolbar-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .toolbar-group {
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .toolbar-group .glass-button {
          padding: 8px 12px;
          font-size: 12px;
        }

        .toolbar-group .glass-button.active {
          background: rgba(168, 85, 247, 0.3);
          border-color: #a855f7;
        }

        .tools-panel {
          width: 250px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .panel-title {
          margin: 0 0 15px 0;
          color: #ffffff;
          font-size: 16px;
          text-align: center;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .tools-grid .glass-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          min-height: 60px;
        }

        .tool-icon {
          font-size: 20px;
          margin-bottom: 5px;
        }

        .tool-name {
          font-size: 11px;
          text-align: center;
        }

        .info-panel {
          width: 200px;
        }

        .level-metadata {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .metadata-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .metadata-field label {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .metadata-field span {
          color: #ffffff;
          text-align: right;
        }

        .control-panel {
          margin: 0 20px 20px 20px;
        }

        .control-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .dialog {
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .dialog h3 {
          margin: 0 0 20px 0;
          color: #ffffff;
          text-align: center;
          font-size: 18px;
        }

        .form-field {
          margin-bottom: 20px;
        }

        .form-field label {
          display: block;
          margin-bottom: 5px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .glass-input {
          width: 100%;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: #ffffff;
          font-size: 14px;
        }

        .glass-input:focus {
          outline: none;
          border-color: #22d3ee;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
        }

        .level-list {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        .level-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          margin-bottom: 5px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .level-item:hover {
          background: rgba(168, 85, 247, 0.2);
          border-color: #a855f7;
        }

        .level-item.selected {
          background: rgba(34, 211, 238, 0.2);
          border-color: #22d3ee;
        }

        .level-name {
          color: #ffffff;
          font-size: 14px;
        }

        .level-actions {
          display: flex;
          gap: 5px;
        }

        .dialog-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .error-message {
          margin-top: 15px;
          padding: 10px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          border-radius: 4px;
          color: #ef4444;
          font-size: 12px;
          text-align: center;
        }
      ` })] }));
}
