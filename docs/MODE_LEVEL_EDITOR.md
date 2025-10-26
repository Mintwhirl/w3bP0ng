# Level Editor Mode Documentation

## Overview

The Level Editor Mode allows users to create, edit, and share custom physics puzzle levels for W3BP0NG. It provides a visual, drag-and-drop interface with real-time preview and testing capabilities.

### Features

- **Visual Level Creation**: Intuitive drag-and-drop placement of game objects
- **Real-time Testing**: Instantly test levels within the editor
- **Grid Snapping**: Precise object placement with optional grid alignment
- **Level Validation**: Automatic validation ensures playable levels
- **Import/Export**: Share levels via JSON files
- **Persistent Storage**: Save levels locally in browser storage
- **History System**: Full undo/redo functionality
- **Integration**: Seamless integration with Physics Puzzle Mode

## Architecture

### Directory Structure

```
src/modes/level-editor/
├── LevelEditorMode.tsx      # Main component and canvas rendering
├── LevelEditorEngine.ts      # Core logic and state management
├── LevelEditorRenderer.ts    # Visual rendering and effects
├── LevelUI.tsx             # User interface with GlassHUD components
├── LevelData.ts            # Storage and persistence utilities
└── types.ts               # TypeScript definitions and interfaces
```

### Core Components

#### LevelEditorEngine

Manages level creation logic, object placement, and state transitions.

**Key Functions:**
- `placeObject()` - Add new objects to the level
- `deleteObject()` - Remove objects from the level
- `moveObject()` - Reposition existing objects
- `validateLevel()` - Ensure level playability
- `editorStateToLevel()` - Convert editor state to playable level

#### LevelEditorRenderer

Handles all visual rendering using Canvas 2D API with glassmorphism effects.

**Features:**
- Grid rendering with customizable snap
- Object highlighting and selection
- Preview mode for object placement
- Smooth animations and transitions
- Visual feedback for invalid placement

#### LevelUI

Provides the user interface using W3BP0NG's GlassHUD component system.

**Panels:**
- **Toolbar**: Mode selection and controls
- **Tools Panel**: Object palette and placement tools
- **Level Info**: Current level metadata
- **Control Panel**: Save/load/test actions

## Object Types

### Blocks

| Type | Health | Points | Description |
|------|--------|---------|-------------|
| Normal | 1 | 100 | Standard breakable block |
| Tough | 3 | 100 | Requires 3 hits to destroy |
| Target | 1 | 500 | Must be destroyed to complete level |
| Explosive | 1 | 200 | Damages nearby blocks when destroyed |
| Immovable | ∞ | 0 | Cannot be destroyed, affects ball trajectory |

### Portals

Teleport the ball between connected portals.

- **Cyan Portal**: Entry point
- **Magenta Portal**: Exit point
- **Rotation**: Determines exit angle
- **Pairing**: Automatically linked when placed

### Special Elements

#### Bounce Pads
- Launch ball in specific direction
- Adjustable angle and power
- Visual direction indicator

#### Gravity Zones
- Modify ball physics within area
- Four directions: up, down, left, right
- Adjustable strength multiplier

#### Paddle
- Player starting position
- One per level maximum
- Standard 120x15px size

## User Interface

### Control Modes

1. **Place Mode** (P)
   - Click to place selected tool
   - Visual preview of placement
   - Automatic collision detection

2. **Select Mode** (S)
   - Click to select objects
   - Drag to move selected objects
   - Multi-select with Shift+click

3. **Delete Mode** (D)
   - Click to delete objects
   - Immediate visual feedback

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `1-9` | Quick select tool |
| `P` | Place mode |
| `S` | Select mode |
| `D` | Delete mode |
| `G` | Toggle grid |
| `T` | Test mode |
| `Ctrl+S` | Save level |
| `Ctrl+O` | Load level |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` | Delete selected |
| `Esc` | Return to place mode |

### Tool Palette

| Tool | Shortcut | Description |
|------|----------|-------------|
| Normal Block | 1 | Standard breakable block |
| Tough Block | 2 | 3-hit block |
| Target Block | 3 | Required objective |
| Explosive Block | 4 | Area damage |
| Immovable Block | 5 | Permanent obstacle |
| Cyan Portal | 6 | Entry portal |
| Magenta Portal | 7 | Exit portal |
| Bounce Pad | 8 | Directional launcher |
| Gravity Zone | 9 | Physics modifier |
| Paddle | 0 | Player start position |

## Level Validation

### Validation Rules

1. **Level Name**: Must have a non-empty name
2. **Portal Pairs**: Cyan and magenta portals must be matched
3. **Canvas Bounds**: All objects must be within playable area
4. **Paddle Position**: Paddle should be in reasonable location
5. **Object Limits**: Maximum constraints on object types

### Validation Process

```typescript
const validation = validateLevel(customLevel);
if (!validation.valid) {
  console.error('Level errors:', validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn('Level warnings:', validation.warnings);
}
```

## Storage System

### Local Storage

Levels are saved to browser's localStorage with automatic backup:

```javascript
// Storage key
localStorage.setItem('w3bp0ng_levels', JSON.stringify(levelData));

// Backup key
localStorage.setItem('w3bp0ng_levels_backup', JSON.stringify(previousData));
```

### Storage Functions

```typescript
// Save level
const success = saveLevel('My Level', customLevel);

// Load level
const level = loadLevel('My Level');

// List all levels
const levels = listLevels();

// Delete level
const deleted = deleteLevel('My Level');
```

### Storage Limits

- **Maximum Levels**: 100 custom levels
- **Storage Size**: ~5MB (typical browser limit)
- **Backup System**: Automatic backup on save
- **Repair Function**: Corrupted storage recovery

## Import/Export

### Export Format

```json
{
  "levelData": {
    "blocks": [...],
    "portals": [...],
    "bouncePads": [...],
    "gravityZones": [...],
    "goal": {...}
  },
  "metadata": {
    "name": "Level Name",
    "description": "Description",
    "difficulty": 3,
    "author": "Player"
  },
  "exportVersion": "1.0.0",
  "exportDate": "2025-01-15T10:30:00.000Z"
}
```

### Export Functions

```typescript
// Export single level
const json = exportLevel('My Level', { pretty: true });

// Export all levels
const allJson = exportAllLevels();

// Import level
const result = importLevel(jsonString, 'Imported Level');
```

## Integration with Physics Puzzle Mode

### Custom Level Loading

The Physics Puzzle Mode automatically detects and loads custom levels:

```typescript
// Built-in levels
getLevel(1); // Returns built-in level 1

// Custom levels
loadLevel('My Level'); // Returns custom level data
```

### Level Selection

- **Built-in Tab**: Select from pre-designed levels
- **Custom Tab**: Browse and play user-created levels
- **Automatic Progression**: Seamless transition between level types

## Design System Compliance

### Glassmorphism Implementation

All UI components follow W3BP0NG's liquid glass synthwave aesthetic:

- **Panels**: Translucent with blur effects
- **Buttons**: Neon accent borders and hover states
- **Typography**: Orbitron font with glow effects
- **Colors**: Magenta (#a855f7) and cyan (#22d3ee) palette

### Animation Standards

```css
/* Smooth cubic-bezier transitions */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Neon glow effects */
filter: drop-shadow(0 0 10px currentColor);

/* Glass panel effect */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
```

## Performance Optimization

### Rendering Optimizations

1. **Canvas Rendering**: Efficient 2D context usage
2. **Object Pooling**: Reuse object instances
3. **Viewport Culling**: Only render visible objects
4. **Animation Frame**: Use requestAnimationFrame for smooth updates

### Memory Management

1. **History Limiting**: Maximum 50 undo/redo states
2. **Object Cleanup**: Proper cleanup on component unmount
3. **Storage Limits**: Prevent localStorage overflow
4. **Garbage Collection**: Manual cleanup of references

## Testing and Debugging

### Test Mode Features

- **Live Physics**: Real ball physics simulation
- **Scoring**: Track points, hits, and time
- **Pause/Resume**: Full game controls during testing
- **Quick Exit**: Return to editor with one click

### Debug Information

```typescript
// Enable debug logging
const editorState = createInitialEditorState(800, 600);
console.log('Objects placed:', editorState.placedObjects.length);
console.log('Current tool:', editorState.currentTool);
console.log('Grid enabled:', editorState.grid.visible);
```

### Error Handling

- **Storage Errors**: Graceful fallback to empty storage
- **Import Errors**: Detailed validation feedback
- **Rendering Errors**: Canvas error recovery
- **State Errors**: Automatic state reset on corruption

## Best Practices

### Level Design Guidelines

1. **Start Simple**: Begin with basic block layouts
2. **Test Frequently**: Use test mode to validate gameplay
3. **Progressive Difficulty**: Introduce mechanics gradually
4. **Portal Placement**: Ensure clear entry/exit paths
5. **Visual Clarity**: Make objectives obvious to players

### Performance Tips

1. **Object Limits**: Don't exceed ~50 objects per level
2. **Portal Count**: Limit to 5 pairs (10 total)
3. **Avoid Overlap**: Use grid snap for precise placement
4. **Save Often**: Use Ctrl+S frequently
5. **Clean Up**: Delete unused objects

### File Management

1. **Descriptive Names**: Use clear, unique level names
2. **Regular Backups**: Export important levels
3. **Version Control**: Add version numbers for iterations
4. **Storage Monitoring**: Check available space in settings

## Troubleshooting

### Common Issues

**Problem**: Can't place objects
**Solution**: Check if you're in Place mode and have valid placement area

**Problem**: Portal teleportation not working
**Solution**: Ensure cyan and magenta portals are paired

**Problem**: Level won't save
**Solution**: Check validation errors and ensure level has a name

**Problem**: Custom levels not appearing
**Solution**: Clear browser storage or use import function

### Recovery Options

1. **Storage Repair**: Settings → Repair Storage
2. **Backup Restore**: Automatic backup restoration
3. **Import Recovery**: Export levels regularly for backup

## Future Enhancements

### Planned Features

- **Multi-level Campaigns**: Link multiple levels together
- **Achievement System**: Unlock rewards for level creation
- **Community Sharing**: Online level browser and ratings
- **Advanced Tools**: Scripting and conditional logic
- **Visual Themes**: Different visual styles for levels

### API Extensions

```typescript
// Future scripting support
interface LevelScript {
  triggers: TriggerEvent[];
  conditions: ConditionLogic[];
  actions: ScriptAction[];
}

// Future achievement system
interface LevelAchievement {
  id: string;
  name: string;
  description: string;
  requirement: AchievementCondition;
  reward: RewardType;
}
```

---

The Level Editor Mode provides a comprehensive tool for creating engaging physics puzzle levels while maintaining W3BP0NG's signature visual style and performance standards.