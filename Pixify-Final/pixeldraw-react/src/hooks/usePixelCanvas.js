import { useState, useCallback, useRef } from 'react';

const MAX_UNDO_STEPS = 20;

export function usePixelCanvas(initialSize = 32) {
  const [canvasSize, setCanvasSizeState] = useState(initialSize);
  const [pixelSize, setPixelSize] = useState(12);
  const [showGrid, setShowGrid] = useState(true);
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [currentTool, setCurrentTool] = useState('pen');

  // Canvas data - 2D array of colors
  const [canvasData, setCanvasData] = useState(() =>
    Array(initialSize).fill(null).map(() => Array(initialSize).fill('transparent'))
  );

  // Undo/Redo stacks
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const saveState = useCallback(() => {
    const state = canvasData.map(row => [...row]);
    undoStack.current.push(state);

    if (undoStack.current.length > MAX_UNDO_STEPS) {
      undoStack.current.shift();
    }

    redoStack.current = [];
  }, [canvasData]);

  const setCanvasSize = useCallback((size) => {
    const newCanvas = Array(size).fill(null).map(() => Array(size).fill('transparent'));
    setCanvasData(newCanvas);
    setCanvasSizeState(size);
    undoStack.current = [];
    redoStack.current = [];
  }, []);

  const drawPixel = useCallback((x, y) => {
    if (x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) return false;

    const color = currentTool === 'eraser' ? 'transparent' : currentColor;

    setCanvasData(prev => {
      if (prev[y][x] === color) return prev;

      const newData = prev.map(row => [...row]);
      newData[y][x] = color;
      return newData;
    });

    return true;
  }, [canvasSize, currentColor, currentTool]);

  const floodFill = useCallback((startX, startY) => {
    const targetColor = canvasData[startY][startX];
    const fillColor = currentColor;

    if (targetColor === fillColor) return;

    const newData = canvasData.map(row => [...row]);
    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) continue;
      if (newData[y][x] !== targetColor) continue;

      visited.add(key);
      newData[y][x] = fillColor;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    setCanvasData(newData);
  }, [canvasData, canvasSize, currentColor]);

  const pickColor = useCallback((x, y) => {
    const color = canvasData[y][x];
    return color !== 'transparent' ? color : null;
  }, [canvasData]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;

    const currentState = canvasData.map(row => [...row]);
    redoStack.current.push(currentState);

    const prevState = undoStack.current.pop();
    setCanvasData(prevState);
  }, [canvasData]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;

    const currentState = canvasData.map(row => [...row]);
    undoStack.current.push(currentState);

    const nextState = redoStack.current.pop();
    setCanvasData(nextState);
  }, [canvasData]);

  const clearCanvas = useCallback(() => {
    if (confirm('Clear the entire canvas?')) {
      saveState();
      const newCanvas = Array(canvasSize).fill(null).map(() => Array(canvasSize).fill('transparent'));
      setCanvasData(newCanvas);
    }
  }, [canvasSize, saveState]);

  return {
    canvasSize,
    setCanvasSize,
    pixelSize,
    setPixelSize,
    showGrid,
    setShowGrid,
    currentColor,
    setCurrentColor,
    currentTool,
    setCurrentTool,
    canvasData,
    drawPixel,
    floodFill,
    pickColor,
    undo,
    redo,
    clearCanvas,
    saveState,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  };
}
