import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  shape: 'square' | 'circle' | 'star';
}

const COLORS = [
  '#8b5cf6', // Purple (primary)
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#f97316', // Orange
];

const SHAPES: ConfettiPiece['shape'][] = ['square', 'circle', 'star'];

interface ConfettiProps {
  active: boolean;
  count?: number;
  duration?: number;
  spread?: number;
  origin?: { x: number; y: number };
}

export function Confetti({
  active,
  count = 50,
  duration = 3000,
  spread = 360,
  origin = { x: 0.5, y: 0.3 },
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const piecesRef = useRef<ConfettiPiece[]>([]);

  const createPieces = useCallback(() => {
    const pieces: ConfettiPiece[] = [];
    const spreadRad = (spread * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * spreadRad - spreadRad / 2 - Math.PI / 2;
      const velocity = 8 + Math.random() * 8;

      pieces.push({
        id: i,
        x: origin.x * window.innerWidth,
        y: origin.y * window.innerHeight,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 8,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      });
    }

    return pieces;
  }, [count, spread, origin]);

  const drawPiece = useCallback(
    (ctx: CanvasRenderingContext2D, piece: ConfettiPiece) => {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate((piece.rotation * Math.PI) / 180);
      ctx.fillStyle = piece.color;

      switch (piece.shape) {
        case 'square':
          ctx.fillRect(
            -piece.size / 2,
            -piece.size / 2,
            piece.size,
            piece.size * 0.6
          );
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'star':
          drawStar(ctx, 0, 0, 5, piece.size / 2, piece.size / 4);
          break;
      }

      ctx.restore();
    },
    []
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    piecesRef.current = piecesRef.current.filter((piece) => {
      // Update physics
      piece.x += piece.velocityX;
      piece.y += piece.velocityY;
      piece.velocityY += 0.3; // Gravity
      piece.velocityX *= 0.99; // Air resistance
      piece.rotation += piece.rotationSpeed;

      // Draw if still visible
      if (piece.y < canvas.height + 50) {
        drawPiece(ctx, piece);
        return true;
      }
      return false;
    });

    if (piecesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [drawPiece]);

  useEffect(() => {
    if (active) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      piecesRef.current = createPieces();
      animate();

      // Auto-cleanup after duration
      const timeout = setTimeout(() => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }, duration);

      return () => {
        clearTimeout(timeout);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [active, createPieces, animate, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// Draw star shape
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      cx + Math.cos(rot) * outerRadius,
      cy + Math.sin(rot) * outerRadius
    );
    rot += step;

    ctx.lineTo(
      cx + Math.cos(rot) * innerRadius,
      cy + Math.sin(rot) * innerRadius
    );
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

// Emoji burst component for quick celebrations
interface EmojiBurstProps {
  active: boolean;
  emoji?: string;
  count?: number;
}

export function EmojiBurst({ active, emoji = '🎉', count = 8 }: EmojiBurstProps) {
  if (!active) return null;

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
          {Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;

            return (
              <motion.div
                key={i}
                className="absolute text-4xl"
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  scale: [0, 1.5, 1],
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1,
                  ease: 'easeOut',
                  delay: i * 0.03,
                }}
              >
                {emoji}
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

// Streak fire animation
interface StreakFireProps {
  streak: number;
  show: boolean;
}

export function StreakFire({ streak, show }: StreakFireProps) {
  if (!show || streak < 2) return null;

  const fireCount = Math.min(streak, 10);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[99] flex items-end justify-center pb-32">
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            className="relative"
          >
            {/* Fire particles */}
            {Array.from({ length: fireCount }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: (i - fireCount / 2) * 20,
                }}
                animate={{
                  y: [0, -30, 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.3,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              >
                🔥
              </motion.div>
            ))}

            {/* Streak text */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              className="relative z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-3xl px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/30"
            >
              {streak} Day Streak! 🔥
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Score pop animation
interface ScorePopProps {
  score: number;
  show: boolean;
  isPersonalBest?: boolean;
}

export function ScorePop({ score, show, isPersonalBest }: ScorePopProps) {
  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: -20 }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[100] text-center"
        >
          {isPersonalBest && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-yellow-400 text-sm font-bold mb-2 flex items-center justify-center gap-1"
            >
              <span>⭐</span> NEW PERSONAL BEST <span>⭐</span>
            </motion.div>
          )}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.3,
              repeat: 2,
            }}
            className={`text-5xl font-bold ${
              isPersonalBest
                ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent'
                : 'text-white'
            }`}
          >
            {score.toLocaleString()}
          </motion.div>
          <div className="text-slate-400 text-sm mt-1">points</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
