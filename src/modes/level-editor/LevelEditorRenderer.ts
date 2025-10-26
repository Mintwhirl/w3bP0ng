/**
 * Level Editor Renderer
 * Renders the editor interface with grid, objects, and visual feedback
 */

import type {
  EditorState,
  PlacedObject,
  EditorGrid,
  EditorCamera,
} from './types';
import type {
  Block,
  Portal,
  BouncePad,
  GravityZone,
  Paddle,
} from '../physics-puzzle/types';

// ═══════════════════════════════════════════════════════════
// RENDERER CONFIGURATION
// ═══════════════════════════════════════════════════════════

const RENDERER_CONFIG = {
  // Grid
  gridLineColor: 'rgba(255, 255, 255, 0.1)',
  gridMajorColor: 'rgba(255, 255, 255, 0.2)',
  gridLineWidth: 1,
  gridMajorWidth: 2,

  // Selection
  selectionColor: 'rgba(168, 85, 247, 0.5)', // Magenta with transparency
  selectionBorderWidth: 2,
  selectionBorderColor: '#a855f7',

  // Hover
  hoverColor: 'rgba(34, 211, 238, 0.3)', // Cyan with transparency
  hoverBorderWidth: 1,
  hoverBorderColor: '#22d3ee',

  // Preview (object placement)
  previewColor: 'rgba(255, 255, 255, 0.3)',
  previewBorderWidth: 2,
  previewBorderColor: '#ffffff',
  previewInvalidColor: 'rgba(239, 68, 68, 0.3)', // Red for invalid placement
  previewInvalidBorder: '#ef4444',

  // Tools panel
  panelBackground: 'rgba(11, 0, 26, 0.9)', // Dark with transparency
  panelBorder: 'rgba(168, 85, 247, 0.3)',
  panelTextColor: '#ffffff',
  panelHoverBackground: 'rgba(168, 85, 247, 0.2)',

  // Object colors (fallbacks if not specified)
  blockNormalColor: '#3b82f6',
  blockToughColor: '#8b5cf6',
  blockTargetColor: '#ef4444',
  blockExplosiveColor: '#f97316',
  blockImmovableColor: '#6b7280',
  portalCyanColor: '#06b6d4',
  portalMagentaColor: '#a855f7',
  bouncePadColor: '#10b981',
  gravityZoneColor: '#fbbf24',
  paddleColor: '#ec4899',
};

// ═══════════════════════════════════════════════════════════
// MAIN RENDERER
// ═══════════════════════════════════════════════════════════

export class LevelEditorRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private camera: EditorCamera;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.camera = { x: 0, y: 0, zoom: 1.0 };
  }

  /**
   * Main render method - renders everything
   */
  render(state: EditorState, mousePos?: { x: number; y: number }) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set camera from state
    this.camera = state.camera;

    // Save context state
    this.ctx.save();

    // Apply camera transform
    this.applyCameraTransform();

    // Render layers
    this.renderGrid(state.grid);
    this.renderPlacedObjects(state.placedObjects);

    // Render preview object if hovering
    if (mousePos && state.mode === 'place') {
      this.renderPreviewObject(state, mousePos);
    }

    // Restore context state
    this.ctx.restore();

    // Render UI elements (not affected by camera)
    this.renderUI(state);
  }

  /**
   * Apply camera transformation (pan and zoom)
   */
  private applyCameraTransform() {
    const { width, height } = this.canvas;

    // Translate to center and scale
    this.ctx.translate(width / 2, height / 2);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-width / 2 + this.camera.x, -height / 2 + this.camera.y);
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenPos: { x: number; y: number }): { x: number; y: number } {
    const { width, height } = this.canvas;

    // Inverse transform
    const x = (screenPos.x - width / 2) / this.camera.zoom + width / 2 - this.camera.x;
    const y = (screenPos.y - height / 2) / this.camera.zoom + height / 2 - this.camera.y;

    return { x, y };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldPos: { x: number; y: number }): { x: number; y: number } {
    const { width, height } = this.canvas;

    // Forward transform
    const x = (worldPos.x - width / 2 + this.camera.x) * this.camera.zoom + width / 2;
    const y = (worldPos.y - height / 2 + this.camera.y) * this.camera.zoom + height / 2;

    return { x, y };
  }

  // ═══════════════════════════════════════════════════════════
  // GRID RENDERING
  // ═══════════════════════════════════════════════════════════

  private renderGrid(grid: EditorGrid) {
    if (!grid.visible) return;

    const { width, height } = this.canvas;
    const { size } = grid;

    this.ctx.strokeStyle = RENDERER_CONFIG.gridLineColor;
    this.ctx.lineWidth = RENDERER_CONFIG.gridLineWidth;

    // Draw vertical lines
    for (let x = 0; x <= width; x += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Draw major lines (every 5 grid cells)
    this.ctx.strokeStyle = RENDERER_CONFIG.gridMajorColor;
    this.ctx.lineWidth = RENDERER_CONFIG.gridMajorWidth;

    const majorSize = size * 5;

    for (let x = 0; x <= width; x += majorSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= height; y += majorSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  // ═══════════════════════════════════════════════════════════
  // OBJECT RENDERING
  // ═══════════════════════════════════════════════════════════

  private renderPlacedObjects(objects: PlacedObject[]) {
    objects.forEach(obj => {
      this.renderPlacedObject(obj);
    });
  }

  private renderPlacedObject(obj: PlacedObject) {
    const { type, position, data, selected } = obj;

    this.ctx.save();

    switch (type) {
      case 'block-normal':
      case 'block-tough':
      case 'block-target':
      case 'block-explosive':
      case 'block-immovable':
        this.renderBlock(data as Block, type);
        break;

      case 'portal-cyan':
      case 'portal-magenta':
        this.renderPortal(data as Portal, selected);
        break;

      case 'bounce-pad':
        this.renderBouncePad(data as BouncePad, selected);
        break;

      case 'gravity-zone':
        this.renderGravityZone(data as GravityZone, selected);
        break;

      case 'paddle':
        this.renderPaddle(data as Paddle, selected);
        break;
    }

    // Draw selection outline if selected
    if (selected) {
      this.drawSelectionOutline(obj);
    }

    this.ctx.restore();
  }

  private renderBlock(block: Block, type: string) {
    const { x, y, width, height, type: blockType } = block;

    // Set color based on block type
    let color = RENDERER_CONFIG.blockNormalColor;
    switch (blockType) {
      case 'tough':
        color = RENDERER_CONFIG.blockToughColor;
        break;
      case 'target':
        color = RENDERER_CONFIG.blockTargetColor;
        break;
      case 'explosive':
        color = RENDERER_CONFIG.blockExplosiveColor;
        break;
      case 'immovable':
        color = RENDERER_CONFIG.blockImmovableColor;
        break;
    }

    // Draw block with glassmorphism effect
    this.drawGlassPanel(x, y, width, height, color, 0.8);

    // Add icon/emblem for special blocks
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    let icon = '';
    switch (blockType) {
      case 'target':
        icon = '🎯';
        break;
      case 'explosive':
        icon = '💥';
        break;
      case 'immovable':
        icon = '🗿';
        break;
      case 'tough':
        icon = '💎';
        break;
    }

    if (icon) {
      this.ctx.fillText(icon, x + width / 2, y + height / 2);
    }
    this.ctx.restore();
  }

  private renderPortal(portal: Portal, selected: boolean) {
    const { x, y, radius, color, rotation } = portal;

    // Portal color
    const portalColor = color === 'cyan' ? RENDERER_CONFIG.portalCyanColor : RENDERER_CONFIG.portalMagentaColor;

    // Draw portal with gradient
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, portalColor);
    gradient.addColorStop(0.7, portalColor + '88');
    gradient.addColorStop(1, portalColor + '00');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw rotating ring
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.strokeStyle = portalColor;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 1.5);
    this.ctx.stroke();
    this.ctx.restore();

    // Draw center dot
    this.ctx.fillStyle = portalColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Highlight if selected
    if (selected) {
      this.ctx.strokeStyle = RENDERER_CONFIG.selectionBorderColor;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  }

  private renderBouncePad(bouncePad: BouncePad, selected: boolean) {
    const { x, y, width, height, angle, power } = bouncePad;

    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate(angle);

    // Draw pad body
    this.drawGlassPanel(-width / 2, -height / 2, width, height, RENDERER_CONFIG.bouncePadColor, 0.7);

    // Draw direction arrow
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 4, 0);
    this.ctx.lineTo(width / 4, 0);
    this.ctx.lineTo(width / 4 - 8, -8);
    this.ctx.moveTo(width / 4, 0);
    this.ctx.lineTo(width / 4 - 8, 8);
    this.ctx.stroke();

    this.ctx.restore();

    // Selection highlight
    if (selected) {
      this.ctx.strokeStyle = RENDERER_CONFIG.selectionBorderColor;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    }
  }

  private renderGravityZone(gravityZone: GravityZone, selected: boolean) {
    const { x, y, width, height, direction, strength } = gravityZone;

    // Draw zone with transparency
    this.ctx.fillStyle = RENDERER_CONFIG.gravityZoneColor + '33'; // 20% opacity
    this.ctx.fillRect(x, y, width, height);

    // Draw border
    this.ctx.strokeStyle = RENDERER_CONFIG.gravityZoneColor;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.setLineDash([]);

    // Draw direction arrow
    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);

    let rotation = 0;
    switch (direction) {
      case 'down':
        rotation = Math.PI / 2;
        break;
      case 'up':
        rotation = -Math.PI / 2;
        break;
      case 'left':
        rotation = Math.PI;
        break;
      case 'right':
        rotation = 0;
        break;
    }

    this.ctx.rotate(rotation);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('↓', 0, 0);
    this.ctx.restore();

    // Draw strength indicator
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`×${strength}`, x + 5, y + 15);

    // Selection highlight
    if (selected) {
      this.ctx.strokeStyle = RENDERER_CONFIG.selectionBorderColor;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    }
  }

  private renderPaddle(paddle: Paddle, selected: boolean) {
    const { x, y, width, height } = paddle;

    // Draw paddle with glassmorphism
    this.drawGlassPanel(x - width / 2, y - height / 2, width, height, RENDERER_CONFIG.paddleColor, 0.8);

    // Draw center line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - height / 2);
    this.ctx.lineTo(x, y + height / 2);
    this.ctx.stroke();

    // Selection highlight
    if (selected) {
      this.ctx.strokeStyle = RENDERER_CONFIG.selectionBorderColor;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x - width / 2 - 2, y - height / 2 - 2, width + 4, height + 4);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PREVIEW RENDERING
  // ═══════════════════════════════════════════════════════════

  private renderPreviewObject(state: EditorState, mousePos: { x: number; y: number }) {
    const { currentTool } = state;
    const worldPos = this.screenToWorld(mousePos);

    // Check if placement is valid
    const tempObject = createTempPlacedObject(currentTool, worldPos);
    const isValid = !checkObjectOverlap(tempObject, state.placedObjects);

    // Create temporary object for preview
    const previewObj: PlacedObject = {
      id: 'preview',
      type: currentTool,
      position: worldPos,
      data: tempObject.data,
      selected: false,
    };

    // Render with preview styling
    this.renderPlacedObjectWithStyle(previewObj, {
      fillColor: isValid ? RENDERER_CONFIG.previewColor : RENDERER_CONFIG.previewInvalidColor,
      borderColor: isValid ? RENDERER_CONFIG.previewBorderColor : RENDERER_CONFIG.previewInvalidBorder,
      fillOpacity: 0.3,
      borderWidth: 2,
    });
  }

  private renderPlacedObjectWithStyle(obj: PlacedObject, style: {
    fillColor: string;
    borderColor: string;
    fillOpacity: number;
    borderWidth: number;
  }) {
    const { type, data } = obj;

    this.ctx.save();
    this.ctx.globalAlpha = style.fillOpacity;

    switch (type) {
      case 'block-normal':
      case 'block-tough':
      case 'block-target':
      case 'block-explosive':
      case 'block-immovable':
        const block = data as Block;
        this.ctx.fillStyle = style.fillColor;
        this.ctx.fillRect(block.x, block.y, block.width, block.height);
        this.ctx.strokeStyle = style.borderColor;
        this.ctx.lineWidth = style.borderWidth;
        this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        break;

      case 'portal-cyan':
      case 'portal-magenta':
        const portal = data as Portal;
        this.ctx.fillStyle = style.fillColor;
        this.ctx.beginPath();
        this.ctx.arc(portal.x, portal.y, portal.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = style.borderColor;
        this.ctx.lineWidth = style.borderWidth;
        this.ctx.stroke();
        break;

      // Similar implementations for other object types...
    }

    this.ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════
  // UI RENDERING (not affected by camera)
  // ═══════════════════════════════════════════════════════════

  private renderUI(state: EditorState) {
    // Render mode indicator
    this.renderModeIndicator(state);

    // Render toolbar
    this.renderToolbar(state);

    // Render coordinate display
    this.renderCoordinates(state);
  }

  private renderModeIndicator(state: EditorState) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(11, 0, 26, 0.8)';
    this.ctx.fillRect(10, 10, 200, 30);
    this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    this.ctx.strokeRect(10, 10, 200, 30);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Orbitron, monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    const modeText = state.isTestMode ? 'TEST MODE' : state.mode.toUpperCase();
    const toolInfo = getToolInfo(state.currentTool);
    const toolName = toolInfo ? toolInfo.name : '';

    this.ctx.fillText(`${modeText} - ${toolName}`, 20, 25);
    this.ctx.restore();
  }

  private renderToolbar(state: EditorState) {
    // This would render the toolbar buttons
    // Implementation would depend on the specific toolbar design
  }

  private renderCoordinates(state: EditorState) {
    // Render mouse coordinates and grid info
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Grid: ${state.grid.size}px | Zoom: ${(state.camera.zoom * 100).toFixed(0)}%`, this.canvas.width - 10, this.canvas.height - 10);
    this.ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════
  // GLASSMORPHISM HELPERS
  // ═══════════════════════════════════════════════════════════

  private drawGlassPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    opacity: number = 0.6
  ) {
    // Create glassmorphism effect
    this.ctx.save();

    // Main fill with color and opacity
    this.ctx.fillStyle = color + Math.round(opacity * 255).toString(16).padStart(2, '0');
    this.ctx.fillRect(x, y, width, height);

    // Add subtle gradient overlay
    const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);

    // Add border glow
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 10;
    this.ctx.strokeStyle = color + '88'; // 50% opacity
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    this.ctx.restore();
  }

  private drawSelectionOutline(obj: PlacedObject) {
    this.ctx.strokeStyle = RENDERER_CONFIG.selectionBorderColor;
    this.ctx.lineWidth = RENDERER_CONFIG.selectionBorderWidth;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(
      obj.position.x - 5,
      obj.position.y - 5,
      10,
      10
    );
    this.ctx.setLineDash([]);
  }
}

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

function createTempPlacedObject(tool: string, position: { x: number; y: number }): PlacedObject {
  // Create a temporary object for overlap checking
  // This is a simplified version - would need full implementation
  return {
    id: 'temp',
    type: tool as any,
    position,
    data: {},
  };
}

function checkObjectOverlap(obj: PlacedObject, existingObjects: PlacedObject[]): boolean {
  // Check if object overlaps with existing objects
  // Simplified implementation - would need full collision detection
  return false;
}

function getToolInfo(toolId: string): { name: string } | undefined {
  // Get tool information
  // This would use the EDITOR_TOOLS array
  return undefined;
}