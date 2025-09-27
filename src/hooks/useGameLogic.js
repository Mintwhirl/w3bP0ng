
import { useCallback } from 'react';

export const useGameLogic = (gameStateRef, soundEnabled, playWallBounceSound, playPaddleHitSound, playScoreSound, playPowerUpSound, setLeaderboardMode, setShowLeaderboard) => {
  const checkLevelUp = useCallback(() => {
    const gameState = gameStateRef.current;
    const progress = gameState.progressBar;

    if (progress.currentXP >= progress.xpToNext) {
      progress.level++;
      progress.currentXP -= progress.xpToNext;
      progress.xpToNext = Math.floor(progress.xpToNext * 1.5); // Progressive XP requirements

      // Visual/audio feedback for level up
      addScreenShake(10, 20);
      // Could add level up sound here
    }
  }, [gameStateRef, addScreenShake]);

  const resetBall = useCallback(() => {
    const gameState = gameStateRef.current;
    gameState.ball.x = gameState.canvas.width / 2;
    gameState.ball.y = gameState.canvas.height / 2;
    // Significantly faster starting speed
    gameState.ball.dx = Math.random() > 0.5 ? 6 : -6;
    gameState.ball.dy = (Math.random() * 6 - 3) * 0.8; // More dynamic Y velocity
  }, [gameStateRef]);

  const resetGame = useCallback(() => {
    const gameState = gameStateRef.current;
    gameState.score.left = 0;
    gameState.score.right = 0;
    gameState.gameWinner = null;
    gameState.powerUps = [];
    gameState.powerUpSpawnTimer = 180;
    gameState.activePowerUps = {
      bigPaddle: { active: false, timeLeft: 0, player: null },
      fastBall: { active: false, timeLeft: 0 },
      multiBall: { active: false, timeLeft: 0, extraBalls: [] },
      shield: { active: false, uses: 0, player: null },
    };

    // HEALTHY ENGAGEMENT: Session tracking
    gameState.session.sessionsPlayed++;
    gameState.session.rallies = 0;
    gameState.gameStartTime = Date.now();

    // Gentle break suggestion after 20 minutes of play (non-intrusive)
    const now = Date.now();
    if (gameState.session.sessionsPlayed > 0 && gameState.session.sessionsPlayed % 8 === 0) {
      if (now - gameState.session.lastBreakSuggestion > 1200000) { // 20 minutes
        gameState.session.lastBreakSuggestion = now;
        // This would trigger a gentle visual hint, not a popup
        console.log("Consider taking a short break! 🌟");
      }
    }

    resetBall();
  }, [gameStateRef, resetBall]);

  const addScreenShake = useCallback((intensity = 5, duration = 10) => {
    const gameState = gameStateRef.current;
    gameState.screenShake.intensity = intensity;
    gameState.screenShake.duration = duration;
  }, [gameStateRef]);

  const updateScreenShake = useCallback(() => {
    const shake = gameStateRef.current.screenShake;
    if (shake.duration > 0) {
      shake.x = (Math.random() - 0.5) * shake.intensity;
      shake.y = (Math.random() - 0.5) * shake.intensity;
      shake.duration--;
      shake.intensity *= 0.9;
    } else {
      shake.x = 0;
      shake.y = 0;
      shake.intensity = 0;
    }
  }, [gameStateRef]);

  const predictBallY = useCallback((ball, paddleX) => {
    if (ball.dx === 0) return ball.y;
    const timeToReachPaddle = (paddleX - ball.x) / ball.dx;
    let futureY = ball.y + (ball.dy * timeToReachPaddle);
    const canvasHeight = gameStateRef.current.canvas.height;
    while (futureY < 0 || futureY > canvasHeight) {
      if (futureY < 0) {
        futureY = -futureY;
      } else if (futureY > canvasHeight) {
        futureY = 2 * canvasHeight - futureY;
      }
    }
    return futureY;
  }, [gameStateRef]);

  const getAISettings = useCallback((difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { speed: 5.5, reactionTime: 12, accuracy: 0.8, predictionEnabled: false };
      case 'medium':
        return { speed: 6.5, reactionTime: 6, accuracy: 0.9, predictionEnabled: true };
      case 'hard':
        return { speed: 7.5, reactionTime: 2, accuracy: 0.98, predictionEnabled: true };
      default:
        return { speed: 6.5, reactionTime: 6, accuracy: 0.9, predictionEnabled: true };
    }
  }, []);

  const updateAI = useCallback(() => {
    const gameState = gameStateRef.current;
    const { ball, paddles, ai, canvas } = gameState;
    if (!ai.enabled) return;
    const settings = getAISettings(ai.difficulty);
    if (ball.dx > 0) {
      if (Date.now() - ai.lastReactionTime > settings.reactionTime * 16.67) {
        let targetY;
        if (settings.predictionEnabled) {
          targetY = predictBallY(ball, paddles.right.x);
        } else {
          targetY = ball.y;
        }
        const inaccuracy = (1 - settings.accuracy) * 50;
        targetY += (Math.random() - 0.5) * inaccuracy;
        ai.targetY = targetY;
        ai.lastReactionTime = Date.now();
      }
      const paddleCenterY = paddles.right.y + paddles.right.height / 2;
      const difference = ai.targetY - paddleCenterY;
      if (Math.abs(difference) > 5) {
        const prevY = paddles.right.y;
        if (difference < 0) {
          paddles.right.y = Math.max(0, paddles.right.y - settings.speed);
        } else {
          paddles.right.y = Math.min(canvas.height - paddles.right.height, paddles.right.y + settings.speed);
        }
        paddles.right.velocity = paddles.right.y - prevY;
      }
    }
  }, [gameStateRef, getAISettings, predictBallY]);

  const checkPaddleCollision = useCallback((ball, paddle, player) => {
    const isBig = gameStateRef.current.activePowerUps.bigPaddle.active && gameStateRef.current.activePowerUps.bigPaddle.player === player;
    const paddleHeight = isBig ? paddle.height * 2 : paddle.height;
    const paddleY = isBig ? paddle.y - paddle.height / 2 : paddle.y;
    const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
    const closestY = Math.max(paddleY, Math.min(ball.y, paddleY + paddleHeight));
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared <= (ball.radius * ball.radius);
  }, [gameStateRef]);

  const spawnPowerUp = useCallback(() => {
    const gameState = gameStateRef.current;
    const powerUpTypes = [
      { type: 'bigPaddle', color: '#3b82f6', symbol: 'B' },
      { type: 'fastBall', color: '#ef4444', symbol: 'F' },
      { type: 'multiBall', color: '#f59e0b', symbol: 'M' },
      { type: 'shield', color: '#10b981', symbol: 'S' },
    ];
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const powerUp = {
      id: Date.now(),
      type: randomType.type,
      color: randomType.color,
      symbol: randomType.symbol,
      x: Math.random() * (gameState.canvas.width - 300) + 150,
      y: Math.random() * (gameState.canvas.height - 150) + 75,
      baseX: 0,
      baseY: 0,
      rotation: 0,
      bobOffset: Math.random() * Math.PI * 2,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.02 + Math.random() * 0.03,
      floatRadius: 20 + Math.random() * 15,
      maxFloatRadius: 20 + Math.random() * 15,
      spawnTime: Date.now(),
    };
    powerUp.baseX = powerUp.x;
    powerUp.baseY = powerUp.y;
    gameState.powerUps.push(powerUp);
  }, [gameStateRef]);

  const activatePowerUp = useCallback((powerUp, player = null) => {
    const gameState = gameStateRef.current;
    switch (powerUp.type) {
      case 'bigPaddle':
        gameState.activePowerUps.bigPaddle = { active: true, timeLeft: 480, player };
        break;
      case 'fastBall':
        gameState.activePowerUps.fastBall = { active: true, timeLeft: 360 };
        break;
      case 'multiBall':
        if (!gameState.activePowerUps.multiBall.active) {
          gameState.activePowerUps.multiBall = {
            active: true,
            timeLeft: 600,
            extraBalls: [
              { x: gameState.ball.x + 50, y: gameState.ball.y, dx: -gameState.ball.dx + (Math.random() - 0.5) * 2, dy: gameState.ball.dy + (Math.random() - 0.5) * 2, radius: 6, trail: [] },
              { x: gameState.ball.x - 50, y: gameState.ball.y, dx: -gameState.ball.dx + (Math.random() - 0.5) * 2, dy: gameState.ball.dy + (Math.random() - 0.5) * 2, radius: 6, trail: [] },
            ],
          };
        }
        break;
      case 'shield':
        gameState.activePowerUps.shield = { active: true, uses: 1, player };
        break;
    }
    gameState.powerUps = gameState.powerUps.filter(p => p.id !== powerUp.id);
    gameState.powerUpSpawnTimer = (2 + Math.random() * 8) * 60; // Much more frequent chaos!
    playPowerUpSound();
    addScreenShake(8, 15);
  }, [gameStateRef, playPowerUpSound, addScreenShake]);

  const updateGame = useCallback(() => {
    const gameState = gameStateRef.current;
    const { ball, canvas, paddles, keys } = gameState;

    if (keys['r'] || keys['R']) {
      resetGame();
      keys['r'] = false;
      keys['R'] = false;
    }

    if (gameState.gameWinner) return;

    updateScreenShake();

    gameState.powerUpSpawnTimer--;
    if (gameState.powerUpSpawnTimer <= 0 && gameState.powerUps.length === 0) {
      spawnPowerUp();
    }

    gameState.powerUps.forEach(powerUp => {
      powerUp.rotation += 0.05;
      powerUp.floatOffset += powerUp.floatSpeed;
      const timeElapsed = (Date.now() - powerUp.spawnTime) / 1000;
      const growthFactor = 1 + (timeElapsed / 10);
      powerUp.floatRadius = Math.min(powerUp.maxFloatRadius * growthFactor, 80);
      const floatX = Math.cos(powerUp.floatOffset) * powerUp.floatRadius;
      const floatY = Math.sin(powerUp.floatOffset * 0.7) * powerUp.floatRadius * 0.6;
      powerUp.x = powerUp.baseX + floatX;
      powerUp.y = powerUp.baseY + floatY;
      const margin = 30 + powerUp.floatRadius;
      powerUp.x = Math.max(margin, Math.min(gameState.canvas.width - margin, powerUp.x));
      powerUp.y = Math.max(margin, Math.min(gameState.canvas.height - margin, powerUp.y));
      if (powerUp.x === margin || powerUp.x === gameState.canvas.width - margin) {
        powerUp.baseX = powerUp.x;
      }
      if (powerUp.y === margin || powerUp.y === gameState.canvas.height - margin) {
        powerUp.baseY = powerUp.y;
      }
    });

    Object.keys(gameState.activePowerUps).forEach(key => {
      const powerUp = gameState.activePowerUps[key];
      if (powerUp.active && powerUp.timeLeft !== undefined) {
        powerUp.timeLeft--;
        if (powerUp.timeLeft <= 0) {
          powerUp.active = false;
          if (key === 'multiBall') {
            powerUp.extraBalls = [];
          }
        }
      }
    });

    paddles.left.prevY = paddles.left.y;
    if (keys['w'] || keys['W']) {
      paddles.left.y = Math.max(0, paddles.left.y - paddles.left.speed);
    }
    if (keys['s'] || keys['S']) {
      paddles.left.y = Math.min(canvas.height - paddles.left.height, paddles.left.y + paddles.left.speed);
    }
    if (gameState.touch.leftPaddle.active) {
      const touchDelta = gameState.touch.leftPaddle.currentY - gameState.touch.leftPaddle.startY;
      const newY = paddles.left.y + touchDelta * 0.8;
      paddles.left.y = Math.max(0, Math.min(canvas.height - paddles.left.height, newY));
      gameState.touch.leftPaddle.startY = gameState.touch.leftPaddle.currentY;
    }
    paddles.left.velocity = paddles.left.y - paddles.left.prevY;

    paddles.right.prevY = paddles.right.y;
    if (!gameState.ai.enabled) {
      if (keys['ArrowUp']) {
        paddles.right.y = Math.max(0, paddles.right.y - paddles.right.speed);
      }
      if (keys['ArrowDown']) {
        paddles.right.y = Math.min(canvas.height - paddles.right.height, paddles.right.y + paddles.right.speed);
      }
      if (gameState.touch.rightPaddle.active) {
        const touchDelta = gameState.touch.rightPaddle.currentY - gameState.touch.rightPaddle.startY;
        const newY = paddles.right.y + touchDelta * 0.8;
        paddles.right.y = Math.max(0, Math.min(canvas.height - paddles.right.height, newY));
        gameState.touch.rightPaddle.startY = gameState.touch.rightPaddle.currentY;
      }
    } else {
      updateAI();
    }
    paddles.right.velocity = paddles.right.y - paddles.right.prevY;

    let speedMultiplier = gameState.activePowerUps.fastBall.active ? 1.5 : 1;
    ball.x += ball.dx * speedMultiplier;
    ball.y += ball.dy * speedMultiplier;

    if (gameState.activePowerUps.multiBall.active) {
      gameState.activePowerUps.multiBall.extraBalls.forEach(extraBall => {
        extraBall.x += extraBall.dx * speedMultiplier;
        extraBall.y += extraBall.dy * speedMultiplier;
        extraBall.trail.push({ x: extraBall.x, y: extraBall.y, size: Math.random() * 2 + 1, life: 15 });
        let writeIndex = 0;
        for (let j = 0; j < extraBall.trail.length; j++) {
          const particle = extraBall.trail[j];
          particle.life--;
          particle.size *= 0.95;
          if (particle.life > 0) {
            if (writeIndex !== j) {
              extraBall.trail[writeIndex] = particle;
            }
            writeIndex++;
          }
        }
        extraBall.trail.length = writeIndex;
      });
    }

    for (let i = 0; i < gameState.powerUps.length; i++) {
      const powerUp = gameState.powerUps[i];
      const dx = ball.x - powerUp.x;
      const dy = ball.y - powerUp.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < ball.radius + 20) {
        const player = ball.dx > 0 ? 'right' : 'left';
        activatePowerUp(powerUp, player);
        break;
      }
    }

    ball.trail.push({ x: ball.x, y: ball.y, size: Math.random() * 3 + 2, life: 20 });
    let writeIndex = 0;
    for (let i = 0; i < ball.trail.length; i++) {
      const particle = ball.trail[i];
      particle.life--;
      particle.size *= 0.95;
      if (particle.life > 0) {
        if (writeIndex !== i) {
          ball.trail[writeIndex] = particle;
        }
        writeIndex++;
      }
    }
    ball.trail.length = writeIndex;

    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
      ball.dy = -ball.dy;
      playWallBounceSound();
      addScreenShake(3, 6);
    }

    if (ball.dx < 0 && checkPaddleCollision(ball, paddles.left, 'left')) {
      ball.dx = -ball.dx;
      ball.x = paddles.left.x + paddles.left.width + ball.radius;

      // HEALTHY ENGAGEMENT: Track rally progression
      gameState.session.rallies++;
      gameState.session.totalHits++;
      gameState.session.longestRally = Math.max(gameState.session.longestRally, gameState.session.rallies);

      // Award XP for skill-based actions (not just time)
      gameState.progressBar.currentXP += 5; // Base XP per hit

      // HARDCORE: Progressive ball acceleration - gets 10% faster each hit!
      ball.dx *= 1.1;
      ball.dy *= 1.1;

      const paddleInfluence = 0.4; // Increased for more chaos
      ball.dy += paddles.left.velocity * paddleInfluence;
      const hitPosition = (ball.y - (paddles.left.y + paddles.left.height / 2)) / (paddles.left.height / 2);
      ball.dy += hitPosition * 3.5; // More extreme angle changes
      ball.dy = Math.max(-15, Math.min(15, ball.dy)); // Allow faster Y speeds

      // Random chaos factor - 25% chance for surprise direction change
      if (Math.random() < 0.25) {
        ball.dy += (Math.random() - 0.5) * 6;
      }

      const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      if (currentSpeed < 4) { // Higher minimum speed
        const speedMultiplier = 4 / currentSpeed;
        ball.dx *= speedMultiplier;
        ball.dy *= speedMultiplier;
      }

      // Check for achievements (variable ratio rewards)
      if (gameState.session.rallies === 10 && !gameState.achievements.rally10) {
        gameState.achievements.rally10 = true;
        gameState.progressBar.currentXP += 50; // Bonus XP for achievement
      }
      if (gameState.session.rallies === 25 && !gameState.achievements.rally25) {
        gameState.achievements.rally25 = true;
        gameState.progressBar.currentXP += 100;
      }
      if (currentSpeed > 12 && !gameState.achievements.speedDemon) {
        gameState.achievements.speedDemon = true;
        gameState.progressBar.currentXP += 75;
      }

      const ballSpeedLeft = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      playPaddleHitSound(ballSpeedLeft);
      addScreenShake(8, 15); // More intense screen shake
    }

    if (ball.dx > 0 && checkPaddleCollision(ball, paddles.right, 'right')) {
      ball.dx = -ball.dx;
      ball.x = paddles.right.x - ball.radius;

      // HEALTHY ENGAGEMENT: Track rally progression
      gameState.session.rallies++;
      gameState.session.totalHits++;
      gameState.session.longestRally = Math.max(gameState.session.longestRally, gameState.session.rallies);

      // Award XP for skill-based actions (not just time)
      gameState.progressBar.currentXP += 5; // Base XP per hit

      // HARDCORE: Progressive ball acceleration - gets 10% faster each hit!
      ball.dx *= 1.1;
      ball.dy *= 1.1;

      const paddleInfluence = 0.4; // Increased for more chaos
      ball.dy += paddles.right.velocity * paddleInfluence;
      const hitPosition = (ball.y - (paddles.right.y + paddles.right.height / 2)) / (paddles.right.height / 2);
      ball.dy += hitPosition * 3.5; // More extreme angle changes
      ball.dy = Math.max(-15, Math.min(15, ball.dy)); // Allow faster Y speeds

      // Random chaos factor - 25% chance for surprise direction change
      if (Math.random() < 0.25) {
        ball.dy += (Math.random() - 0.5) * 6;
      }

      const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      if (currentSpeed < 4) { // Higher minimum speed
        const speedMultiplier = 4 / currentSpeed;
        ball.dx *= speedMultiplier;
        ball.dy *= speedMultiplier;
      }

      // Check for achievements (variable ratio rewards)
      if (gameState.session.rallies === 10 && !gameState.achievements.rally10) {
        gameState.achievements.rally10 = true;
        gameState.progressBar.currentXP += 50; // Bonus XP for achievement
      }
      if (gameState.session.rallies === 25 && !gameState.achievements.rally25) {
        gameState.achievements.rally25 = true;
        gameState.progressBar.currentXP += 100;
      }
      if (currentSpeed > 12 && !gameState.achievements.speedDemon) {
        gameState.achievements.speedDemon = true;
        gameState.progressBar.currentXP += 75;
      }

      const ballSpeedRight = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      playPaddleHitSound(ballSpeedRight);
      addScreenShake(8, 15); // More intense screen shake
    }

    if (gameState.activePowerUps.multiBall.active) {
      gameState.activePowerUps.multiBall.extraBalls.forEach(extraBall => {
        if (extraBall.y - extraBall.radius <= 0 || extraBall.y + extraBall.radius >= canvas.height) {
          extraBall.dy = -extraBall.dy;
          playWallBounceSound();
        }
        if (extraBall.dx < 0 && checkPaddleCollision(extraBall, paddles.left, 'left')) {
          extraBall.dx = -extraBall.dx;
          extraBall.x = paddles.left.x + paddles.left.width + extraBall.radius;
          const paddleInfluence = 0.25;
          extraBall.dy += paddles.left.velocity * paddleInfluence;
          const hitPosition = (extraBall.y - (paddles.left.y + paddles.left.height / 2)) / (paddles.left.height / 2);
          extraBall.dy += hitPosition * 1.5;
          extraBall.dy = Math.max(-6, Math.min(6, extraBall.dy));
          const extraBallSpeed = Math.sqrt(extraBall.dx * extraBall.dx + extraBall.dy * extraBall.dy);
          playPaddleHitSound(extraBallSpeed);
        }
        if (extraBall.dx > 0 && checkPaddleCollision(extraBall, paddles.right, 'right')) {
          extraBall.dx = -extraBall.dx;
          extraBall.x = paddles.right.x - extraBall.radius;
          const paddleInfluence = 0.25;
          extraBall.dy += paddles.right.velocity * paddleInfluence;
          const hitPosition = (extraBall.y - (paddles.right.y + paddles.right.height / 2)) / (paddles.right.height / 2);
          extraBall.dy += hitPosition * 1.5;
          extraBall.dy = Math.max(-6, Math.min(6, extraBall.dy));
          const extraBallSpeed = Math.sqrt(extraBall.dx * extraBall.dx + extraBall.dy * extraBall.dy);
          playPaddleHitSound(extraBallSpeed);
        }
      });
    }

    if (ball.x < 0) {
      gameState.score.right++;
      playScoreSound();

      // HEALTHY ENGAGEMENT: Reset rally counter and award XP for rally achievement
      if (gameState.session.rallies >= 5) {
        gameState.progressBar.currentXP += gameState.session.rallies * 2; // Bonus XP for rally length
      }
      gameState.session.rallies = 0; // Reset for new rally

      resetBall();
    } else if (ball.x > canvas.width) {
      gameState.score.left++;
      playScoreSound();

      // HEALTHY ENGAGEMENT: Reset rally counter and award XP for rally achievement
      if (gameState.session.rallies >= 5) {
        gameState.progressBar.currentXP += gameState.session.rallies * 2; // Bonus XP for rally length
      }
      gameState.session.rallies = 0; // Reset for new rally

      resetBall();
    }

    if (gameState.score.left >= 11) {
      gameState.gameWinner = 'left';
      playScoreSound(true);

      // HEALTHY ENGAGEMENT: Achievement tracking for player wins
      if (!gameState.achievements.firstWin) {
        gameState.achievements.firstWin = true;
        gameState.progressBar.currentXP += 200; // Big XP boost for first win
      }

      // Quick reflexes achievement (win in under 2 minutes)
      const gameTime = Date.now() - gameState.gameStartTime;
      if (gameTime < 120000 && !gameState.achievements.quickReflexes) {
        gameState.achievements.quickReflexes = true;
        gameState.progressBar.currentXP += 150;
      }

      gameState.progressBar.currentXP += 100; // Base win bonus

      if (gameState.score.left > gameState.score.right) {
        setLeaderboardMode('gameEnd');
        setShowLeaderboard(true);
      }
    } else if (gameState.score.right >= 11) {
      gameState.gameWinner = 'right';
      playScoreSound(true);
      if (!gameState.ai.enabled && gameState.score.right > gameState.score.left) {
        setLeaderboardMode('gameEnd');
        setShowLeaderboard(true);
      }
    }
    // HEALTHY ENGAGEMENT: Check for level progression at end of update
    checkLevelUp();

  }, [gameStateRef, resetGame, updateScreenShake, spawnPowerUp, activatePowerUp, updateAI, checkPaddleCollision, playWallBounceSound, playPaddleHitSound, playScoreSound, setLeaderboardMode, setShowLeaderboard, resetBall, checkLevelUp]);

  return {
    updateGame,
    resetGame,
  };
};
