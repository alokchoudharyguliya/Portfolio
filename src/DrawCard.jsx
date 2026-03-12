import React, { useRef, useEffect, useState, useCallback } from 'react';
import './DrawCard.css';
import { useDrawing } from './hooks/useDrawings';

const DrawCard = ({ drawingId: initialId = null, initialTitle = 'Untitled', onClose = null }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const strokesRef = useRef([]);         // all committed strokes (relative coords)
  const currentStrokeRef = useRef(null); // stroke currently being drawn
  const [color, setColor] = useState('#000000');
  const [isEraser, setIsEraser] = useState(false);
  const [penSize, setPenSize] = useState(3);
  const [eraserSize, setEraserSize] = useState(14);
  const [drawingTitle, setDrawingTitle] = useState(initialTitle);
  const { savedId, saving, saveError, save, load } = useDrawing(initialId);

  // Replay all strokes from strokesRef onto the canvas using relative→absolute coords
  const replayAllStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const w = parseFloat(canvas.style.width);
    const h = parseFloat(canvas.style.height);
    strokesRef.current.forEach((stroke) => {
      if (!stroke.points || stroke.points.length < 2) return;
      ctx.save();
      ctx.globalCompositeOperation = stroke.composite || 'source-over';
      ctx.strokeStyle = stroke.color || '#000000';
      ctx.lineWidth = stroke.width || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0][0] * w, stroke.points[0][1] * h);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i][0] * w, stroke.points[i][1] * h);
      }
      ctx.stroke();
      ctx.restore();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentNode;
      const rect = parent.getBoundingClientRect();
      // set pixel size for sharpness
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctxRef.current = ctx;
      // Re-draw existing strokes after any resize
      replayAllStrokes();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load an existing drawing if initialId was provided
  useEffect(() => {
    if (!initialId) return;
    load(initialId)
      .then((data) => {
        if (data?.strokes) {
          strokesRef.current = data.strokes;
          if (data.title) setDrawingTitle(data.title);
          // defer replay until after canvas initialisation
          requestAnimationFrame(() => replayAllStrokes());
        }
      })
      .catch(console.error);
  }, [initialId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5
    };
  };

  // update context when color or eraser changes
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }
    // update base line width when sizes change
    ctx.lineWidth = isEraser ? eraserSize : penSize;
  }, [color, isEraser, penSize, eraserSize]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    const p = getPoint(e);
    drawingRef.current = true;
    lastRef.current = p;
    // start a new stroke — store coords as relative (0-1) fractions
    const rect = canvasRef.current.getBoundingClientRect();
    currentStrokeRef.current = {
      color: isEraser ? null : color,
      width: isEraser ? eraserSize : penSize,
      composite: isEraser ? 'destination-out' : 'source-over',
      points: [[p.x / rect.width, p.y / rect.height]],
    };
  };

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = getPoint(e);
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    // draw on canvas
    ctx.beginPath();
    const basePen = Math.max(1, penSize);
    ctx.lineWidth = isEraser
      ? Math.max(4, eraserSize * (p.pressure || 1))
      : Math.max(1, basePen * (p.pressure || 0.6));
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    // record relative point
    const rect = canvas.getBoundingClientRect();
    if (currentStrokeRef.current) {
      currentStrokeRef.current.points.push([p.x / rect.width, p.y / rect.height]);
    }
  };

  const stopDrawing = (e) => {
    if (!drawingRef.current) return;
    e && e.preventDefault();
    drawingRef.current = false;
    // commit stroke if it has at least 2 points
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      strokesRef.current.push(currentStrokeRef.current);
    }
    currentStrokeRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${drawingTitle || 'drawing'}.png`;
    a.click();
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = parseFloat(canvas.style.width);
    const h = parseFloat(canvas.style.height);
    const dpr = window.devicePixelRatio || 1;
    await save({
      title: drawingTitle,
      strokes: strokesRef.current,
      canvasWidth: Math.round(w),
      canvasHeight: Math.round(h),
      devicePixelRatio: dpr,
      canvas,
    });
  };

  return (
    <div className="draw-card">
      <div className="draw-toolbar">
        <input
          className="draw-title-input"
          type="text"
          value={drawingTitle}
          onChange={(e) => setDrawingTitle(e.target.value)}
          placeholder="Untitled"
          aria-label="Drawing title"
        />
        <div className="swatches">
          {['#000000', '#ff4443', '#ffdd1c', '#00aaff', '#22c55e', '#7c3aed'].map((c) => (
            <button
              key={c}
              className={`swatch ${c === color && !isEraser ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => { setIsEraser(false); setColor(c); }}
              aria-label={`Select color ${c}`}
            />
          ))}
          <button
            className={`swatch eraser ${isEraser ? 'active' : ''}`}
            onClick={() => setIsEraser(v => !v)}
            title="Eraser"
          >E</button>
        </div>
        <div className="size-controls">
          <label className="size-label">Pen</label>
          <input className="size-range" type="range" min="1" max="30" value={penSize} onChange={(e) => setPenSize(Number(e.target.value))} />
          <label className="size-label">Eraser</label>
          <input className="size-range" type="range" min="4" max="60" value={eraserSize} onChange={(e) => setEraserSize(Number(e.target.value))} />
        </div>
        <div className="draw-actions">
          <button onClick={clearCanvas}>Clear</button>
          <button onClick={downloadImage}>Download</button>
          <button
            className={`save-btn${saving ? ' saving' : ''}${savedId && !saving ? ' saved' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : savedId ? 'Update' : 'Save'}
          </button>
          {onClose && (
            <button className="close-btn" onClick={onClose} title="Close editor">
              ✕
            </button>
          )}
        </div>
        {saveError && <span className="save-error">Save failed</span>}
      </div>
      <div className="draw-area">
        <canvas
          ref={canvasRef}
          className="draw-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

export default DrawCard;
