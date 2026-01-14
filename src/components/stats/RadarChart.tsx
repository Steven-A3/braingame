import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CategoryScore } from '@/services/brainStats';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/games/core/types';

interface RadarChartProps {
  data: CategoryScore[];
  size?: number;
}

export function RadarChart({ data, size = 250 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.75;

  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;

    return data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const normalizedValue = item.score / 1000; // Normalize to 0-1
      const x = center + radius * normalizedValue * Math.cos(angle);
      const y = center + radius * normalizedValue * Math.sin(angle);

      return { x, y, angle, item };
    });
  }, [data, center, radius]);

  // Create polygon path for the data
  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Create grid lines
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background grid */}
        {gridLevels.map((level, i) => (
          <polygon
            key={i}
            points={data
              .map((_, index) => {
                const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
                const x = center + radius * level * Math.cos(angle);
                const y = center + radius * level * Math.sin(angle);
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#334155"
            strokeWidth={1}
            strokeDasharray={i < gridLevels.length - 1 ? '4,4' : undefined}
          />
        ))}

        {/* Axis lines */}
        {data.map((_, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <motion.path
          d={polygonPath}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="#6366F1"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data points */}
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={CATEGORY_COLORS[point.item.category]}
            stroke="#1E293B"
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          />
        ))}
      </svg>

      {/* Labels */}
      {points.map((point, index) => {
        const labelRadius = radius + 30;
        const x = center + labelRadius * Math.cos(point.angle);
        const y = center + labelRadius * Math.sin(point.angle);

        return (
          <div
            key={index}
            className="absolute flex flex-col items-center"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="text-lg">{CATEGORY_ICONS[point.item.category]}</span>
            <span className="text-xs text-slate-400 font-medium">
              {point.item.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
