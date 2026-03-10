/**
 * Data Management Modal
 * Settings panel for save data, export/import, and achievements
 */

import React, { useState, useEffect } from 'react';
import {
  GlassPanel,
  GlassButton,
  StatsDisplay,
} from './GlassHUD';
import {
  getSaveDataInfo,
  exportSaveData,
  importSaveData,
  resetSaveData,
  getCompletionPercentage,
} from '../utils/saveManager';
import {
  getAchievementStats,
  getAchievementsByCategory,
  getRecentlyUnlocked,
  achievementManager,
} from '../core/achievements';
import type { Achievement } from '../core/achievements';
import '../styles/glassmorphism.css';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataManagementModal({ isOpen, onClose }: DataManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'export' | 'import'>('overview');
  const [saveInfo, setSaveInfo] = useState(getSaveDataInfo());
  const [completionStats, setCompletionStats] = useState(getCompletionPercentage());
  const [achievementStats, setAchievementStats] = useState(getAchievementStats());
  const [recentAchievements, setRecentAchievements] = useState(getRecentlyUnlocked());
  const [importResult, setImportResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [exportData, setExportData] = useState<string | null>(null);

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
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
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
          } else {
            alert('❌ Failed to reset save data');
          }
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="data-management-modal">
      <GlassPanel variant="elevated" neonAccent="cyan" className="modal-panel">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">🎮 DATA MANAGEMENT</h2>
          <GlassButton onClick={onClose} neonAccent="magenta">✕</GlassButton>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <GlassButton
            className={activeTab === 'overview' ? 'active' : ''}
            neonAccent="cyan"
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </GlassButton>
          <GlassButton
            className={activeTab === 'achievements' ? 'active' : ''}
            neonAccent="magenta"
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Achievements
          </GlassButton>
          <GlassButton
            className={activeTab === 'export' ? 'active' : ''}
            neonAccent="cyan"
            onClick={() => setActiveTab('export')}
          >
            📤 Export
          </GlassButton>
          <GlassButton
            className={activeTab === 'import' ? 'active' : ''}
            neonAccent="violet"
            onClick={() => setActiveTab('import')}
          >
            📥 Import
          </GlassButton>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="save-info-section">
                <h3 className="section-title">💾 Save Data</h3>
                <StatsDisplay
                  stats={[
                    { label: 'Last Saved', value: saveInfo.lastSaved },
                    { label: 'File Size', value: saveInfo.fileSize },
                    { label: 'Total Stars', value: saveInfo.totalStars },
                    { label: 'Achievements', value: `${saveInfo.achievementsUnlocked}/${saveInfo.totalAchievements}` },
                  ]}
                />
              </div>

              <div className="progress-section">
                <h3 className="section-title">📈 Completion</h3>
                <div className="progress-grid">
                  <div className="progress-item">
                    <span className="progress-label">Puzzle</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${completionStats.puzzle}%` }}
                      />
                    </div>
                    <span className="progress-value">{completionStats.puzzle}%</span>
                  </div>
                  <div className="progress-item">
                    <span className="progress-label">Rhythm</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${completionStats.rhythm}%` }}
                      />
                    </div>
                    <span className="progress-value">{completionStats.rhythm}%</span>
                  </div>
                  <div className="progress-item">
                    <span className="progress-label">Battle Royale</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${completionStats.battleRoyale}%` }}
                      />
                    </div>
                    <span className="progress-value">{completionStats.battleRoyale}%</span>
                  </div>
                  <div className="progress-item">
                    <span className="progress-label">Overall</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill progress-gold"
                        style={{ width: `${completionStats.overall}%` }}
                      />
                    </div>
                    <span className="progress-value">{completionStats.overall}%</span>
                  </div>
                </div>
              </div>

              <div className="action-section">
                <GlassButton neonAccent="cyan" onClick={handleExport}>
                  📤 Export Save
                </GlassButton>
                <GlassButton neonAccent="violet" onClick={() => setActiveTab('import')}>
                  📥 Import Save
                </GlassButton>
                <GlassButton neonAccent="magenta" onClick={handleReset}>
                  🔄 Reset All Data
                </GlassButton>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="achievements-tab">
              <div className="achievements-summary">
                <StatsDisplay
                  stats={[
                    { label: 'Unlocked', value: achievementStats.unlocked },
                    { label: 'Total', value: achievementStats.total },
                    { label: 'Completion', value: `${Math.round((achievementStats.unlocked / achievementStats.total) * 100)}%` },
                    { label: 'Points', value: achievementStats.earnedPoints },
                  ]}
                />
              </div>

              {/* Recent Achievements */}
              <div className="recent-achievements">
                <h3 className="section-title">🎉 Recent Unlocks</h3>
                <div className="recent-list">
                  {recentAchievements.length > 0 ? (
                    recentAchievements.map(({ achievement, unlockedAt }: { achievement: Achievement; unlockedAt: number }) => (
                      <div key={achievement.id} className="recent-achievement">
                        <span className="achievement-icon">{achievement.icon}</span>
                        <div className="achievement-info">
                          <span className="achievement-name">{achievement.name}</span>
                          <span className="achievement-time">
                            {new Date(unlockedAt!).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-achievements">No recent achievements</p>
                  )}
                </div>
              </div>

              {/* Achievement Categories */}
              <div className="achievement-categories">
                {(['puzzle', 'rhythm', 'battle', 'editor', 'general'] as const).map(category => {
                  const categoryStats = achievementStats.byCategory[category];
                  if (!categoryStats) return null;

                  const categoryAchievements = getAchievementsByCategory(category);
                  if (!categoryAchievements) return null;

                  return (
                    <div key={category} className="achievement-category">
                      <h4 className="category-title">
                        {category === 'puzzle' && '🧩 Puzzle'}
                        {category === 'rhythm' && '🎵 Rhythm'}
                        {category === 'battle' && '⚔️ Battle'}
                        {category === 'editor' && '🛠️ Editor'}
                        {category === 'general' && '🎮 General'}
                      </h4>
                      <div className="category-stats">
                        {categoryStats.unlocked}/{categoryStats.total}
                      </div>
                      <div className="category-achievements">
                        {categoryAchievements.map((achievement: Achievement) => (
                          <div
                            key={achievement.id}
                            className={`achievement-item ${
                              achievementManager.isAchievementUnlocked(achievement.id) ? 'unlocked' : 'locked'
                            }`}
                            title={`${achievement.name}: ${achievement.description}`}
                          >
                            <span className="achievement-icon">{achievement.icon}</span>
                            <span className="achievement-name">{achievement.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="export-tab">
              <div className="export-instructions">
                <p>📤 Export your save data to backup your progress:</p>
                <ul>
                  <li>All achievements and progress</li>
                  <li>Settings and preferences</li>
                  <li>Custom levels and statistics</li>
                </ul>
              </div>

              <GlassButton neonAccent="cyan" onClick={handleExport}>
                📤 Download Save Data
              </GlassButton>

              {exportData && (
                <div className="export-preview">
                  <h4>Export Preview:</h4>
                  <div className="json-preview">
                    <pre>{exportData.substring(0, 500)}{exportData.length > 500 ? '...' : ''}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="import-tab">
              <div className="import-instructions">
                <p>📥 Import save data from backup file:</p>
                <ul>
                  <li>Restore your progress on another device</li>
                  <li>Merge with existing data</li>
                  <li>Recover from accidental reset</li>
                </ul>
              </div>

              <div className="import-area">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="file-input"
                />
              </div>

              {importResult && (
                <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
                  {importResult.success ? (
                    <p>✅ Import successful! Your save data has been restored.</p>
                  ) : (
                    <p>❌ Import failed: {importResult.error}</p>
                  )}
                </div>
              )}

              <div className="import-warning">
                <p>⚠️ Warning: Importing will overwrite existing save data for the same content.</p>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>

      <style>{`
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
      `}</style>
    </div>
  );
}