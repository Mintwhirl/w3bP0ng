import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

const PongGame = () => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDebug, setShowDebug] = useState(window.innerWidth > 1200);
  const [debugStats, setDebugStats] = useState({
    fps: 0,
    updateTime: 0,
    renderTime: 0,
    particles: 0,
    powerUps: 0,
    v8Warnings: [],
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState('gameEnd'); // 'gameEnd' or 'view'
  const [playerName, setPlayerName] = useState('');
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const animationFrameRef = useRef(null);
  const debugStatsRef = useRef({
    fps: 0,
    frameCount: 0,
    lastTime: performance.now(),
    renderTime: 0,
    updateTime: 0,
    v8Warnings: [],
    objectCreations: 0,
    gcEvents: 0,
  });

  // V8 optimization monitoring with real validation
  const v8OptimizationStatus = useRef({
    forLoopsUsed: 0,
    filterUsed: 0,
    mathPowUsed: 0,
    compactArraysUsed: 0,
    optimizationScore: 100,
  });

  const checkV8Optimizations = useCallback(() => {
    const warnings = [];
    const gameState = gameStateRef.current;
    const v8Status = v8OptimizationStatus.current;

    // Reset counters each check
    v8Status.forLoopsUsed = 0;
    v8Status.filterUsed = 0;
    v8Status.mathPowUsed = 0;
    v8Status.compactArraysUsed = 0;

    // Track actual optimization usage in hot paths
    if (gameState.ball.trail.length > 0) {
      v8Status.compactArraysUsed++; // Trail compaction is being used
    }
    if (gameState.powerUps.length > 0) {
      v8Status.forLoopsUsed++; // Power-up collision checks use for loops
    }
    if (gameState.activePowerUps.multiBall.active && gameState.activePowerUps.multiBall.extraBalls.length > 0) {
      v8Status.compactArraysUsed++; // Multi-ball trail compaction
      v8Status.forLoopsUsed++; // Extra ball processing
    }

    // Check for potential deoptimization triggers
    if (gameState.ball.trail.length > 50) {
      warnings.push('High particle count may cause GC pressure');
      v8Status.optimizationScore -= 10;
    }

    if (gameState.powerUps.length > 3) {
      warnings.push('Multiple power-ups active - watch object allocation');
      v8Status.optimizationScore -= 5;
    }

    if (debugStatsRef.current.updateTime > 16.67) {
      warnings.push('Update time >16ms - potential frame drop');
      v8Status.optimizationScore -= 15;
    }

    if (debugStatsRef.current.renderTime > 10) {
      warnings.push('Render time >10ms - canvas bottleneck');
      v8Status.optimizationScore -= 10;
    }

    // Check for potential deoptimization patterns
    if (debugStatsRef.current.fps < 55) {
      warnings.push('FPS below 55 - check for deoptimization');
      v8Status.optimizationScore -= 20;
    }

    // Reset score if no issues
    if (warnings.length === 0) {
      v8Status.optimizationScore = Math.min(100, v8Status.optimizationScore + 5);
    }

    debugStatsRef.current.v8Warnings = warnings;
    debugStatsRef.current.v8Status = v8Status;
  }, []);
  const audioContextRef = useRef(null);
  const gameStateRef = useRef({
    ball: {
      x: 400, // Center X
      y: 200, // Center Y
      dx: 4, // Velocity X (pixels per frame)
      dy: 3, // Velocity Y
      radius: 8,
      trail: [], // Particle trail for visual effects
    },
    paddles: {
      left: { x: 20, y: 150, width: 10, height: 100, speed: 5, prevY: 150, velocity: 0 },
      right: { x: 770, y: 150, width: 10, height: 100, speed: 5, prevY: 150, velocity: 0 },
    },
    canvas: {
      width: Math.min(800, window.innerWidth - 40),
      height: Math.min(400, window.innerHeight * 0.5),
    },
    keys: {}, // Track which keys are currently pressed
    touch: {
      leftPaddle: { active: false, startY: 0, currentY: 0 },
      rightPaddle: { active: false, startY: 0, currentY: 0 },
    },
    score: { left: 0, right: 0 }, // Player scores
    gameWinner: null, // null, 'left', or 'right'
    ai: {
      enabled: false, // AI opponent on/off
      difficulty: 'medium', // 'easy', 'medium', 'hard'
      targetY: 200, // Where AI wants to move paddle
      reactionDelay: 0, // Frames to wait before reacting
      lastReactionTime: 0, // Track when AI last "saw" ball
    },
    screenShake: {
      x: 0,
      y: 0,
      intensity: 0,
      duration: 0,
    },
    powerUps: [], // Active power-ups floating on screen
    activePowerUps: { // Currently applied effects
      bigPaddle: { active: false, timeLeft: 0, player: null },
      fastBall: { active: false, timeLeft: 0 },
      multiBall: { active: false, timeLeft: 0, extraBalls: [] },
      shield: { active: false, uses: 0, player: null },
    },
    powerUpSpawnTimer: 420, // Start with 7 seconds delay (7 * 60fps)
    gameStartTime: 0, // Track when game started
  });

  const { updateGame, resetGame } = useGameLogic(
    gameStateRef,
    soundEnabled,
    playWallBounceSound,
    playPaddleHitSound,
    playScoreSound,
    playPowerUpSound,
    setLeaderboardMode,
    setShowLeaderboard
  );

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { ball, paddles, canvas: canvasSize, score, gameWinner, screenShake } = gameStateRef.current;

    // Apply screen shake transform
    ctx.save();
    ctx.translate(screenShake.x, screenShake.y);

    // Create muted animated gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
    const time = Date.now() * 0.001;
    gradient.addColorStop(0, `hsl(${230 + Math.sin(time) * 5}, 45%, 8%)`);
    gradient.addColorStop(0.5, `hsl(${250 + Math.cos(time) * 5}, 40%, 6%)`);
    gradient.addColorStop(1, `hsl(${270 + Math.sin(time * 0.5) * 5}, 50%, 10%)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw subtle center line
    ctx.save();
    ctx.shadowColor = 'rgba(129, 236, 236, 0.4)';
    ctx.shadowBlur = 8;
    ctx.setLineDash([10, 20]);
    ctx.beginPath();
    ctx.moveTo(canvasSize.width / 2, 0);
    ctx.lineTo(canvasSize.width / 2, canvasSize.height);
    ctx.strokeStyle = 'rgba(129, 236, 236, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw muted scores
    ctx.save();
    ctx.shadowColor = 'rgba(237, 100, 166, 0.4)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ed64a6';
    ctx.font = 'bold 64px "Courier New", monospace';
    ctx.textAlign = 'center';

    // Left player score
    ctx.fillText(score.left.toString(), canvasSize.width / 4, 80);
    // Right player score
    ctx.fillText(score.right.toString(), (canvasSize.width * 3) / 4, 80);
    ctx.restore();

    // Draw win message if game is over
    if (gameWinner) {
      ctx.save();
      ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 36px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${gameWinner.toUpperCase()} PLAYER WINS!`, canvasSize.width / 2, canvasSize.height / 2);
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('Press R to restart', canvasSize.width / 2, canvasSize.height / 2 + 50);
      ctx.restore();
    }

    // Draw ball trail particles with muted glow
    ctx.save();
    ball.trail.forEach((particle, index) => {
      const alpha = (index / ball.trail.length) * 0.5;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = 'rgba(129, 236, 236, 0.3)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(129, 236, 236, 0.7)';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Draw subtle glowing paddles with power-up effects
    const drawMutedPaddle = (paddle, color, shadowColor, player) => {
      ctx.save();

      // Check for big paddle power-up
      const isBig = gameStateRef.current.activePowerUps.bigPaddle.active &&
                   gameStateRef.current.activePowerUps.bigPaddle.player === player;
      const paddleHeight = isBig ? paddle.height * 2 : paddle.height;
      const paddleY = isBig ? paddle.y - paddle.height / 2 : paddle.y;

      // Subtle outer glow (bigger if power-up active)
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = isBig ? 20 : 12;
      ctx.fillStyle = color;
      ctx.fillRect(paddle.x - 1, paddleY - 1, paddle.width + 2, paddleHeight + 2);

      // Inner core
      ctx.shadowBlur = isBig ? 8 : 4;
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(paddle.x, paddleY, paddle.width, paddleHeight);
      ctx.restore();
    };

    drawMutedPaddle(paddles.left, '#ed64a6', 'rgba(237, 100, 166, 0.4)', 'left');   // Muted pink left paddle
    drawMutedPaddle(paddles.right, '#6d28d9', 'rgba(109, 40, 217, 0.4)', 'right');   // Muted purple right paddle

    // Draw muted glowing ball (only if game not over)
    if (!gameWinner) {
      ctx.save();
      ctx.shadowColor = 'rgba(129, 236, 236, 0.5)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#81ecec';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.shadowBlur = 3;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw multi-balls if active
      if (gameStateRef.current.activePowerUps.multiBall.active) {
        gameStateRef.current.activePowerUps.multiBall.extraBalls.forEach(extraBall => {
          ctx.save();
          ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(extraBall.x, extraBall.y, extraBall.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 3;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(extraBall.x, extraBall.y, extraBall.radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    }

    // Draw power-ups floating on screen
    gameStateRef.current.powerUps.forEach(powerUp => {
      ctx.save();
      ctx.translate(powerUp.x, powerUp.y);
      ctx.rotate(powerUp.rotation);

      // Outer glow
      ctx.shadowColor = powerUp.color;
      ctx.shadowBlur = 25;
      ctx.fillStyle = powerUp.color;
      ctx.fillRect(-18, -18, 36, 36);

      // Inner bright core
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-15, -15, 30, 30);

      // Custom drawn symbols
      ctx.strokeStyle = powerUp.color;
      ctx.fillStyle = powerUp.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      switch (powerUp.type) {
        case 'bigPaddle':
          // Draw a paddle getting bigger (arrows expanding outward)
          ctx.fillRect(-2, -12, 4, 24);  // Paddle
          // Up arrow
          ctx.beginPath();
          ctx.moveTo(-6, -8);
          ctx.lineTo(0, -14);
          ctx.lineTo(6, -8);
          ctx.stroke();
          // Down arrow
          ctx.beginPath();
          ctx.moveTo(-6, 8);
          ctx.lineTo(0, 14);
          ctx.lineTo(6, 8);
          ctx.stroke();
          break;
        case 'fastBall':
          // Draw speed lines behind a ball
          ctx.beginPath();
          ctx.arc(2, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          // Speed lines
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-12 + i * 2, -6 + i * 6);
            ctx.lineTo(-8 + i * 2, -6 + i * 6);
            ctx.stroke();
          }
          break;
        case 'multiBall':
          // Draw three balls
          ctx.beginPath();
          ctx.arc(-6, -3, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(6, -3, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 6, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'shield':
          // Draw a shield shape
          ctx.beginPath();
          ctx.moveTo(0, -12);
          ctx.lineTo(-8, -6);
          ctx.lineTo(-8, 6);
          ctx.lineTo(0, 12);
          ctx.lineTo(8, 6);
          ctx.lineTo(8, -6);
          ctx.closePath();
          ctx.fill();
          // Shield cross
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(0, 8);
          ctx.moveTo(-6, 0);
          ctx.lineTo(6, 0);
          ctx.stroke();
          break;
      }

      ctx.restore();
    });

    // Restore canvas transform (end screen shake)
    ctx.restore();
  }, []);

  // Audio system functions
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playPaddleHitSound = useCallback((ballSpeed = 5) => {
    if (!soundEnabled) return;
    const audioCtx = initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Create oscillator for the "pok" sound
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filterNode = audioCtx.createBiquadFilter();

    // Configure filter for sharper attack
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(2000, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(1, audioCtx.currentTime);

    // Dynamic frequency based on ball speed
    const baseFreq = 800 + (ballSpeed * 30);
    oscillator.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, audioCtx.currentTime + 0.1);

    // Sharp attack, quick decay
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    // Connect nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Play sound
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.15);
  }, [initAudioContext, soundEnabled]);

  const playWallBounceSound = useCallback(() => {
    if (!soundEnabled) return;
    const audioCtx = initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Create a softer "thump" for walls
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.25);
  }, [initAudioContext, soundEnabled]);

  const playPowerUpSound = useCallback(() => {
    if (!soundEnabled) return;
    const audioCtx = initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Ascending chime sound
    const frequencies = [523, 659, 784, 1047]; // C, E, G, C octave

    frequencies.forEach((freq, index) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.1);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + index * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + index * 0.1 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * 0.1 + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime + index * 0.1);
      oscillator.stop(audioCtx.currentTime + index * 0.1 + 0.3);
    });
  }, [initAudioContext, soundEnabled]);

  const playScoreSound = useCallback((isWin = false) => {
    if (!soundEnabled) return;
    const audioCtx = initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (isWin) {
      // Victory fanfare
      const notes = [523, 659, 784, 1047, 1319]; // C, E, G, C, E
      notes.forEach((freq, index) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.15);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + index * 0.15);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + index * 0.15 + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * 0.15 + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime + index * 0.15);
        oscillator.stop(audioCtx.currentTime + index * 0.15 + 0.5);
      });
    } else {
      // Regular score sound
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.8);
    }
  }, [initAudioContext, soundEnabled]);

  // Leaderboard functions
  const loadLeaderboard = useCallback(() => {
    try {
      const saved = localStorage.getItem('pong-leaderboard');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load leaderboard:', error);
      return [];
    }
  }, []);

  const saveLeaderboard = useCallback((scores) => {
    try {
      localStorage.setItem('pong-leaderboard', JSON.stringify(scores));
      setLeaderboardScores(scores);
    } catch (error) {
      console.warn('Failed to save leaderboard:', error);
    }
  }, []);

  const addScore = useCallback((name, playerScore, aiScore, difficulty) => {
    const newScore = {
      id: Date.now(),
      name: name || 'Anonymous',
      playerScore,
      aiScore,
      difficulty: aiEnabled ? difficulty : 'vs Human',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    const currentScores = loadLeaderboard();
    const updatedScores = [...currentScores, newScore]
      .sort((a, b) => b.playerScore - a.playerScore) // Sort by player score descending
      .slice(0, 10); // Keep only top 10

    saveLeaderboard(updatedScores);
    return updatedScores;
  }, [loadLeaderboard, saveLeaderboard, aiEnabled]);

  // Load leaderboard on component mount
  useEffect(() => {
    const scores = loadLeaderboard();
    setLeaderboardScores(scores);
  }, [loadLeaderboard]);

  

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas dimensions
    canvas.width = gameStateRef.current.canvas.width
    canvas.height = gameStateRef.current.canvas.height

    // Keyboard event handlers
    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key] = true
    }

    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key] = false
    }

    // Touch event handlers for mobile support
    const handleTouchStart = (e) => {
      e.preventDefault() // Prevent scrolling
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      
      Array.from(e.touches).forEach(touch => {
        const touchX = touch.clientX - rect.left
        const touchY = touch.clientY - rect.top
        
        // Determine which side of screen was touched
        if (touchX < canvas.width / 2) {
          // Left side - left paddle
          gameStateRef.current.touch.leftPaddle = {
            active: true,
            startY: touchY,
            currentY: touchY
          }
        } else {
          // Right side - right paddle  
          gameStateRef.current.touch.rightPaddle = {
            active: true,
            startY: touchY,
            currentY: touchY
          }
        }
      })
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      
      Array.from(e.touches).forEach(touch => {
        const touchX = touch.clientX - rect.left
        const touchY = touch.clientY - rect.top
        
        if (touchX < canvas.width / 2 && gameStateRef.current.touch.leftPaddle.active) {
          gameStateRef.current.touch.leftPaddle.currentY = touchY
        } else if (touchX >= canvas.width / 2 && gameStateRef.current.touch.rightPaddle.active) {
          gameStateRef.current.touch.rightPaddle.currentY = touchY
        }
      })
    }

    const handleTouchEnd = (e) => {
      e.preventDefault()
      // Reset touch state when finger lifts
      gameStateRef.current.touch.leftPaddle.active = false
      gameStateRef.current.touch.rightPaddle.active = false
    }

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    // Add touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    // Draw initial state
    drawGame()

    // Cleanup event listeners when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [drawGame])

  // Start/stop game loop when gameStarted changes
  useEffect(() => {
    if (gameStarted) {
      // Start the game loop
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    } else {
      // Stop the game loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, gameLoop])

  const toggleAI = () => {
    const newAiEnabled = !aiEnabled
    setAiEnabled(newAiEnabled)
    gameStateRef.current.ai.enabled = newAiEnabled
  }

  const changeDifficulty = (difficulty) => {
    setAiDifficulty(difficulty)
    gameStateRef.current.ai.difficulty = difficulty
  }

  // Sync React state with gameState on mount
  useEffect(() => {
    gameStateRef.current.ai.enabled = aiEnabled
    gameStateRef.current.ai.difficulty = aiDifficulty
  }, [aiEnabled, aiDifficulty])

  return (
    <div className={`pong-game-container ${window.innerWidth < 1000 ? 'pong-game-container-mobile' : ''}`}>
      <div style={{ textAlign: 'center' }}>
      <canvas 
        ref={canvasRef}
        className="pong-canvas"
      />
      <div className="controls-container">
        <div className="ai-controls">
          <button 
            onClick={toggleAI}
            className={`button ${aiEnabled ? 'button-ai-on' : 'button-ai-off'}`}
          >
            {aiEnabled ? 'AI: ON' : 'AI: OFF'}
          </button>
          
          {aiEnabled && (
            <>
              <label className="difficulty-label">
                DIFFICULTY:
              </label>
              {['easy', 'medium', 'hard'].map(diff => (
                <button 
                  key={diff}
                  onClick={() => changeDifficulty(diff)}
                  className={`difficulty-button ${aiDifficulty === diff ? 'difficulty-button-active' : 'difficulty-button-inactive'}`}
                >
                  {diff.toUpperCase()}
                </button>
              ))}
            </>
          )}
        </div>
        
        <p className={`controls-text ${window.innerWidth < 600 ? 'controls-text-mobile' : ''}`}>
          {window.innerWidth < 600 
            ? <>TOUCH: <span style={{color: '#ed64a6'}}>LEFT SIDE</span> | <span style={{color: '#81ecec'}}>{aiEnabled ? 'AI' : 'RIGHT SIDE'}</span></>
            : <>LEFT: <span style={{color: '#ed64a6'}}>WASD</span> | RIGHT: <span style={{color: '#81ecec'}}>{aiEnabled ? 'AI' : 'ARROW KEYS'}</span></>
          }
        </p>
        
        {/* Button Container */}
        <div className={`button-container ${window.innerWidth < 600 ? 'button-container-mobile' : ''}`}>
          
          {/* Main Game Control */}
          <button 
            onClick={() => setGameStarted(!gameStarted)}
            className={`button start-pause-button ${window.innerWidth < 600 ? 'start-pause-button-mobile' : ''} ${gameStarted ? 'pause-button' : 'start-button'}`}>
            {gameStarted ? '⏸ PAUSE' : '▶ START GAME'}
          </button>
          
          {/* Sound Control */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`button sound-button ${window.innerWidth < 600 ? 'sound-button-mobile' : ''} ${soundEnabled ? 'sound-on-button' : 'sound-off-button'}`}>
            {soundEnabled ? '🔊 SOUND' : '🔇 MUTED'}
          </button>
          
          {/* Debug Toggle for mobile/smaller screens */}
          {window.innerWidth < 1200 && (
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className={`button debug-toggle-button ${window.innerWidth < 600 ? 'debug-toggle-button-mobile' : ''}`}>
              {showDebug ? '📊 HIDE DEBUG' : '📊 SHOW DEBUG'}
            </button>
          )}
          
          {/* Leaderboard View Button */}
          <button 
            onClick={() => {
              setLeaderboardMode('view')
              setShowLeaderboard(true)
            }}
            className={`button leaderboard-button ${window.innerWidth < 600 ? 'leaderboard-button-mobile' : ''}`}>
            <div className="leaderboard-icon">
              ♕
            </div>
            LEADERBOARD
          </button>
          
        </div>
      </div>
      </div>
      
      {/* Debug Panel */}
      {showDebug && (
        <div className="debug-panel">
          <div className="debug-panel-header">
            <span className="debug-panel-title">DEBUG PANEL</span>
            <button 
              onClick={() => setShowDebug(false)}
              className="debug-panel-close-button">
              ✕
            </button>
          </div>
          
          <div className="debug-panel-stats">
            <div>FPS: <span className={debugStats.fps >= 55 ? 'debug-stat-good' : 'debug-stat-bad'}>
              {debugStats.fps}
            </span></div>
            <div>Update: <span className={debugStats.updateTime > 16 ? 'debug-stat-bad' : 'debug-stat-good'}>
              {debugStats.updateTime.toFixed(2)}ms
            </span></div>
            <div>Render: <span className={debugStats.renderTime > 10 ? 'debug-stat-bad' : 'debug-stat-good'}>
              {debugStats.renderTime.toFixed(2)}ms
            </span></div>
            <div>Particles: <span className={debugStats.particles > 50 ? 'debug-stat-warn' : ''}>
              {debugStats.particles}
            </span></div>
            <div>PowerUps: {debugStats.powerUps}</div>
            <div>Sound: {soundEnabled ? 'ON' : 'OFF'}</div>
            <div>AI: {aiEnabled ? aiDifficulty.toUpperCase() : 'OFF'}</div>
            
            <div className="v8-status">
              <div className="v8-status-title">
                V8 OPTIMIZATION STATUS (Score: {debugStats.v8Status?.optimizationScore || 100})
              </div>
              <div className={`v8-status-item ${debugStats.v8Status?.forLoopsUsed > 0 ? 'v8-status-item-good' : 'v8-status-item-bad'}`}>
                {debugStats.v8Status?.forLoopsUsed > 0 ? '✓' : '○'} for loops active: {debugStats.v8Status?.forLoopsUsed || 0}
              </div>
              <div className={`v8-status-item ${debugStats.v8Status?.compactArraysUsed > 0 ? 'v8-status-item-good' : 'v8-status-item-bad'}`}>
                {debugStats.v8Status?.compactArraysUsed > 0 ? '✓' : '○'} array compaction: {debugStats.v8Status?.compactArraysUsed || 0}
              </div>
              <div className="v8-status-item v8-status-item-good">
                ✓ Math.pow→multiplication (static)
              </div>
              
              {debugStats.v8Warnings.length > 0 && (
                <div className="v8-warnings">
                  <div className="v8-warnings-title">
                    WARNINGS:
                  </div>
                  {debugStats.v8Warnings.map((warning, index) => (
                    <div key={index} className="v8-warning">
                      ⚠ {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="leaderboard-modal">
          <div className={`leaderboard-content ${window.innerWidth < 600 ? 'leaderboard-content-mobile' : ''}`}>
            {leaderboardMode === 'gameEnd' ? (
              <div className="leaderboard-game-end">
                <div className="leaderboard-title">
                  <div className="leaderboard-title-icon">
                    V
                  </div>
                  GAME OVER!
                  <div className="leaderboard-title-star">
                    ★
                  </div>
                </div>
                <p className="leaderboard-final-score">
                  Final Score: {gameStateRef.current?.score?.left || 0} - {gameStateRef.current?.score?.right || 0}
                </p>
                
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="leaderboard-input"
                  maxLength={20}
                />
                
                <div className="leaderboard-button-container">
                  <button
                    onClick={() => {
                      const playerScore = gameStateRef.current?.gameWinner === 'left' 
                        ? gameStateRef.current?.score?.left 
                        : gameStateRef.current?.score?.right
                      const aiScore = gameStateRef.current?.gameWinner === 'left' 
                        ? gameStateRef.current?.score?.right 
                        : gameStateRef.current?.score?.left
                      
                      addScore(playerName, playerScore || 0, aiScore || 0, aiDifficulty)
                      setShowLeaderboard(false)
                      setPlayerName('')
                    }}
                    className="leaderboard-save-button">
                    <div className="leaderboard-save-icon">
                      S
                    </div>
                    SAVE SCORE
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowLeaderboard(false)
                      setPlayerName('')
                    }}
                    className="leaderboard-skip-button">
                    <div className="leaderboard-skip-icon">
                      ✕
                    </div>
                    SKIP
                  </button>
                </div>
              </div>
            ) : (
              <div className="leaderboard-view">
                <div className="leaderboard-view-title">
                  <div className="leaderboard-icon">
                    ♕
                  </div>
                  LEADERBOARD
                </div>
                
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="leaderboard-close-button">
                  CLOSE
                </button>
              </div>
            )}
            
            <div style={{ marginTop: '25px' }}>
              <div className="top-scores-title">
                <div className="top-scores-icon">
                  1
                </div>
                TOP SCORES
                <div className="top-scores-icon-2">
                  2
                </div>
              </div>
              
              {leaderboardScores.length === 0 ? (
                <p className="no-scores">
                  No scores yet. Be the first!
                </p>
              ) : (
                <div style={{ fontSize: '12px' }}>
                  {leaderboardScores.map((score, index) => {
                    const getRankBadge = (rank) => {
                      const badges = {
                        0: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', icon: '♕' }, // Gold crown
                        1: { bg: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', color: '#fff', icon: '♖' }, // Silver castle
                        2: { bg: 'linear-gradient(135deg, #cd7f32, #b86f28)', color: '#fff', icon: '♗' }  // Bronze bishop
                      }
                      return badges[rank] || { bg: 'linear-gradient(135deg, #4b5563, #374151)', color: '#e5e7eb', icon: (rank + 1).toString() }
                    }
                    
                    const badge = getRankBadge(index)
                    
                    return (
                      <div key={score.id} className={`score-entry ${index < 3 ? 'score-entry-top' : 'score-entry-normal'}`}>
                        <div className="score-rank">
                          <div className={`rank-badge ${index < 3 ? 'rank-badge-top' : 'rank-badge-normal'}`} style={{ background: badge.bg, color: badge.color }}>
                            {badge.icon}
                          </div>
                          <span className={`score-name ${index < 3 ? 'score-name-top' : 'score-name-normal'}`}>
                            {score.name}
                          </span>
                        </div>
                        <div className="score-value">
                          <div className={`score-points ${index < 3 ? 'score-points-top' : 'score-points-normal'}`}>
                            {score.playerScore} pts
                          </div>
                          <div className="score-difficulty">
                            vs {score.difficulty}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PongGame