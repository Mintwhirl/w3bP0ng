/**
 * PongGame Component - Main game component for routing and testing
 * This component bridges the expected test structure with the actual game logic
 * Provides a clean interface for the App component while maintaining compatibility
 */

import React from 'react';
import ClassicMode from '../modes/ClassicMode';

/**
 * PongGame - The main game component interface
 *
 * This component serves as the bridge between:
 * - Test expectations (looking for src/components/PongGame)
 * - Actual game implementation (src/modes/ClassicMode)
 *
 * It provides the expected data-testid structure for testing while
 * delegating the actual game logic to the ClassicMode component.
 */
const PongGame: React.FC = () => {
  return (
    <div data-testid="pong-game">
      <ClassicMode />
    </div>
  );
};

export default PongGame;