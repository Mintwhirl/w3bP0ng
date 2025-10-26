/**
 * W3BP0NG Theme Configuration
 * Canonical design system for liquid glass synthwave aesthetic
 *
 * This configuration defines the visual language for the entire W3BP0NG experience.
 * ALL modes, menus, transitions, and UI elements must use these tokens.
 *
 * Design Philosophy:
 * - Deep violet-blue cosmic backgrounds
 * - Glassmorphic translucent surfaces
 * - Magenta and cyan neon accents
 * - Smooth, weightless motion
 * - Depth through layering and blur
 */

export const W3BP0NG_THEME = {
  // ═══════════════════════════════════════════════════════════
  // COLOR SYSTEM
  // ═══════════════════════════════════════════════════════════
  colors: {
    // Background gradient stops (cosmic violet-blue)
    bg_primary_dark: '#0b001a',
    bg_primary_light: '#140033',
    bg_cosmic_overlay: 'rgba(20, 0, 51, 0.8)',

    // Neon accents (primary palette)
    accent_neon: '#a855f7',      // Magenta
    accent_cyan: '#22d3ee',       // Cyan
    accent_violet: '#8b5cf6',     // Soft violet

    // Text colors
    text_primary: '#ffffff',
    text_secondary: '#c084fc',    // Soft violet
    text_tertiary: 'rgba(255, 255, 255, 0.7)',
    text_glow: 'rgba(168, 85, 247, 0.6)',

    // Glass surface layers
    glass_highlight: 'rgba(255, 255, 255, 0.15)',
    glass_base: 'rgba(255, 255, 255, 0.05)',
    glass_border: 'rgba(255, 255, 255, 0.2)',

    // Shadows and glows
    shadow_neon_magenta: '0 0 20px rgba(168, 85, 247, 0.5)',
    shadow_neon_cyan: '0 0 20px rgba(34, 211, 238, 0.5)',
    shadow_soft: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow_soft: '0 0 10px rgba(168, 85, 247, 0.3)',

    // Particle system
    particle_white: 'rgba(255, 255, 255, 0.9)',
    particle_fade: 'rgba(255, 255, 255, 0.3)',
  },

  // ═══════════════════════════════════════════════════════════
  // GRADIENT DEFINITIONS
  // ═══════════════════════════════════════════════════════════
  gradients: {
    background_cosmic: 'linear-gradient(180deg, #0b001a 0%, #140033 100%)',
    background_radial: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
    glass_overlay: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
    neon_edge_magenta: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
    neon_edge_cyan: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
  },

  // ═══════════════════════════════════════════════════════════
  // GLASSMORPHISM TOKENS
  // ═══════════════════════════════════════════════════════════
  glass: {
    // Standard glass panel (buttons, cards)
    panel: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },

    // Elevated glass (modals, overlays)
    elevated: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      borderRadius: '20px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
    },

    // Subtle glass (HUD elements)
    subtle: {
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════
  typography: {
    fontFamily: {
      primary: 'Orbitron, "Courier New", monospace',
      fallback: '"Courier New", monospace',
    },

    textGlow: {
      primary: '0 0 10px rgba(168, 85, 247, 0.6)',
      subtle: '0 0 5px rgba(168, 85, 247, 0.3)',
      cyan: '0 0 10px rgba(34, 211, 238, 0.6)',
    },

    sizes: {
      heading_xl: '3rem',      // Mode titles
      heading_lg: '2rem',      // Section headers
      heading_md: '1.5rem',    // Card titles
      body_lg: '1.125rem',     // Primary text
      body_md: '1rem',         // Secondary text
      body_sm: '0.875rem',     // Tertiary text
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MOTION & ANIMATION
  // ═══════════════════════════════════════════════════════════
  motion: {
    // Easing curves (use globally)
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',

    // Durations
    duration: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s',
      transition: '0.8s',
    },

    // Hover effects
    hover: {
      scale: 1.03,
      brightness: 1.1,
      glowIntensity: 1.5,
    },

    // Animation keyframe definitions
    keyframes: {
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },

      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },

      fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
      },

      slideUp: {
        from: { transform: 'translateY(20px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },

      pulseGlow: {
        '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.3))' },
        '50%': { filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.6))' },
      },

      particleDrift: {
        '0%': { transform: 'translate(0, 0)' },
        '100%': { transform: 'translate(-100px, -100px)' },
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // PARTICLES
  // ═══════════════════════════════════════════════════════════
  particles: {
    background: {
      count: 50,
      opacity: { min: 0.3, max: 0.9 },
      size: { min: 1, max: 3 },
      blur: '2px',
      blendMode: 'screen',
      speed: 'slow',
    },

    ambient: {
      count: 100,
      opacity: { min: 0.1, max: 0.5 },
      size: { min: 0.5, max: 2 },
      blur: '1px',
      blendMode: 'screen',
      speed: 'very-slow',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // SPACING & LAYOUT
  // ═══════════════════════════════════════════════════════════
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  // ═══════════════════════════════════════════════════════════
  // BLUR & DEPTH
  // ═══════════════════════════════════════════════════════════
  blur: {
    subtle: '4px',
    normal: '8px',
    medium: '10px',
    strong: '16px',
    intense: '24px',
  },

  // ═══════════════════════════════════════════════════════════
  // Z-INDEX LAYERS
  // ═══════════════════════════════════════════════════════════
  zIndex: {
    background: 0,
    particles: 1,
    game: 10,
    hud: 50,
    menu: 100,
    modal: 200,
    settings: 300,
    tooltip: 400,
  },
};

// ═══════════════════════════════════════════════════════════
// CSS VARIABLE EXPORT
// Apply these to :root for global CSS access
// ═══════════════════════════════════════════════════════════
export function applyCSSVariables() {
  const root = document.documentElement;

  // Colors
  Object.entries(W3BP0NG_THEME.colors).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-${key.replace(/_/g, '-')}`, value);
  });

  // Gradients
  Object.entries(W3BP0NG_THEME.gradients).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-gradient-${key.replace(/_/g, '-')}`, value);
  });

  // Spacing
  Object.entries(W3BP0NG_THEME.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-spacing-${key}`, value);
  });

  // Border radius
  Object.entries(W3BP0NG_THEME.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-radius-${key}`, value);
  });

  // Blur
  Object.entries(W3BP0NG_THEME.blur).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-blur-${key}`, value);
  });

  // Motion
  root.style.setProperty('--w3b-ease', W3BP0NG_THEME.motion.ease);
  Object.entries(W3BP0NG_THEME.motion.duration).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-duration-${key}`, value);
  });
}

export default W3BP0NG_THEME;
