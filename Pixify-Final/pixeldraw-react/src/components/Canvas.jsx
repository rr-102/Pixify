import { useRef, useEffect, useState } from 'react';
import './Canvas.css';

function Canvas({
  canvasSize,
  pixelSize,
  showGrid,
  currentTool,
  currentColor,
  canvasData,
  onDrawPixel,
  onFloodFill,
  onPickColor,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPixel, setLastPixel] = useState(null);

  // Render canvas whenever data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const totalSize = canvasSize * pixelSize;

    // Clear canvas
    ctx.clearRect(0, 0, totalSize, totalSize);

    // Draw each pixel
    for (let y = 0; y < canvasSize; y++) {
      for (let x = 0; x < canvasSize; x++) {
        const color = canvasData[y][x];
        if (color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= canvasSize; x++) {
        const xPos = x * pixelSize;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, totalSize);
        ctx.stroke();
      }

      for (let y = 0; y <= canvasSize; y++) {
        const yPos = y * pixelSize;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(totalSize, yPos);
        ctx.stroke();
      }
    }
  }, [canvasData, canvasSize, pixelSize, showGrid]);

  const getPixelCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    if (x >= 0 && x < canvasSize && y >= 0 && y < canvasSize) {
      return { x, y };
    }
    return null;
  };

  const drawLine = (x0, y0, x1, y1) => {
    // Bresenham's line algorithm
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      onDrawPixel(x0, y0);

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  };

  const handleMouseDown = (e) => {
    const coords = getPixelCoords(e);
    if (!coords) return;

    if (currentTool === 'eyedropper') {
      const color = onPickColor(coords.x, coords.y);
      if (color) onPickColor(color);
      return;
    }

    if (currentTool === 'fill') {
      onFloodFill(coords.x, coords.y);
      return;
    }

    setIsDrawing(true);
    onDrawPixel(coords.x, coords.y);
    setLastPixel(coords);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    if (currentTool === 'eyedropper' || currentTool === 'fill') return;

    const coords = getPixelCoords(e);
    if (!coords) return;

    if (lastPixel) {
      drawLine(lastPixel.x, lastPixel.y, coords.x, coords.y);
    }

    setLastPixel(coords);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPixel(null);
  };

  const totalSize = canvasSize * pixelSize;
  const cursorClass = `cursor-${currentTool}`;

  return (
    <div className="canvas-container">
      <div className="canvas-wrapper" style={{ width: totalSize, height: totalSize }}>
        <canvas
          ref={canvasRef}
          width={totalSize}
          height={totalSize}
          className={cursorClass}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
}

export default Canvas;
