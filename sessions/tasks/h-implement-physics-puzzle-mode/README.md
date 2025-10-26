---
name: h-implement-physics-puzzle-mode
branch: feature/h-implement-physics-puzzle-mode
status: pending
created: 2025-10-25
---

# Physics Puzzle Mode Implementation

## Problem/Goal
Implement the first new game mode: Physics Puzzle Mode. This is a breakout-style puzzle game with Portal-inspired physics mechanics (gravity zones, teleporters, momentum preservation). The mode must match the liquid glass synthwave aesthetic of the main menu and establish visual/architectural patterns for future game modes.

## Success Criteria

### Core Gameplay
- [ ] Placeholder mode replaced with fully functional physics puzzle gameplay
- [ ] 5-10 hand-crafted levels with progressive difficulty
- [ ] Star rating system (1-3 stars based on performance)
- [ ] Unique physics mechanics implemented (gravity zones, portals, bounce pads, moving obstacles)
- [ ] Level progression and completion tracked via storage module

### Visual & Aesthetic Consistency
- [ ] All visuals, shaders, and particle systems inherit the same liquid glass / synthwave aesthetic and component tokens used by the MainMenu
- [ ] Lighting, blur layers, and color gradients follow existing W3BP0NG palette and depth rules
- [ ] Transitions, motion timing, and UI interactions match the smoothness and polish of the home screen
- [ ] Liquid glass synthwave aesthetic matches MainMenu visual language

### Performance & Polish
- [ ] The mode performs smoothly (no frame drops or input lag) at production scale in browsers
- [ ] Sound design (if added) aligns tonally with the MainMenu ambience — soft, futuristic, non-intrusive
- [ ] Mode is production-ready and playable from main menu

### Architecture & Reusability
- [ ] Code is modular and reusable for future modes (shared UI and game logic components)

## Context Manifest
<!-- Added by context-gathering agent -->

## User Notes

### W3BP0NG Aesthetic Spec (Canonical Design System)

**Visual Language:** Liquid Glass • Neon Glow • Cosmic Depth • Smooth Motion

#### Colors
- `bg_primary`: `#0b001a` (Deep violet-blue cosmic backdrop)
- `bg_secondary`: `#140033` (Slightly lighter gradient depth)
- `accent_neon`: `#a855f7` (Vibrant magenta glow)
- `accent_cyan`: `#22d3ee` (Soft cyan edge light)
- `glow_orbit`: `#8b5cf6` (Orbital hue for particle trails)
- `glass_highlight`: `rgba(255,255,255,0.2)` (Rim lighting)
- `glass_depth`: `rgba(255,255,255,0.05)`

#### Glassmorphism
- **backdropFilter**: `blur(12px) saturate(180%)`
- **background**: `rgba(255, 255, 255, 0.08)`
- **border**: `1px solid rgba(255, 255, 255, 0.15)`
- **borderRadius**: `1rem`
- **boxShadow**: `0 0 20px rgba(168, 85, 247, 0.25), 0 0 40px rgba(34, 211, 238, 0.15)`

#### Typography
- **fontFamily**: `Orbitron, sans-serif`
- **letterSpacing**: `0.05em`
- **textGlow**: `0 0 10px rgba(168, 85, 247, 0.5), 0 0 25px rgba(34, 211, 238, 0.3)`

#### Motion & Animation
- **ease**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **duration_short**: `0.3s`
- **duration_medium**: `0.6s`
- **duration_long**: `1s`
- **hover_scale**: `scale(1.03)`
- **float**: `transform 2s ease-in-out infinite alternate`

#### Particles & Lighting
- **Particle base_color**: `#a855f7`
- **Particle accent_color**: `#22d3ee`
- **Size range**: `[1, 4]px`
- **Opacity range**: `[0.3, 0.9]`
- **Blur**: `2px`
- **Glow blend mode**: `screen`
- **Trail length**: `0.8`
- **Emission rate**: `60/sec`
- **Motion pattern**: Float (amplitude: 8px, frequency: 2Hz)

**Lighting:**
- **ambient**: `rgba(168,85,247,0.15)` (Soft magenta field light)
- **edge_glow**: `rgba(34,211,238,0.2)` (Cyan rim light for depth)
- **highlight_intensity**: `0.6`
- **shadow_blur**: `20px`

#### Component Guidelines

**Button:**
```
padding: 0.75rem 1.5rem
background: rgba(255,255,255,0.08)
borderRadius: 0.75rem
border: 1px solid rgba(255,255,255,0.2)
boxShadow: 0 0 15px rgba(168,85,247,0.25), 0 0 30px rgba(34,211,238,0.15)
transition: all 0.3s ease
hover: {
  transform: scale(1.03)
  boxShadow: 0 0 25px rgba(168,85,247,0.4), 0 0 50px rgba(34,211,238,0.3)
}
```

**Card:**
```
background: rgba(255,255,255,0.05)
borderRadius: 1.25rem
border: 1px solid rgba(255,255,255,0.15)
backdropFilter: blur(10px)
boxShadow: 0 0 25px rgba(168,85,247,0.2), 0 0 40px rgba(34,211,238,0.1)
```

**Implementation Rules:**
- All new modes, menus, and levels must adhere to this theme
- Colors, motion, and particle properties come from W3BP0NG_THEME
- Avoid introducing new hues, blur levels, or animation curves without updating this config
- Keep lighting and particle intensities subtle—avoid harsh edges
- Everything should feel cohesive, glassy, and futuristic

## Work Log
<!-- Updated as work progresses -->
- [YYYY-MM-DD] Started task, initial research
