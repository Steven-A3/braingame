import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface LineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  showArea?: boolean;
}

export function LineChart({
  data,
  labels,
  height = 120,
  color = '#6366F1',
  showArea = true,
}: LineChartProps) {
  const width = 280;
  const padding = { top: 10, right: 10, bottom: 30, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { path, areaPath, points, yScale } = useMemo(() => {
    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data.filter(v => v > 0), 0);
    const range = maxValue - minValue || 1;

    const yScale = (value: number) =>
      chartHeight - ((value - minValue) / range) * chartHeight + padding.top;

    const xScale = (index: number) =>
      padding.left + (index / (data.length - 1)) * chartWidth;

    const pts = data.map((value, index) => ({
      x: xScale(index),
      y: yScale(value),
      value,
    }));

    // Create smooth curve path using cardinal spline
    const linePath = pts.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, '');

    const area = `${linePath} L ${pts[pts.length - 1].x} ${chartHeight + padding.top} L ${pts[0].x} ${chartHeight + padding.top} Z`;

    return {
      path: linePath,
      areaPath: area,
      points: pts,
      yScale,
    };
  }, [data, chartWidth, chartHeight, padding]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const maxValue = Math.max(...data, 100);
    const tickCount = 4;
    const step = Math.ceil(maxValue / tickCount / 50) * 50;
    return Array.from({ length: tickCount + 1 }, (_, i) => i * step);
  }, [data]);

  return (
    <div className="w-full">
      <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={yScale(tick)}
              x2={width - padding.right}
              y2={yScale(tick)}
              stroke="#334155"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <text
              x={padding.left - 5}
              y={yScale(tick)}
              fontSize={10}
              fill="#64748B"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {showArea && (
          <motion.path
            d={areaPath}
            fill={`${color}20`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Line */}
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Points */}
        {points.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.8 + i * 0.05 }}
          />
        ))}

        {/* X-axis labels */}
        {labels?.map((label, i) => (
          <text
            key={i}
            x={padding.left + (i / (labels.length - 1)) * chartWidth}
            y={height - 8}
            fontSize={10}
            fill="#64748B"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// Sparkline - mini version of line chart
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ data, width = 60, height = 20, color = '#6366F1' }: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return '';

    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);
    const range = maxValue - minValue || 1;

    return data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - minValue) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
    </svg>
  );
}
