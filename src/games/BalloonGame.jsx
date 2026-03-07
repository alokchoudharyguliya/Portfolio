import { useState, useEffect, useRef } from 'react';
import { generateEquation } from './equationGenerator';
import './BalloonGame.css';

const BALLOON_RADIUS = 45;
const COLORS = [
  '#FF6B6B', '#FF8E53', '#A8E063', '#4FC3F7',
  '#BA68C8', '#FF80AB', '#69F0AE', '#FFCA28',
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function createBalloons(answer, count, speed) {
  // Build a set of unique values; answer is always included
  const values = new Set([answer]);
  let tries = 0;
  while (values.size < count && tries < 120) {
    const offset = (Math.floor(Math.random() * 8) + 1) * (Math.random() < 0.5 ? 1 : -1);
    const v = answer + offset;
    if (v >= 0) values.add(v);
    tries++;
  }
  // Fallback: just increment if still short
  let extra = 1;
  while (values.size < count) values.add(answer + extra++);

  // Fisher-Yates shuffle
  const vals = [...values];
  for (let i = vals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [vals[i], vals[j]] = [vals[j], vals[i]];
  }

  return vals.map((val, idx) => ({
    id: `${Date.now()}_${idx}_${Math.random().toString(36).slice(2)}`,
    value: val,
    isAnswer: val === answer,
    // Spread x evenly between 10%–90% of canvas width
    x: count === 1 ? 50 : 10 + (idx / (count - 1)) * 80,
    // Stagger start positions below screen (108%, 118%, …)
    y: 108 + idx * 10,
    speed: speed + (Math.random() - 0.5) * 0.04,
    color: COLORS[idx % COLORS.length],
  }));
}

// ─── component ────────────────────────────────────────────────────────────────

const BalloonGame = () => {
  // Refs hold the mutable game state accessed inside the RAF loop.
  // This avoids stale closures without listing them as effect deps.
  const canvasRef      = useRef(null);
  const balloonsRef    = useRef([]);
  const popsRef        = useRef([]);   // pop-burst animations
  const frameRef       = useRef(null);
  const livesRef       = useRef(3);
  const scoreRef       = useRef(0);
  const roundRef       = useRef(1);
  const gameActiveRef  = useRef(false);

  // React state — only drives the HUD (re-render cheap; no balloon positions here)
  const [gamePhase, setGamePhase] = useState('start'); // 'start' | 'playing' | 'gameover'
  const [score,     setScore]     = useState(0);
  const [lives,     setLives]     = useState(3);
  const [equation,  setEquation]  = useState('');
  const [round,     setRound]     = useState(1);
  const [highScore, setHighScore] = useState(
    () => parseInt(localStorage.getItem('balloonHS') || '0', 10),
  );

  // ── start / restart ────────────────────────────────────────────────────────
  const startGame = () => {
    scoreRef.current  = 0;
    livesRef.current  = 3;
    roundRef.current  = 1;
    balloonsRef.current = [];
    popsRef.current     = [];
    setScore(0);
    setLives(3);
    setRound(1);
    setGamePhase('playing');
  };

  // ── main game effect (RAF loop + click/touch) ──────────────────────────────
  // Runs only when gamePhase changes to 'playing'.
  // All inner functions close over refs and stable React setters — no stale closure risk.
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    // Keep canvas pixel dimensions in sync with its CSS size
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    gameActiveRef.current = true;

    // ── spawn a new round of balloons ────────────────────────────────────────
    function spawnRound() {
      const eq    = generateEquation(roundRef.current);
      const speed = 0.45 + (roundRef.current - 1) * 0.035;
      const count = Math.min(5 + Math.floor((roundRef.current - 1) / 3), 8);
      balloonsRef.current = createBalloons(eq.answer, count, speed);
      setEquation(eq.display);
      setRound(roundRef.current);
    }

    // ── end game ─────────────────────────────────────────────────────────────
    function triggerGameOver() {
      gameActiveRef.current = false;
      cancelAnimationFrame(frameRef.current);
      const s = scoreRef.current;
      setHighScore(prev => {
        const newHigh = Math.max(prev, s);
        localStorage.setItem('balloonHS', String(newHigh));
        return newHigh;
      });
      setGamePhase('gameover');
    }

    // ── click / tap handler ──────────────────────────────────────────────────
    function handleClick(e) {
      if (!gameActiveRef.current) return;
      const rect   = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top)  * scaleY;

      for (let i = 0; i < balloonsRef.current.length; i++) {
        const b  = balloonsRef.current[i];
        const bx = (b.x / 100) * canvas.width;
        const by = (b.y / 100) * canvas.height;

        if (Math.hypot(clickX - bx, clickY - by) <= BALLOON_RADIUS) {
          // Queue a pop-burst at this position
          popsRef.current.push({ x: bx, y: by, color: b.color, frame: 0 });

          if (b.isAnswer) {
            scoreRef.current += 10 * roundRef.current;
            roundRef.current += 1;
            setScore(scoreRef.current);
            spawnRound();
          } else {
            // Wrong balloon popped — remove it and lose a life
            balloonsRef.current = balloonsRef.current.filter(bb => bb.id !== b.id);
            livesRef.current -= 1;
            setLives(livesRef.current);
            if (livesRef.current <= 0) triggerGameOver();
          }
          break;
        }
      }
    }

    function handleTouch(e) {
      e.preventDefault();
      handleClick({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }

    // ── RAF draw loop ─────────────────────────────────────────────────────────
    function draw() {
      if (!gameActiveRef.current) return;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── move balloons upward & remove off-screen ones ──────────────────────
      let answerEscaped = false;
      balloonsRef.current = balloonsRef.current
        .map(b => ({ ...b, y: b.y - b.speed }))
        .filter(b => {
          if (b.y < -15) {
            if (b.isAnswer) answerEscaped = true;
            return false;
          }
          return true;
        });

      // ── draw each balloon ──────────────────────────────────────────────────
      const t = Date.now() / 700; // time factor for wavy strings
      for (const b of balloonsRef.current) {
        const cx = (b.x / 100) * W;
        const cy = (b.y / 100) * H;
        const r  = BALLOON_RADIUS;

        // Body
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight glare
        ctx.beginPath();
        ctx.arc(cx - r * 0.28, cy - r * 0.28, r * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.42)';
        ctx.fill();

        // Knot (small triangle at bottom of balloon)
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + r - 1);
        ctx.lineTo(cx + 4, cy + r - 1);
        ctx.lineTo(cx,     cy + r + 7);
        ctx.closePath();
        ctx.fillStyle = b.color;
        ctx.fill();

        // Wavy string
        ctx.beginPath();
        ctx.moveTo(cx, cy + r + 7);
        ctx.quadraticCurveTo(
          cx + Math.sin(t + b.x * 0.12) * 7,
          cy + r + 14,
          cx + Math.sin(t * 0.7 + b.x * 0.18) * 4,
          cy + r + 24,
        );
        ctx.strokeStyle = 'rgba(60,60,60,0.55)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // Number label
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.font         = `bold ${Math.floor(r * 0.58)}px Arial, sans-serif`;
        ctx.shadowColor  = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur   = 3;
        ctx.fillStyle    = '#fff';
        ctx.fillText(String(b.value), cx, cy);
        ctx.shadowBlur   = 0;
      }

      // ── pop-burst animations ───────────────────────────────────────────────
      popsRef.current = popsRef.current
        .filter(p => p.frame < 14)
        .map(p => {
          const prog = p.frame / 14;

          // Expanding ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, BALLOON_RADIUS * (1 + prog * 2.2), 0, Math.PI * 2);
          ctx.strokeStyle  = p.color;
          ctx.globalAlpha  = 1 - prog;
          ctx.lineWidth    = 3;
          ctx.stroke();

          // 6 particles flying outward
          for (let k = 0; k < 6; k++) {
            const angle = (k / 6) * Math.PI * 2 + prog * Math.PI;
            const dist  = BALLOON_RADIUS * (0.4 + prog * 2.1);
            ctx.beginPath();
            ctx.arc(
              p.x + Math.cos(angle) * dist,
              p.y + Math.sin(angle) * dist,
              3 * (1 - prog), 0, Math.PI * 2,
            );
            ctx.fillStyle   = p.color;
            ctx.globalAlpha = 1 - prog;
            ctx.fill();
          }
          ctx.globalAlpha = 1;

          return { ...p, frame: p.frame + 1 };
        });

      // ── handle answer balloon escaping ─────────────────────────────────────
      if (answerEscaped) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          triggerGameOver();
          return; // stop scheduling the next frame
        }
        spawnRound();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    // ── kick off ──────────────────────────────────────────────────────────────
    spawnRound();
    canvas.addEventListener('click',      handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    frameRef.current = requestAnimationFrame(draw);

    return () => {
      gameActiveRef.current = false;
      cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener('click',      handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('resize',     resize);
    };
  }, [gamePhase]); // Only re-runs when the game phase changes

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="balloon-game-wrapper">

      {/* HUD — lives / equation / score */}
      {gamePhase === 'playing' && (
        <div className="game-hud">
          <span className="hud-lives">
            {Array.from({ length: livesRef.current }, (_, i) => (
              <span key={i}>❤️</span>
            ))}
          </span>
          <span className="hud-equation">{equation} = ?</span>
          <span className="hud-score">⭐ {score}</span>
        </div>
      )}

      {/* Canvas — the entire game is drawn here */}
      <canvas
        ref={canvasRef}
        className="game-canvas"
        style={{ cursor: gamePhase === 'playing' ? 'crosshair' : 'default' }}
      />

      {/* Start screen */}
      {gamePhase === 'start' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>🎈 Balloon Pop!</h2>
            <p>Solve the equation and pop the balloon with the <strong>correct answer</strong>.</p>
            <p>❤️ lost if you pop wrong, or if the answer balloon escapes.</p>
            {highScore > 0 && <p className="hs-display">🏆 Best: {highScore}</p>}
            <button className="game-btn" onClick={startGame}>Play</button>
          </div>
        </div>
      )}

      {/* Game over screen */}
      {gamePhase === 'gameover' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Game Over</h2>
            <p className="final-score">Score: {score}</p>
            <p className="round-display">Reached round {round}</p>
            {score > 0 && score >= highScore && <p className="new-high">🏆 New Best!</p>}
            <p className="hs-display">Best: {highScore}</p>
            <button className="game-btn" onClick={startGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalloonGame;
