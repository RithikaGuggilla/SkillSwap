import React, { useRef, useEffect, useState, useCallback } from "react";

// ─── Styles ──────────────────────────────────────────────────────────────────
const wbStyles = `
  .wb-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1a1b1e;
    border-left: 1px solid #333;
    user-select: none;
  }

  /* ── Toolbar ── */
  .wb-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 12px;
    background: #212226;
    border-bottom: 1px solid #333;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .wb-toolbar-group {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 6px;
    border-right: 1px solid #333;
  }
  .wb-toolbar-group:last-child { border-right: none; }

  .wb-tool-btn {
    width: 32px; height: 32px;
    border-radius: 6px; border: none;
    background: transparent; color: #9aa0a6;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s;
    position: relative;
  }
  .wb-tool-btn:hover { background: #2d2e31; color: #e8eaed; }
  .wb-tool-btn.active { background: #8ab4f820; color: #8ab4f8; }
  .wb-tool-btn[title]:hover::after {
    content: attr(title);
    position: absolute; bottom: -28px; left: 50%; transform: translateX(-50%);
    background: #000; color: #fff; font-size: 11px;
    padding: 3px 7px; border-radius: 4px; white-space: nowrap;
    pointer-events: none; z-index: 10;
    font-family: 'Google Sans', sans-serif;
  }

  /* Color swatches */
  .wb-color-swatch {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2px solid transparent; cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .wb-color-swatch:hover { transform: scale(1.2); }
  .wb-color-swatch.active { border-color: #fff; transform: scale(1.15); }

  /* Stroke width */
  .wb-stroke-btn {
    width: 32px; height: 32px; border-radius: 6px; border: none;
    background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
    color: #9aa0a6;
  }
  .wb-stroke-btn:hover { background: #2d2e31; }
  .wb-stroke-btn.active { background: #8ab4f820; }
  .wb-stroke-dot {
    background: currentColor; border-radius: 50%;
  }

  /* Canvas area */
  .wb-canvas-wrap {
    flex: 1;
    position: relative;
    overflow: auto;
    background-color: #1a1b1e;
    min-height: 0;
    width: 100%;
  }
  .wb-canvas-scroll-inner {
    position: relative;
    width: 100%;
    min-height: 300%;
    background:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 24px 24px;
    background-color: #1a1b1e;
  }
  .wb-canvas {
    position: absolute;
    top: 0; left: 0;
    touch-action: none;
    display: block;
  }
  .wb-canvas.pen    { cursor: crosshair; }
  .wb-canvas.eraser { cursor: cell; }
  .wb-canvas.text   { cursor: text; }
  .wb-canvas.select { cursor: default; }

  /* Footer */
  .wb-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 12px; background: #212226;
    border-top: 1px solid #333; flex-shrink: 0;
    font-size: 11px; color: #5f6368; font-family: 'Google Sans', sans-serif;
  }
  .wb-clear-btn {
    background: transparent; border: 1px solid #444;
    color: #9aa0a6; border-radius: 4px; padding: 3px 10px;
    font-size: 11px; cursor: pointer; font-family: 'Google Sans', sans-serif;
    transition: border-color 0.15s, color 0.15s;
  }
  .wb-clear-btn:hover { border-color: #ea4335; color: #ea4335; }

  /* Remote cursor */
  .wb-remote-cursor {
    position: absolute; pointer-events: none; z-index: 10;
    transform: translate(-4px, -4px);
    transition: left 0.05s linear, top 0.05s linear;
  }
  .wb-remote-cursor-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: #ea4335; border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  }
  .wb-remote-cursor-label {
    position: absolute; top: 12px; left: 8px;
    background: #ea4335; color: #fff; font-size: 10px;
    padding: 1px 5px; border-radius: 3px; white-space: nowrap;
    font-family: 'Google Sans', sans-serif;
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const WbIcon = ({ d, size = 16, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const COLORS = [
  "#ffffff", "#e8eaed", "#ea4335", "#fbbc04",
  "#34a853", "#4285f4", "#aa47bc", "#ff7043",
];

const STROKES = [2, 4, 8];

// ─── Main Component ───────────────────────────────────────────────────────────
const Whiteboard = ({ socket, userId, targetUserId, onClose }) => {
  const canvasRef     = useRef(null);
  const ctxRef        = useRef(null);
  const isDrawing     = useRef(false);
  const lastPos       = useRef(null);
  const historyRef    = useRef([]); // array of ImageData for undo
  const redoStackRef  = useRef([]);

  const [tool,         setTool]         = useState("pen");
  const [color,        setColor]        = useState("#ffffff");
  const [strokeWidth,  setStrokeWidth]  = useState(4);
  const [remoteCursor, setRemoteCursor] = useState(null);

  // ── Canvas setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas    = canvasRef.current;
    const scrollWrap = canvas.parentElement;      // .wb-canvas-scroll-inner
    const outerWrap  = scrollWrap.parentElement;  // .wb-canvas-wrap (scrollable)

    const initCanvas = () => {
      const w = outerWrap.clientWidth  || 800;
      const h = outerWrap.clientHeight || 600;
      if (w === 0) return;

      // Canvas is wide as viewport, tall as 3x viewport for scrolling
      canvas.width  = w;
      canvas.height = h * 3;
      scrollWrap.style.height = canvas.height + "px";

      const ctx = canvas.getContext("2d");
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth   = 4;
      ctxRef.current  = ctx;
      saveHistory();
      console.log("🎨 Canvas initialized", w, canvas.height);
    };

    if (outerWrap.clientWidth > 0) {
      initCanvas();
    } else {
      requestAnimationFrame(initCanvas);
    }

    const onResize = () => {
      if (!ctxRef.current) return;
      const ctx = ctxRef.current;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const w = outerWrap.clientWidth;
      const h = outerWrap.clientHeight;
      canvas.width  = w;
      canvas.height = h * 3;
      scrollWrap.style.height = canvas.height + "px";
      ctx.lineCap  = "round";
      ctx.lineJoin = "round";
      ctx.putImageData(imageData, 0, 0);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(outerWrap);
    return () => ro.disconnect();
  }, []);

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("wb-draw", ({ x0, y0, x1, y1, color, width, tool }) => {
      drawLine(x0, y0, x1, y1, color, width, tool, false);
    });

    socket.on("wb-clear", () => {
      clearCanvas(false);
    });

    socket.on("wb-cursor", ({ x, y, name }) => {
      setRemoteCursor({ x, y, name });
    });

    socket.on("wb-undo", ({ imageDataArr }) => {
      // Receive full canvas state after remote undo
      if (!imageDataArr) return;
      const canvas = canvasRef.current;
      const ctx    = ctxRef.current;
      const id     = new ImageData(
        new Uint8ClampedArray(imageDataArr),
        canvas.width, canvas.height
      );
      ctx.putImageData(id, 0, 0);
    });

    return () => {
      socket.off("wb-draw");
      socket.off("wb-clear");
      socket.off("wb-cursor");
      socket.off("wb-undo");
    };
  }, [socket]);

  // ── Update ctx when tool/color/stroke changes ─────────────────────────────
  useEffect(() => {
    if (!ctxRef.current) return;
    ctxRef.current.strokeStyle = tool === "eraser" ? "#1a1b1e" : color;
    ctxRef.current.lineWidth   = tool === "eraser" ? strokeWidth * 4 : strokeWidth;
  }, [tool, color, strokeWidth]);

  // ── History helpers ───────────────────────────────────────────────────────
  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 30) historyRef.current.shift();
    redoStackRef.current = [];
  };

  const undo = () => {
    if (historyRef.current.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    redoStackRef.current.push(historyRef.current.pop());
    const prev = historyRef.current[historyRef.current.length - 1];
    ctx.putImageData(prev, 0, 0);
    // Emit to remote
    if (socket) {
      socket.emit("wb-undo", {
        to: targetUserId,
        imageDataArr: Array.from(prev.data),
      });
    }
  };

  const redo = () => {
    if (!redoStackRef.current.length) return;
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    const next   = redoStackRef.current.pop();
    historyRef.current.push(next);
    ctx.putImageData(next, 0, 0);
  };

  // ── Draw helpers ──────────────────────────────────────────────────────────
  const drawLine = (x0, y0, x1, y1, col, width, t, emit) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const prevColor = ctx.strokeStyle;
    const prevWidth = ctx.lineWidth;

    ctx.strokeStyle = t === "eraser" ? "#1a1b1e" : col;
    ctx.lineWidth   = t === "eraser" ? width * 4 : width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = prevColor;
    ctx.lineWidth   = prevWidth;

    if (emit && socket) {
      socket.emit("wb-draw", {
        to: targetUserId,
        x0, y0, x1, y1,
        color: col,
        width,
        tool: t,
      });
    }
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const wrap = canvas.parentElement;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      // account for scroll position so drawing is accurate when scrolled down
      y: clientY - rect.top + wrap.scrollTop,
    };
  };

  // ── Mouse / touch events ──────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    if (tool === "text") return;
    isDrawing.current = true;
    const pos = getPos(e, canvasRef.current);
    lastPos.current = pos;
    saveHistory();
  }, [tool]);

  const onPointerMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const pos    = getPos(e, canvas);

    // Emit cursor position
    if (socket) {
      socket.emit("wb-cursor", { to: targetUserId, x: pos.x, y: pos.y, name: userId });
    }

    if (!isDrawing.current || !lastPos.current) return;

    drawLine(
      lastPos.current.x, lastPos.current.y,
      pos.x, pos.y,
      color, strokeWidth, tool, true
    );
    lastPos.current = pos;
  }, [tool, color, strokeWidth, socket]);

  const onPointerUp = useCallback(() => {
    isDrawing.current = false;
    lastPos.current   = null;
  }, []);

  const clearCanvas = (emit = true) => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
    if (emit && socket) {
      socket.emit("wb-clear", { to: targetUserId });
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link   = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.png`;
    link.href     = canvas.toDataURL();
    link.click();
  };

  return (
    <>
      <style>{wbStyles}</style>
      <div className="wb-root">

        {/* ── Toolbar ── */}
        <div className="wb-toolbar">

          {/* Tools */}
          <div className="wb-toolbar-group">
            <button
              className={`wb-tool-btn ${tool === "pen" ? "active" : ""}`}
              onClick={() => setTool("pen")} title="Pen (P)">
              <WbIcon d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            </button>
            <button
              className={`wb-tool-btn ${tool === "eraser" ? "active" : ""}`}
              onClick={() => setTool("eraser")} title="Eraser (E)">
              <WbIcon d="M20 20H7L3 16l10-10 7 7-3 3 3 4zM6.7 17.3l1 1H11l5-5-3-3-6.3 7z" />
            </button>
          </div>

          {/* Colors */}
          <div className="wb-toolbar-group" style={{ gap: 5 }}>
            {COLORS.map(c => (
              <div
                key={c}
                className={`wb-color-swatch ${color === c ? "active" : ""}`}
                style={{ background: c, boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #444" : "none" }}
                onClick={() => { setColor(c); setTool("pen"); }}
              />
            ))}
          </div>

          {/* Stroke width */}
          <div className="wb-toolbar-group">
            {STROKES.map(s => (
              <button
                key={s}
                className={`wb-stroke-btn ${strokeWidth === s ? "active" : ""}`}
                onClick={() => setStrokeWidth(s)}
                title={`Stroke ${s}px`}>
                <div className="wb-stroke-dot"
                  style={{ width: s + 4, height: s + 4, color: strokeWidth === s ? "#8ab4f8" : "#9aa0a6" }}
                />
              </button>
            ))}
          </div>

          {/* Undo / Redo */}
          <div className="wb-toolbar-group">
            <button className="wb-tool-btn" onClick={undo} title="Undo (Ctrl+Z)">
              <WbIcon d="M3 7v6h6M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </button>
            <button className="wb-tool-btn" onClick={redo} title="Redo (Ctrl+Y)">
              <WbIcon d="M21 7v6h-6M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
            </button>
          </div>

          {/* Download */}
          <div className="wb-toolbar-group">
            <button className="wb-tool-btn" onClick={downloadCanvas} title="Download as PNG">
              <WbIcon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </button>
            <button className="wb-tool-btn" onClick={onClose} title="Close whiteboard">
              <WbIcon d="M18 6L6 18M6 6l12 12" />
            </button>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div className="wb-canvas-wrap">
          <div className="wb-canvas-scroll-inner">
          <canvas
            ref={canvasRef}
            className={`wb-canvas ${tool}`}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          />

          {/* Remote cursor */}
          {remoteCursor && (
            <div
              className="wb-remote-cursor"
              style={{ left: remoteCursor.x, top: remoteCursor.y }}>
              <div className="wb-remote-cursor-dot" />
              <div className="wb-remote-cursor-label">{remoteCursor.name}</div>
            </div>
          )}
          </div>{/* end scroll inner */}
        </div>

        {/* ── Footer ── */}
        <div className="wb-footer">
          <span>Draw together in real time · scroll down for more space ↓</span>
          <button className="wb-clear-btn" onClick={() => clearCanvas(true)}>
            Clear board
          </button>
        </div>

      </div>
    </>
  );
};

export default Whiteboard;