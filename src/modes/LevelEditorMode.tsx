/**
 * LevelEditorMode Component
 * Create and share custom puzzle levels
 */

import { useGameStore } from '../hooks/useGameStore';

const LevelEditorMode = () => {
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  return (
    <div className="coming-soon">
      <h1>Level Editor</h1>
      <p>Coming Soon: Create Your Own Challenges</p>
      <p>Build and share custom puzzle levels with the community</p>
      <button onClick={returnToMenu}>Return to Menu</button>
    </div>
  );
};

export default LevelEditorMode;
