/**
 * About & Credits Component
 * Information about the game and its creators
 */

import { useState, useEffect } from 'react';
import { GlassButton, GlassPanel } from './GlassHUD';
import { ParticleBackground } from './ParticleBackground';
import './AboutCredits.css';

interface CreditEntry {
  name: string;
  role: string;
  contribution?: string;
}

interface GameFeature {
  title: string;
  description: string;
  tech?: string[];
}

export default function AboutCredits({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'about' | 'credits' | 'changelog'>('about');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const credits: CreditEntry[] = [
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

  const gameFeatures: GameFeature[] = [
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
        return (
          <div className="about-content">
            <h2 className="tab-title">🚀 About W3BP0NG</h2>
            <div className="feature-grid">
              {gameFeatures.map((feature, index) => (
                <div key={index} className="feature-card">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  {feature.tech && (
                    <div className="feature-tech">
                      <h4>Technologies:</h4>
                      <div className="tech-tags">
                        {feature.tech.map((tech, i) => (
                          <span key={i} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="game-stats">
              <h3>📊 Game Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">5</span>
                  <span className="stat-label">Game Modes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">12</span>
                  <span className="stat-label">Achievements</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">60+</span>
                  <span className="stat-label">FPS Target</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'credits':
        return (
          <div className="credits-content">
            <h2 className="tab-title">👥 Development Credits</h2>
            <div className="credits-list">
              {credits.map((credit, index) => (
                <div key={index} className="credit-item">
                  <div className="credit-info">
                    <h3 className="credit-role">{credit.role}</h3>
                    <p className="credit-name">{credit.name}</p>
                    {credit.contribution && (
                      <p className="credit-contribution">{credit.contribution}</p>
                    )}
                  </div>
                  <div className="credit-divider" />
                </div>
              ))}
            </div>

            <div className="acknowledgments">
              <h3>🙏 Acknowledgments</h3>
              <p>
                Built with modern web technologies and powered by cutting-edge JavaScript engines.
                Special thanks to the open-source community for making these amazing tools possible.
              </p>
            </div>
          </div>
        );

      case 'changelog':
        return (
          <div className="changelog-content">
            <h2 className="tab-title">📋 Version History</h2>
            <div className="changelog-list">
              {changelog.map((version, index) => (
                <div key={index} className="version-item">
                  <div className="version-header">
                    <h3 className="version-number">{version.version}</h3>
                    <span className="version-date">{version.date}</span>
                  </div>
                  <div className="version-changes">
                    <ul>
                      {version.changes.map((change, i) => (
                        <li key={i} className="change-item">{change}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="about-credits-overlay">
      <ParticleBackground />

      <div className="about-credits-modal">
        <GlassPanel className="about-credits-panel">
          {/* Header */}
          <div className="about-header">
            <h1 className="about-title">W3BP0NG</h1>
            <p className="about-subtitle">Development Information</p>

            <GlassButton
              onClick={onClose}
              variant="secondary"
              className="close-button"
            >
              ✕ Close
            </GlassButton>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'about' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              🚀 About
            </button>
            <button
              className={`tab-button ${activeTab === 'credits' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('credits')}
            >
              👥 Credits
            </button>
            <button
              className={`tab-button ${activeTab === 'changelog' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('changelog')}
            >
              📋 Changelog
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {renderTab()}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}