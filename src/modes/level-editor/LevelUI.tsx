/**
 * Level Editor UI Component
 * Provides the user interface for the level editor using GlassHUD components
 */

import { useState, useCallback, useEffect } from 'react';
import {
  GlassPanel,
  GlassButton,
  PauseOverlay,
} from '../../ui/GlassHUD';
import { useGameStore } from '../../hooks/useGameStore';
import type {
  EditorState,
  EditMode,
  PlaceableObjectType,
} from './types';
import {
  EDITOR_TOOLS,
} from './types';
import {
  listLevels,
  exportLevel,
  importLevel,
} from './LevelData';

interface LevelUIProps {
  editorState: EditorState;
  onModeChange: (mode: EditMode) => void;
  onToolChange: (tool: PlaceableObjectType) => void;
  onSaveLevel: (name: string) => boolean;
  onLoadLevel: (name: string) => void;
  onDeleteLevel: (name: string) => boolean;
  onTestLevel: () => void;
  onResetLevel: () => void;
  onGridToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isTestMode: boolean;
}

export default function LevelUI({
  editorState,
  onModeChange,
  onToolChange,
  onSaveLevel,
  onLoadLevel,
  onDeleteLevel,
  onTestLevel,
  onResetLevel,
  onGridToggle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isTestMode,
}: LevelUIProps) {
  const { returnToMenu } = useGameStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState(editorState.levelMetadata.name);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [customLevels, setCustomLevels] = useState<string[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Load custom levels list when dialogs open
  useEffect(() => {
    if (showLoadDialog) {
      const levels = listLevels().map(level => level.name);
      setCustomLevels(levels);
    }
  }, [showLoadDialog]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
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
          } else {
            onUndo();
          }
          break;
        case 'y':
          event.preventDefault();
          onRedo();
          break;
      }
    } else {
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
    } else {
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
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent: ProgressEvent<FileReader>) => {
          try {
            const content = loadEvent.target?.result as string;
            const result = importLevel(content);
            if (result.success) {
              alert('Level imported successfully!');
              setShowLoadDialog(true); // Refresh level list
            } else {
              setImportError(result.errors?.join(', ') || 'Import failed');
            }
          } catch (error) {
            setImportError('Failed to parse level file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = (levelName: string) => {
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
    return (
      <PauseOverlay
        title="TEST MODE"
        onResume={onTestLevel}
        onExit={() => {
          onTestLevel(); // Exit test mode
        }}
      />
    );
  }

  return (
    <div className="level-ui">
      {/* Header Toolbar */}
      <GlassPanel
        variant="subtle"
        neonAccent="cyan"
        className="editor-toolbar"
        style={{ position: 'absolute', top: '20px', left: '20px' }}
      >
        <div className="toolbar-section">
          <div className="toolbar-group">
            <GlassButton
              neonAccent="magenta"
              onClick={() => onModeChange('place')}
              className={editorState.mode === 'place' ? 'active' : ''}
              title="Place Mode (P)"
            >
              📍 Place
            </GlassButton>
            <GlassButton
              neonAccent="magenta"
              onClick={() => onModeChange('select')}
              className={editorState.mode === 'select' ? 'active' : ''}
              title="Select Mode (S)"
            >
              ⬚ Select
            </GlassButton>
            <GlassButton
              neonAccent="magenta"
              onClick={() => onModeChange('delete')}
              className={editorState.mode === 'delete' ? 'active' : ''}
              title="Delete Mode (D)"
            >
              🗑️ Delete
            </GlassButton>
          </div>

          <div className="toolbar-group">
            <GlassButton
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </GlassButton>
            <GlassButton
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </GlassButton>
          </div>

          <div className="toolbar-group">
            <GlassButton
              neonAccent="cyan"
              onClick={onGridToggle}
              className={editorState.grid.visible ? 'active' : ''}
              title="Toggle Grid (G)"
            >
              ⊞ Grid
            </GlassButton>
            <GlassButton
              neonAccent="magenta"
              onClick={onResetLevel}
              title="Reset Level"
            >
              🔄 Reset
            </GlassButton>
          </div>
        </div>
      </GlassPanel>

      {/* Tools Panel */}
      <GlassPanel
        variant="subtle"
        neonAccent="violet"
        className="tools-panel"
        style={{ position: 'absolute', top: '20px', right: '20px' }}
      >
        <h3 className="panel-title">🛠️ Tools</h3>
        <div className="tools-grid">
          {EDITOR_TOOLS.map((tool) => (
            <GlassButton
              key={tool.id}
              neonAccent="cyan"
              onClick={() => onToolChange(tool.id)}
              className={editorState.currentTool === tool.id ? 'active' : ''}
              title={tool.description}
            >
              <div className="tool-icon">{tool.icon}</div>
              <div className="tool-name">{tool.name}</div>
            </GlassButton>
          ))}
        </div>
      </GlassPanel>

      {/* Level Info Panel */}
      <GlassPanel
        variant="subtle"
        neonAccent="magenta"
        className="info-panel"
        style={{ position: 'absolute', top: '200px', left: '20px' }}
      >
        <h3 className="panel-title">📋 Level Info</h3>
        <div className="level-metadata">
          <div className="metadata-field">
            <label>Name:</label>
            <span>{editorState.levelMetadata.name}</span>
          </div>
          <div className="metadata-field">
            <label>Description:</label>
            <span>{editorState.levelMetadata.description}</span>
          </div>
          <div className="metadata-field">
            <label>Difficulty:</label>
            <span>{'⭐'.repeat(editorState.levelMetadata.difficulty)}</span>
          </div>
          <div className="metadata-field">
            <label>Objects:</label>
            <span>{editorState.placedObjects.length}</span>
          </div>
          <div className="metadata-field">
            <label>Modified:</label>
            <span>{new Date(editorState.levelMetadata.modified).toLocaleString()}</span>
          </div>
        </div>
      </GlassPanel>

      {/* Bottom Control Panel */}
      <GlassPanel
        variant="subtle"
        neonAccent="cyan"
        className="control-panel"
        style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}
      >
        <div className="control-buttons">
          <GlassButton
            neonAccent="violet"
            onClick={() => setShowSaveDialog(true)}
            title="Save Level (Ctrl+S)"
          >
            💾 Save
          </GlassButton>
          <GlassButton
            neonAccent="cyan"
            onClick={() => setShowLoadDialog(true)}
            title="Load Level (Ctrl+O)"
          >
            📂 Load
          </GlassButton>
          <GlassButton
            neonAccent="violet"
            onClick={onTestLevel}
            title="Test Level"
          >
            ▶ Test
          </GlassButton>
          <GlassButton
            neonAccent="magenta"
            onClick={handleImport}
            title="Import Level"
          >
              📥 Import
          </GlassButton>
          <GlassButton
            neonAccent="magenta"
            onClick={() => returnToMenu()}
            title="Exit to Menu"
          >
            🏠 Menu
          </GlassButton>
        </div>
      </GlassPanel>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="dialog-overlay">
          <GlassPanel variant="elevated" neonAccent="cyan" className="dialog">
            <h3>💾 Save Level</h3>
            <div className="form-field">
              <label>Level Name:</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="glass-input"
                placeholder="Enter level name..."
                autoFocus
              />
            </div>
            <div className="dialog-buttons">
              <GlassButton neonAccent="magenta" onClick={handleSave}>
                Save
              </GlassButton>
              <GlassButton onClick={() => setShowSaveDialog(false)}>
                Cancel
              </GlassButton>
            </div>
            {importError && (
              <div className="error-message">{importError}</div>
            )}
          </GlassPanel>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="dialog-overlay">
          <GlassPanel variant="elevated" neonAccent="cyan" className="dialog">
            <h3>📂 Load Level</h3>
            <div className="level-list">
              {customLevels.length === 0 ? (
                <p>No custom levels found. Create one or import a level!</p>
              ) : (
                customLevels.map((levelName) => (
                  <div
                    key={levelName}
                    className={`level-item ${selectedLevel === levelName ? 'selected' : ''}`}
                    onClick={() => setSelectedLevel(levelName)}
                  >
                    <span className="level-name">{levelName}</span>
                    <div className="level-actions">
                      <GlassButton
                        neonAccent="cyan"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(levelName);
                        }}
                      >
                        📤
                      </GlassButton>
                      <GlassButton
                        neonAccent="magenta"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLevel(levelName);
                          handleDelete();
                        }}
                      >
                        🗑️
                      </GlassButton>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="dialog-buttons">
              <GlassButton
                neonAccent="cyan"
                onClick={handleLoad}
                disabled={!selectedLevel}
              >
                Load
              </GlassButton>
              <GlassButton onClick={() => setShowLoadDialog(false)}>
                Cancel
              </GlassButton>
            </div>
            {importError && (
              <div className="error-message">{importError}</div>
            )}
          </GlassPanel>
        </div>
      )}

      <style>{`
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
      `}</style>
    </div>
  );
}