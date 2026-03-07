import { useState, useRef, useEffect } from 'react';
import { CLASSIC_LAYOUT } from './layouts/classic';
import './MahjongGame.css';

// ── Layout constants ───────────────────────────────────────────────────────
const TILE_W      = 28;   // px
const TILE_H      = 34;   // px
const LAYER_OFF   = 3;    // px shift right+up per layer (3-D depth illusion)
const MAX_LAYER   = 3;

// Pre-computed board canvas size (avoids recomputing every render)
const BOARD_W = (26 / 2 + 1) * TILE_W + MAX_LAYER * LAYER_OFF + 6;
const BOARD_H = (7  + 1)     * TILE_H + MAX_LAYER * LAYER_OFF + 6;

// ── Tile set — 36 unique emojis × 4 copies = 144 ─────────────────────────
const EMOJIS = [
  // Animals (9)
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨',
  // Food (9)
  '🍎','🍊','🍋','🍇','🍓','🍑','🍒','🥝','🍍',
  // Nature (9)
  '🌸','🌺','🌻','🌹','🌷','🍀','🌿','🍁','🍄',
  // Objects (9)
  '⭐','🌙','☀️','🌈','🔥','💧','⚡','❄️','🎵',
]; // 36 × 4 = 144 ✓

// ── Pure utility functions (all outside component — no stale-closure risk) ─

/** O(n): build Set of "layer,row,col" keys for non-removed tiles */
function buildKeys(tiles) {
  const s = new Set();
  for (const t of tiles) if (!t.removed) s.add(`${t.layer},${t.row},${t.col}`);
  return s;
}

/**
 * A tile is FREE when:
 *   1. Nothing sits directly on top of it (same row+col, layer+1).
 *   2. At least one horizontal side is open (no neighbour at col±2, same layer+row).
 */
function isFree(tile, keys) {
  if (tile.removed) return false;
  if (keys.has(`${tile.layer + 1},${tile.row},${tile.col}`)) return false; // covered
  const bL = keys.has(`${tile.layer},${tile.row},${tile.col - 2}`);
  const bR = keys.has(`${tile.layer},${tile.row},${tile.col + 2}`);
  return !bL || !bR;
}

/** Return all matchable [tileA, tileB] free pairs grouped by emoji */
function getFreePairs(tiles, keys) {
  const byEmoji = {};
  for (const t of tiles) {
    if (!t.removed && isFree(t, keys)) {
      (byEmoji[t.emoji] = byEmoji[t.emoji] || []).push(t);
    }
  }
  const pairs = [];
  for (const grp of Object.values(byEmoji)) {
    for (let i = 0; i + 1 < grp.length; i += 2) pairs.push([grp[i], grp[i + 1]]);
  }
  return pairs;
}

/** Create a fresh randomised 144-tile board */
function generateTiles() {
  const pool = [...EMOJIS, ...EMOJIS, ...EMOJIS, ...EMOJIS]; // 144
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return CLASSIC_LAYOUT.map(([layer, row, col], id) => ({
    id, emoji: pool[id], layer, row, col, removed: false,
  }));
}

/**
 * Shuffle emojis among non-removed tiles only (positions stay fixed).
 * Retries up to `maxTries` times until at least one free pair exists.
 */
function safeReshuffle(tiles, maxTries = 6) {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const remaining = tiles.filter(t => !t.removed);
    const emojis    = remaining.map(t => t.emoji);
    for (let i = emojis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emojis[i], emojis[j]] = [emojis[j], emojis[i]];
    }
    let idx = 0;
    const next = tiles.map(t => t.removed ? t : { ...t, emoji: emojis[idx++] });
    if (getFreePairs(next, buildKeys(next)).length > 0) return next;
  }
  return tiles; // worst case: return unchanged (extremely rare)
}

// ── Component ──────────────────────────────────────────────────────────────
const MahjongGame = () => {
  const [tiles,      setTiles]      = useState([]);
  const [selected,   setSelected]   = useState(null); // tile id | null
  const [phase,      setPhase]      = useState('start'); // start | playing | won
  const [moves,      setMoves]      = useState(0);
  const [hint,       setHint]       = useState([]);   // [idA, idB] | []
  const [history,    setHistory]    = useState([]);   // stack of [idA, idB] for undo
  const [shuffleMsg, setShuffleMsg] = useState(false);
  const hintTimer = useRef(null);

  // ── Start / restart ────────────────────────────────────────────────────
  const startGame = () => {
    clearTimeout(hintTimer.current);
    setTiles(generateTiles());
    setSelected(null);
    setPhase('playing');
    setMoves(0);
    setHint([]);
    setHistory([]);
    setShuffleMsg(false);
  };

  // ── Tile click ─────────────────────────────────────────────────────────
  const handleTileClick = (tile) => {
    if (phase !== 'playing') return;
    const keys = buildKeys(tiles);
    if (!isFree(tile, keys)) return;

    clearTimeout(hintTimer.current);
    setHint([]);

    // First selection
    if (selected === null) { setSelected(tile.id); return; }
    // Deselect same tile
    if (selected === tile.id) { setSelected(null); return; }

    const selTile = tiles.find(t => t.id === selected);
    if (!selTile) { setSelected(tile.id); return; }

    if (selTile.emoji === tile.emoji) {
      // ── Matched pair ───────────────────────────────────────────────────
      const newTiles = tiles.map(t =>
        t.id === tile.id || t.id === selTile.id ? { ...t, removed: true } : t
      );
      setHistory(h => [...h, [tile.id, selTile.id]]);
      setSelected(null);
      setMoves(m => m + 1);

      // Win check
      if (newTiles.every(t => t.removed)) {
        setTiles(newTiles);
        setPhase('won');
        return;
      }

      // Stuck check → auto-reshuffle
      if (getFreePairs(newTiles, buildKeys(newTiles)).length === 0) {
        const reshuffled = safeReshuffle(newTiles);
        setTiles(reshuffled);
        setShuffleMsg(true);
        setTimeout(() => setShuffleMsg(false), 1600);
      } else {
        setTiles(newTiles);
      }
    } else {
      // No match → select the new tile instead
      setSelected(tile.id);
    }
  };

  // ── Hint ───────────────────────────────────────────────────────────────
  const handleHint = () => {
    const keys  = buildKeys(tiles);
    const pairs = getFreePairs(tiles, keys);
    if (pairs.length === 0) return;
    const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
    setHint([a.id, b.id]);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint([]), 2000);
  };

  // ── Undo ───────────────────────────────────────────────────────────────
  const handleUndo = () => {
    if (history.length === 0) return;
    const lastPair = history[history.length - 1];
    setTiles(prev => prev.map(t => lastPair.includes(t.id) ? { ...t, removed: false } : t));
    setHistory(h => h.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
    setSelected(null);
    setHint([]);
  };

  // Cleanup hint timer on unmount
  useEffect(() => () => clearTimeout(hintTimer.current), []);

  // ── Render ─────────────────────────────────────────────────────────────
  const keys      = phase === 'playing' ? buildKeys(tiles) : new Set();
  const remaining = tiles.filter(t => !t.removed).length;

  return (
    <div className="mahjong-wrapper">

      {/* HUD */}
      {phase === 'playing' && (
        <div className="mahjong-hud">
          <span className="mj-stat">Moves: <strong>{moves}</strong></span>
          <span className="mj-stat mj-remaining">{remaining} left</span>
          <div className="mj-actions">
            <button className="mj-btn" onClick={handleHint}>Hint</button>
            <button className="mj-btn" onClick={handleUndo} disabled={history.length === 0}>Undo</button>
            <button className="mj-btn" onClick={startGame}>New</button>
          </div>
        </div>
      )}

      {/* Auto-reshuffle notice */}
      {shuffleMsg && (
        <div className="mj-shuffle-msg">🔀 Reshuffling board…</div>
      )}

      {/* Board */}
      <div className="mahjong-scroll">
        <div className="mahjong-board" style={{ width: BOARD_W, height: BOARD_H }}>
          {tiles.filter(t => !t.removed).map(tile => {
            const free    = isFree(tile, keys);
            const sel     = tile.id === selected;
            const isHint  = hint.includes(tile.id);

            // Position: column spacing = TILE_W/2 per col unit; layers offset right+up
            const left = (tile.col / 2) * TILE_W + tile.layer * LAYER_OFF;
            const top  = tile.row * TILE_H - tile.layer * LAYER_OFF + MAX_LAYER * LAYER_OFF;
            // Higher layers and further-down rows render on top
            const zIdx = tile.layer * 200 + tile.row * 10 + Math.floor(tile.col / 2);

            return (
              <div
                key={tile.id}
                className={[
                  'mahjong-tile',
                  free   ? 'free'     : '',
                  sel    ? 'selected' : '',
                  isHint ? 'hint'     : '',
                ].join(' ').trim()}
                style={{ left, top, width: TILE_W, height: TILE_H, zIndex: zIdx }}
                onClick={() => handleTileClick(tile)}
              >
                {tile.emoji}
              </div>
            );
          })}
        </div>
      </div>

      {/* Start / Win overlay */}
      {(phase === 'start' || phase === 'won') && (
        <div className="mahjong-overlay">
          <div className="mahjong-overlay-box">
            {phase === 'start' ? (
              <>
                <h2>🀄 Mahjong Solitaire</h2>
                <p>Match pairs of <strong>identical emoji tiles</strong>.</p>
                <p>A tile is playable when at least one side is open and nothing is stacked on top of it.</p>
                <p>Stuck? The board reshuffles automatically.</p>
              </>
            ) : (
              <>
                <h2>🎉 Cleared!</h2>
                <p className="mj-final">Finished in <strong>{moves}</strong> moves</p>
              </>
            )}
            <button className="mj-play-btn" onClick={startGame}>
              {phase === 'start' ? 'Play' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MahjongGame;
