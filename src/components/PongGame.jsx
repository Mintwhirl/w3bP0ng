import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

const PongGame = () => {
  console.log('PongGame component rendering...');
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState('gameEnd'); // 'gameEnd' or 'view'
  const [playerName, setPlayerName] = useState('');
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const animationFrameRef = useRef(null);

  // Performance monitoring for production optimization
  const performanceMetrics = useRef({
    lastFrameTime: performance.now(),
    frameCount: 0,
  });
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
      left: { x: 20, y: 150, width: 12, height: 80, speed: 4.5, prevY: 150, velocity: 0 },
      right: { x: 770, y: 150, width: 12, height: 80, speed: 4.5, prevY: 150, velocity: 0 },
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
    powerUpSpawnTimer: 180, // Start with 3 seconds delay - more chaos!
    gameStartTime: 0, // Track when game started

    // Healthy engagement systems
    session: {
      rallies: 0, // Count of paddle hits in current rally
      longestRally: 0,
      totalHits: 0,
      sessionsPlayed: 0,
      playTime: 0,
      lastBreakSuggestion: 0,
    },
    achievements: {
      firstWin: false,
      rally10: false,
      rally25: false,
      rally50: false,
      speedDemon: false, // Hit ball over certain speed
      powerUpMaster: false, // Use all power-up types
      quickReflexes: false, // Win within 2 minutes
    },
    progressBar: {
      currentXP: 0,
      level: 1,
      xpToNext: 100,
    }
  });

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
  
    let updateGame, resetGame;
    try {
      console.log('Calling useGameLogic...');
      const gameLogic = useGameLogic(
        gameStateRef,
        soundEnabled,
        playWallBounceSound,
        playPaddleHitSound,
        playScoreSound,
        playPowerUpSound,
        setLeaderboardMode,
        setShowLeaderboard
      );
      updateGame = gameLogic.updateGame;
      resetGame = gameLogic.resetGame;
      console.log('useGameLogic succeeded');
    } catch (error) {
      console.error('useGameLogic failed:', error);
      updateGame = () => {};
      resetGame = () => {};
    }
  
    // Professional-grade rendering with error handling and optimization
    const drawGame = useCallback(() => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return; // Edge case: context creation failed

        const gameState = gameStateRef.current;
        if (!gameState) return; // Safety check

        const { ball, paddles, canvas: canvasSize, score, gameWinner, screenShake } = gameState;

        // Performance: Cache expensive calculations
        const currentTime = performance.now() * 0.001;
        const centerX = canvasSize.width * 0.5;
        const quarterX = canvasSize.width * 0.25;
        const threeQuarterX = canvasSize.width * 0.75;

        // Apply screen shake transform
        ctx.save();
        ctx.translate(screenShake.x, screenShake.y);

        // Performance: Create optimized animated background
        const gradient = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
        const sinTime = Math.sin(currentTime);
        const cosTime = Math.cos(currentTime);
        const halfSinTime = Math.sin(currentTime * 0.5);

        gradient.addColorStop(0, `hsl(${230 + sinTime * 5}, 45%, 8%)`);
        gradient.addColorStop(0.5, `hsl(${250 + cosTime * 5}, 40%, 6%)`);
        gradient.addColorStop(1, `hsl(${270 + halfSinTime * 5}, 50%, 10%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

        // Draw center line (optimized)
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 4;
        ctx.setLineDash([8, 16]);
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvasSize.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Draw scores (optimized with cached positions)
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(score.left.toString(), quarterX, 80);
        ctx.fillText(score.right.toString(), threeQuarterX, 80);
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

      } catch (error) {
        // Professional error handling - log but don't crash
        console.error('Rendering error in drawGame:', error);

        // Attempt graceful fallback rendering
        try {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Game temporarily unavailable', canvas.width / 2, canvas.height / 2);
          }
        } catch (fallbackError) {
          console.error('Critical rendering failure:', fallbackError);
        }
      }
    }, []);



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

  // Professional game loop with performance monitoring and memory optimization
  const gameLoop = useCallback(() => {
    try {
      if (!gameStarted || !gameStateRef.current) return;

      // Performance monitoring
      const metrics = performanceMetrics.current;
      const now = performance.now();

      // Prevent runaway loops - limit to 60fps max
      if (now - metrics.lastFrameTime < 16.67) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Update game state
      updateGame();

      // Render with error handling
      drawGame();

      // Memory management: Update performance metrics
      metrics.frameCount++;
      metrics.lastFrameTime = now;

      // Memory management: Garbage collection hints for large objects
      if (metrics.frameCount % 3600 === 0) { // Every 60 seconds at 60fps
        // Clear potential memory leaks in game state
        const gameState = gameStateRef.current;
        if (gameState.ball.trail.length > 100) {
          gameState.ball.trail = gameState.ball.trail.slice(-50);
        }
      }

      // Continue the loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);

    } catch (error) {
      console.error('Game loop error:', error);
      // Graceful degradation - stop the game but don't crash
      setGameStarted(false);
    }
  }, [gameStarted, updateGame, drawGame, setGameStarted]);

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
        role="img"
        aria-label={`Pong game. Score: ${gameStateRef.current?.score?.left || 0} to ${gameStateRef.current?.score?.right || 0}. ${gameStarted ? 'Game active' : 'Game paused'}. ${gameStateRef.current?.gameWinner ? `Winner: ${gameStateRef.current.gameWinner === 'left' ? 'Player' : 'Opponent'}` : ''}`}
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault();
            setGameStarted(!gameStarted);
          }
        }}
        aria-describedby="game-instructions"
      />
      <div id="game-instructions" className="sr-only">
        Use W and S keys to control left paddle, Up and Down arrows for right paddle. Space to start/pause.
        Current level: {gameStateRef.current?.progressBar?.level || 1}.
        {gameStateRef.current?.session?.rallies > 0 && `Current rally: ${gameStateRef.current.session.rallies} hits.`}
      </div>
      <div className="controls-container">
        <div className="ai-controls">
          <button
            onClick={toggleAI}
            className={`button ${aiEnabled ? 'button-ai-on' : 'button-ai-off'}`}
            aria-label={`AI opponent ${aiEnabled ? 'enabled' : 'disabled'}. Click to ${aiEnabled ? 'disable' : 'enable'} AI`}
            aria-pressed={aiEnabled}
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
            className={`button start-pause-button ${window.innerWidth < 600 ? 'start-pause-button-mobile' : ''} ${gameStarted ? 'pause-button' : 'start-button'}`}
            aria-label={gameStarted ? 'Pause game (Spacebar)' : 'Start game (Spacebar)'}
            aria-describedby="game-status"
            autoFocus={!gameStarted}
          >
            {gameStarted ? 'PAUSE' : 'START GAME'}
          </button>
          <div id="game-status" className="sr-only">
            Game is currently {gameStarted ? 'running' : 'stopped'}.
            {gameStateRef.current?.gameWinner && `Game over. ${gameStateRef.current.gameWinner === 'left' ? 'Player' : 'Opponent'} wins.`}
          </div>
          
          {/* Sound Control */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`button sound-button ${window.innerWidth < 600 ? 'sound-button-mobile' : ''} ${soundEnabled ? 'sound-on-button' : 'sound-off-button'}`}
            aria-label={`Sound effects ${soundEnabled ? 'enabled' : 'disabled'}. Click to ${soundEnabled ? 'disable' : 'enable'} sound`}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? 'SOUND ON' : 'SOUND OFF'}
          </button>
          
          
          {/* Leaderboard View Button */}
          <button 
            onClick={() => {
              setLeaderboardMode('view')
              setShowLeaderboard(true)
            }}
            className={`button leaderboard-button ${window.innerWidth < 600 ? 'leaderboard-button-mobile' : ''}`}>
            <div className="leaderboard-icon">
              L
            </div>
            LEADERBOARD
          </button>
          
        </div>
      </div>

      {/* Progress System - Healthy Engagement */}
      <div className="progress-container">
        <div className="progress-bar-wrapper">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${(gameStateRef.current?.progressBar?.currentXP || 0) / (gameStateRef.current?.progressBar?.xpToNext || 100) * 100}%`
              }}
            />
          </div>
          <div className="progress-text">
            Level {gameStateRef.current?.progressBar?.level || 1} • {gameStateRef.current?.progressBar?.currentXP || 0}/{gameStateRef.current?.progressBar?.xpToNext || 100} XP
          </div>
        </div>

        {/* Achievement indicators */}
        <div className="achievements-row">
          {gameStateRef.current?.achievements?.rally10 && <span className="achievement-badge">Rally Master</span>}
          {gameStateRef.current?.achievements?.speedDemon && <span className="achievement-badge">Speed Demon</span>}
          {gameStateRef.current?.achievements?.firstWin && <span className="achievement-badge">First Victory</span>}
          {gameStateRef.current?.achievements?.quickReflexes && <span className="achievement-badge">Quick Reflexes</span>}
        </div>
      </div>
      </div>

      
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
                    L
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
                        0: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', icon: '1' }, // Gold first
                        1: { bg: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', color: '#fff', icon: '2' }, // Silver second
                        2: { bg: 'linear-gradient(135deg, #cd7f32, #b86f28)', color: '#fff', icon: '3' }  // Bronze third
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