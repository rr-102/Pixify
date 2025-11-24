import './Toolbar.css';

const TOOLS = [
  { id: 'pen', icon: '✏️', label: 'Pen' },
  { id: 'eraser', icon: '🧹', label: 'Eraser' },
  { id: 'eyedropper', icon: '💧', label: 'Picker' },
  { id: 'fill', icon: '🪣', label: 'Fill' },
];

const CANVAS_SIZES = [
  { value: 16, label: '16×16' },
  { value: 32, label: '32×32' },
  { value: 64, label: '64×64' },
  { value: 128, label: '128×128' },
];

function Toolbar({
  currentTool,
  onToolSelect,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  canvasSize,
  onCanvasSizeChange,
  pixelSize,
  onPixelSizeChange,
  showGrid,
  onGridToggle,
}) {
  return (
    <div className="toolbar">
      <h3>Tools</h3>
      <div className="tool-buttons">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
            onClick={() => onToolSelect(tool.id)}
            title={tool.label}
          >
            <span>{tool.icon}</span>
            <span className="tool-label">{tool.label}</span>
          </button>
        ))}
      </div>

      <hr />

      <h3>Actions</h3>
      <div className="action-buttons">
        <button
          className="action-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          ↶ Undo
        </button>
        <button
          className="action-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          ↷ Redo
        </button>
        <button className="action-btn" onClick={onClear} title="Clear Canvas">
          🗑️ Clear
        </button>
      </div>

      <hr />

      <h3>Canvas Settings</h3>
      <div className="canvas-settings">
        <label htmlFor="canvasSize">Canvas Size:</label>
        <select
          id="canvasSize"
          className="setting-input"
          value={canvasSize}
          onChange={(e) => onCanvasSizeChange(Number(e.target.value))}
        >
          {CANVAS_SIZES.map(size => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        <label htmlFor="pixelSize">Pixel Scale:</label>
        <input
          type="range"
          id="pixelSize"
          min="4"
          max="32"
          value={pixelSize}
          onChange={(e) => onPixelSizeChange(Number(e.target.value))}
          className="slider"
        />
        <span className="pixel-size-value">{pixelSize}px</span>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => onGridToggle(e.target.checked)}
          />
          Show Grid
        </label>
      </div>
    </div>
  );
}

export default Toolbar;
