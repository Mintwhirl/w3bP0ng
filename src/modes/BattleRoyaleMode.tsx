/**
 * BattleRoyaleMode Component
 * 8-player elimination - Last one standing wins
 */

import { useGameStore } from '../hooks/useGameStore';

const BattleRoyaleMode = () => {
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  return (
    <div className="coming-soon">
      <h1>Battle Royale Mode</h1>
      <p>Coming Soon: 8-Player Chaos</p>
      <p>8-player elimination - Last one standing wins</p>
      <button onClick={returnToMenu}>Return to Menu</button>
    </div>
  );
};

export default BattleRoyaleMode;
