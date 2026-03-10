import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export type GameModeId = 
  | 'title' 
  | 'menu' 
  | 'classic' 
  | 'puzzle' 
  | 'rhythm' 
  | 'battle-royale' 
  | 'editor';

export interface ModeConfig {
  id: GameModeId;
  component: LazyExoticComponent<ComponentType<any>>;
  audioTheme: string;
  isGame: boolean;
  label: string;
}

export const MODE_CONFIGS: Record<GameModeId, ModeConfig> = {
  'title': {
    id: 'title',
    component: lazy(() => import('../ui/TitleScreen')),
    audioTheme: 'main',
    isGame: false,
    label: 'Title Screen'
  },
  'menu': {
    id: 'menu',
    component: lazy(() => import('../ui/MainMenu')),
    audioTheme: 'main',
    isGame: false,
    label: 'Main Menu'
  },
  'classic': {
    id: 'classic',
    component: lazy(() => import('../components/PongGame')),
    audioTheme: 'classic',
    isGame: true,
    label: 'Classic Mode'
  },
  'puzzle': {
    id: 'puzzle',
    component: lazy(() => import('./PhysicsPuzzleMode')),
    audioTheme: 'puzzle',
    isGame: true,
    label: 'Puzzle Mode'
  },
  'rhythm': {
    id: 'rhythm',
    component: lazy(() => import('./RhythmMode')),
    audioTheme: 'rhythm',
    isGame: true,
    label: 'Rhythm Mode'
  },
  'battle-royale': {
    id: 'battle-royale',
    component: lazy(() => import('./BattleRoyaleMode')),
    audioTheme: 'battle',
    isGame: true,
    label: 'Battle Royale'
  },
  'editor': {
    id: 'editor',
    component: lazy(() => import('./LevelEditorMode')),
    audioTheme: 'editor',
    isGame: true,
    label: 'Level Editor'
  }
};

export const getModeConfig = (id: GameModeId): ModeConfig => {
  return MODE_CONFIGS[id] || MODE_CONFIGS['menu'];
};
