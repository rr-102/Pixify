import { useState, useEffect } from 'react';
import { hslToHex, hexToHSL, COLOR_PRESETS } from '../utils/colorUtils';
import './ColorPanel.css';

const EXPORT_SCALES = [
  { value: 1, label: '1× (Original)' },
  { value: 2, label: '2× (2x Size)' },
  { value: 4, label: '4× (4x Size)' },
  { value: 8, label: '8× (8x Size)' },
  { value: 10, label: '10× (10x Size)' },
];

function ColorPanel({ currentColor, onColorChange, recentColors, canvasSize, canvasData }) {
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 });
  const [hexInput, setHexInput] = useState('#ff0000');
  const [exportScale, setExportScale] = useState(4);

  // Update HSL when color changes externally
  useEffect(() => {
    setHsl(hexToHSL(currentColor));
    setHexInput(currentColor);
  }, [currentColor]);

  const handleSliderChange = (key, value) => {
    const newHsl = { ...hsl, [key]: Number(value) };
    setHsl(newHsl);
    const hex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    onColorChange(hex);
  };

  const handleHexChange = (e) => {
    let hex = e.target.value;
    setHexInput(hex);

    if (!hex.startsWith('#')) hex = '#' + hex;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onColorChange(hex.toLowerCase());
    }
  };

  const handleExport = () => {
    const canvas = document.createElement('canvas');
    const exportSize = canvasSize * exportScale;
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportSize, exportSize);

    // Draw pixels
    for (let y = 0; y < canvasSize; y++) {
      for (let x = 0; x < canvasSize; x++) {
        const color = canvasData[y][x];
        if (color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(x * exportScale, y * exportScale, exportScale, exportScale);
        }
      }
    }

    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixeldraw-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="color-panel">
      <h3>Color</h3>

      <div className="current-colors">
        <div className="color-display">
          <label>Current:</label>
          <div
            className="color-square"
            style={{ background: currentColor }}
            onClick={() => document.getElementById('hexInput').select()}
          />
        </div>
      </div>

      <div className="color-sliders">
        <div className="slider-group">
          <label>Hue:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={hsl.h}
            onChange={(e) => handleSliderChange('h', e.target.value)}
            className="slider color-slider"
          />
          <span>{hsl.h}°</span>
        </div>

        <div className="slider-group">
          <label>Saturation:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.s}
            onChange={(e) => handleSliderChange('s', e.target.value)}
            className="slider color-slider"
          />
          <span>{hsl.s}%</span>
        </div>

        <div className="slider-group">
          <label>Lightness:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.l}
            onChange={(e) => handleSliderChange('l', e.target.value)}
            className="slider color-slider"
          />
          <span>{hsl.l}%</span>
        </div>

        <div className="slider-group">
          <label>Hex:</label>
          <input
            type="text"
            id="hexInput"
            value={hexInput}
            onChange={handleHexChange}
            className="hex-input"
          />
        </div>
      </div>

      <div className="color-presets">
        <h4>Presets</h4>
        <div className="preset-grid">
          {COLOR_PRESETS.map(color => (
            <div
              key={color}
              className="preset-color"
              style={{ background: color }}
              onClick={() => onColorChange(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      {recentColors.length > 0 && (
        <div className="recent-colors">
          <h4>Recent</h4>
          <div className="recent-grid">
            {recentColors.map((color, idx) => (
              <div
                key={idx}
                className="recent-color"
                style={{ background: color }}
                onClick={() => onColorChange(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      <div className="export-settings">
        <h4>Export</h4>
        <select
          id="exportScale"
          className="setting-input"
          value={exportScale}
          onChange={(e) => setExportScale(Number(e.target.value))}
        >
          {EXPORT_SCALES.map(scale => (
            <option key={scale.value} value={scale.value}>
              {scale.label}
            </option>
          ))}
        </select>
        <button className="export-btn" onClick={handleExport}>
          Export PNG
        </button>
      </div>
    </div>
  );
}

export default ColorPanel;
