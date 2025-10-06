/**
 * Core type definitions for the game engine
 * Professional practice: Centralized types for consistency
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface Ball {
  x: number;
  y: number;
  dx: number; // velocity X
  dy: number; // velocity Y
  radius: number;
  trail: Particle[];
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  prevY: number;
  velocity: number;
}

export interface Particle {
  x: number;
  y: number;
  size: number;
  life: number;
}

export interface Bounds {
  width: number;
  height: number;
}

export interface CollisionResult {
  collided: boolean;
  normal?: Vector2D; // Normal vector of collision surface
  penetrationDepth?: number;
}

export interface PhysicsConfig {
  ballSpeedMultiplier: number;
  maxBallSpeed: number;
  minBallSpeed: number;
  paddleInfluence: number;
  bounceAngleFactor: number;
  chaosChance: number;
  chaosIntensity: number;
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  ballSpeedMultiplier: 1.1,
  maxBallSpeed: 15,
  minBallSpeed: 4,
  paddleInfluence: 0.4,
  bounceAngleFactor: 3.5,
  chaosChance: 0.25,
  chaosIntensity: 6,
};
