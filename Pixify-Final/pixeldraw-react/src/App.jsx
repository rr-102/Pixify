import { useState, useRef } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import ColorPanel from './components/ColorPanel';
import { usePixelCanvas } from './hooks/usePixelCanvas';
import './App.css';

function App() {
  const {
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
    canUndo,
    canRedo,
  } = usePixelCanvas();

  const [recentColors, setRecentColors] = useState([]);
  const saveStateCalledRef = useRef(false);

  const handleColorChange = (color) => {
    setCurrentColor(color);

    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      const updated = [color, ...filtered].slice(0, 10);
      return updated;
    });
  };

  const handleCanvasSizeChange = (size) => {
    setCanvasSize(size);
  };

  const handleDrawPixel = (x, y) => {
    if (!saveStateCalledRef.current) {
      saveState();
      saveStateCalledRef.current = true;
    }
    return drawPixel(x, y);
  };

  const handleFloodFill = (x, y) => {
    saveState();
    floodFill(x, y);
  };

  const handleMouseUp = () => {
    saveStateCalledRef.current = false;
  };

  return (
    <div className="app-container" onMouseUp={handleMouseUp}>
      <header className="header">
        <h1>🎨 PixelDraw</h1>
      </header>

      <div className="main-content">
        <Toolbar
          currentTool={currentTool}
          onToolSelect={setCurrentTool}
          onUndo={undo}
          onRedo={redo}
          onClear={clearCanvas}
          canUndo={canUndo}
          canRedo={canRedo}
          canvasSize={canvasSize}
          onCanvasSizeChange={handleCanvasSizeChange}
          pixelSize={pixelSize}
          onPixelSizeChange={setPixelSize}
          showGrid={showGrid}
          onGridToggle={setShowGrid}
        />

        <Canvas
          canvasSize={canvasSize}
          pixelSize={pixelSize}
          showGrid={showGrid}
          currentTool={currentTool}
          currentColor={currentColor}
          canvasData={canvasData}
          onDrawPixel={handleDrawPixel}
          onFloodFill={handleFloodFill}
          onPickColor={(color) => {
            if (color) {
              handleColorChange(color);
              setCurrentTool('pen');
            }
          }}
        />

        <ColorPanel
          currentColor={currentColor}
          onColorChange={handleColorChange}
          recentColors={recentColors}
          canvasSize={canvasSize}
          canvasData={canvasData}
        />
      </div>
    </div>
  );
}

export default App;
