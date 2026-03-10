/**
 * Level Editor Mode Component
 * Main component for the level editor mode
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { ParticleBackground } from '../ui/ParticleBackground';
import LevelUI from './level-editor/LevelUI';
import { LevelEditorRenderer } from './level-editor/LevelEditorRenderer';
import {
  createInitialEditorState,
  placeObject,
  deleteObject,
  selectObject,
  moveObject,
  canPlaceObject,
  getObjectsAtPosition,
  undo,
  redo,
} from './level-editor/LevelEditorEngine';
import {
  editorStateToLevel,
  levelToCustomLevel,
} from './level-editor/LevelEditorEngine';
import {
  saveLevel,
  loadLevel,
  deleteLevel,
} from './level-editor/LevelData';
import type {
  EditorState,
  EditMode,
  PlaceableObjectType,
} from './level-editor/types';

export default function LevelEditorMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<LevelEditorRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [editorState, setEditorState] = useState<EditorState>(() =>
    createInitialEditorState(800, 600)
  );
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Initialize renderer when canvas is ready
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new LevelEditorRenderer(canvasRef.current, ctx);

    // Start render loop
    renderLoop();
  }, []);

  const renderLoop = useCallback(() => {
    if (!rendererRef.current) return;

    rendererRef.current.render(editorState, mousePos || undefined);
    
    // Skip animation in tests to prevent leaks and ReferenceErrors
    if (import.meta.env.MODE !== 'test') {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    }
  }, [editorState, mousePos]);

  // Handle mouse events
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!canvasRef.current || !rendererRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePos({ x, y });

    // Handle dragging
    if (isDragging && draggedObjectId && dragStart) {
      const worldPos = rendererRef.current.screenToWorld({ x, y });

      setEditorState((prevState) =>
        moveObject(prevState, draggedObjectId, {
          x: worldPos.x,
          y: worldPos.y,
        })
      );

      setDragStart(worldPos);
    }
  }, [isDragging, draggedObjectId, dragStart]);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!canvasRef.current || !rendererRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const worldPos = rendererRef.current.screenToWorld({ x, y });

    // Find objects at position
    const objectsAtPos = getObjectsAtPosition(worldPos, editorState.placedObjects);

    switch (editorState.mode) {
      case 'place':
        if (canPlaceObject(editorState.currentTool, editorState)) {
          setEditorState((prevState) =>
            placeObject(prevState, editorState.currentTool, worldPos)
          );
        }
        break;

      case 'select':
        if (objectsAtPos.length > 0) {
          const selectedObject = objectsAtPos[0];
          if (!selectedObject) return;

          setDraggedObjectId(selectedObject.id);
          setDragStart(worldPos);
          setIsDragging(true);

          setEditorState((prevState) =>
            selectObject(prevState, selectedObject.id, event.shiftKey)
          );
        } else {
          // Deselect all
          setEditorState((prevState) => ({
            ...prevState,
            placedObjects: prevState.placedObjects.map(obj => ({
              ...obj,
              selected: false,
            })),
          }));
        }
        break;

      case 'delete':
        if (objectsAtPos.length > 0) {
          const objectToDelete = objectsAtPos[0];
          if (!objectToDelete) return;

          setEditorState((prevState) =>
            deleteObject(prevState, objectToDelete.id)
          );
        }
        break;
    }
  }, [editorState.mode, editorState.currentTool, editorState.placedObjects]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedObjectId(null);
    setDragStart(null);
  }, []);

  const handleWheel = useCallback((event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;

    event.preventDefault();

    // Cycle through tools with scroll wheel
    const tools: PlaceableObjectType[] = [
      'block-normal',
      'block-tough',
      'block-target',
      'block-explosive',
      'block-immovable',
      'portal-cyan',
      'portal-magenta',
      'bounce-pad',
      'gravity-zone',
      'paddle',
    ];

    const currentIndex = tools.indexOf(editorState.currentTool);
    let newIndex: number;
    if (event.deltaY > 0) {
      newIndex = (currentIndex + 1) % tools.length;
    } else {
      newIndex = currentIndex === 0 ? tools.length - 1 : currentIndex - 1;
    }

    setEditorState((prevState) => ({
      ...prevState,
      currentTool: tools[newIndex] as PlaceableObjectType,
    }));
  }, [editorState.currentTool]);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleWheel]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        // Return to place mode
        setEditorState((prevState) => ({
          ...prevState,
          mode: 'place',
        }));
        break;

      case 'Delete':
      case 'Backspace':
        // Delete selected objects
        const selectedObjects = editorState.placedObjects.filter(obj => obj.selected);
        selectedObjects.forEach(obj => {
          setEditorState((prevState) => deleteObject(prevState, obj.id));
        });
        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        // Quick select tool
        const tools: PlaceableObjectType[] = [
          'block-normal',
          'block-tough',
          'block-target',
          'block-explosive',
          'block-immovable',
          'portal-cyan',
          'portal-magenta',
          'bounce-pad',
          'gravity-zone',
        ];
        const toolIndex = parseInt(event.key) - 1;
        if (toolIndex < tools.length) {
          setEditorState((prevState) => ({
            ...prevState,
            currentTool: tools[toolIndex] as PlaceableObjectType,
            mode: 'place',
          }));
        }
        break;

      case 'p':
        setEditorState((prevState) => ({
          ...prevState,
          mode: 'place',
        }));
        break;

      case 's':
        setEditorState((prevState) => ({
          ...prevState,
          mode: 'select',
        }));
        break;

      case 'd':
        setEditorState((prevState) => ({
          ...prevState,
          mode: 'delete',
        }));
        break;

      case 'g':
        setEditorState((prevState) => ({
          ...prevState,
          grid: {
            ...prevState.grid,
            visible: !prevState.grid.visible,
          },
        }));
        break;

      case 't':
        // Toggle test mode
        setEditorState((prevState) => ({
          ...prevState,
          isTestMode: !prevState.isTestMode,
        }));
        break;
    }
  }, [editorState.placedObjects]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // UI handlers
  const handleModeChange = useCallback((mode: EditMode) => {
    setEditorState((prevState) => ({
      ...prevState,
      mode,
    }));
  }, []);

  const handleToolChange = useCallback((tool: PlaceableObjectType) => {
    setEditorState((prevState) => ({
      ...prevState,
      currentTool: tool,
      mode: 'place',
    }));
  }, []);

  const handleSaveLevel = useCallback((name: string): boolean => {
    try {
      const level = editorStateToLevel(editorState);
      const customLevel = levelToCustomLevel(level, editorState);
      return saveLevel(name, customLevel);
    } catch (error) {
      console.error('Failed to save level:', error);
      return false;
    }
  }, [editorState]);

  const handleLoadLevel = useCallback((name: string) => {
    try {
      const customLevel = loadLevel(name);
      if (customLevel && customLevel.editorState) {
        setEditorState(customLevel.editorState);
      }
    } catch (error) {
      console.error('Failed to load level:', error);
    }
  }, []);

  const handleDeleteLevel = useCallback((name: string): boolean => {
    return deleteLevel(name);
  }, []);

  const handleTestLevel = useCallback(() => {
    setEditorState((prevState) => {
      const newState: EditorState = {
        ...prevState,
        isTestMode: !prevState.isTestMode,
      };

      if (!prevState.isTestMode) {
        newState.testModeState = {
          balls: [createInitialBall(400, 300)],
          paddle: createPaddle(400, 550),
          gameStarted: false,
        };
      }

      return newState;
    });
  }, []);

  const handleResetLevel = useCallback(() => {
    setEditorState((prevState) => ({
      ...prevState,
      placedObjects: [],
      levelMetadata: {
        ...prevState.levelMetadata,
        modified: Date.now(),
      },
    }));
  }, []);

  const handleGridToggle = useCallback(() => {
    setEditorState((prevState) => ({
      ...prevState,
      grid: {
        ...prevState.grid,
        visible: !prevState.grid.visible,
      },
    }));
  }, []);

  const handleUndo = useCallback(() => {
    setEditorState((prevState) => undo(prevState));
  }, []);

  const handleRedo = useCallback(() => {
    setEditorState((prevState) => redo(prevState));
  }, []);

  const canUndo = editorState.history.currentIndex > 0;
  const canRedo = editorState.history.currentIndex < editorState.history.states.length - 1;

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="level-editor-mode">
      {/* Particle background */}
      <ParticleBackground />

      {/* Canvas for editor */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="editor-canvas"
      />

      {/* UI overlay */}
      <LevelUI
        editorState={editorState}
        onModeChange={handleModeChange}
        onToolChange={handleToolChange}
        onSaveLevel={handleSaveLevel}
        onLoadLevel={handleLoadLevel}
        onDeleteLevel={handleDeleteLevel}
        onTestLevel={handleTestLevel}
        onResetLevel={handleResetLevel}
        onGridToggle={handleGridToggle}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        isTestMode={editorState.isTestMode}
      />

      <style>{`
        .level-editor-mode {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #0b001a 0%, #140033 100%);
        }

        .editor-canvas {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid rgba(168, 85, 247, 0.3);
          border-radius: 8px;
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.2);
          cursor: crosshair;
          z-index: 1;
        }

        .editor-canvas.select-mode {
          cursor: pointer;
        }

        .editor-canvas.delete-mode {
          cursor: not-allowed;
        }

        .editor-canvas.dragging {
          cursor: move;
        }
      `}</style>
    </div>
  );
}

// Helper functions for test mode
function createInitialBall(x: number, y: number) {
  return {
    x,
    y,
    vx: 3 * (Math.random() > 0.5 ? 1 : -1),
    vy: -3,
    radius: 8,
    active: true,
  };
}

function createPaddle(x: number, y: number) {
  return {
    x,
    y,
    width: 120,
    height: 15,
    vx: 0,
  };
}
