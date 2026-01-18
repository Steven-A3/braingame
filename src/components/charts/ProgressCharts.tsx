import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/games/core/types';
import type { GameCategory } from '@/games/core/types';
import i18n from '@/i18n';

type TimeRange = '7d' | '30d' | 'all';

export function ProgressCharts() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gameHistory, stats } = useUserStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  // Filter data by time range
  const filteredHistory = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    switch (timeRange) {
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case 'all':
        cutoff.setFullYear(2000);
        break;
    }

    return gameHistory.filter((r) => new Date(r.date) >= cutoff);
  }, [gameHistory, timeRange]);

  // Daily scores for line chart
  const dailyScores = useMemo(() => {
    const scoreMap = new Map<string, { total: number; count: number }>();

    filteredHistory.forEach((result) => {
      const date = result.date.split('T')[0];
      const existing = scoreMap.get(date) || { total: 0, count: 0 };
      scoreMap.set(date, {
        total: existing.total + result.score,
        count: existing.count + 1,
      });
    });

    return Array.from(scoreMap.entries())
      .map(([date, data]) => ({
        date,
        avgScore: Math.round(data.total / data.count),
        gamesPlayed: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredHistory]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const data: Record<GameCategory, { games: number; totalScore: number }> = {
      memory: { games: 0, totalScore: 0 },
      logic: { games: 0, totalScore: 0 },
      focus: { games: 0, totalScore: 0 },
      calculation: { games: 0, totalScore: 0 },
      language: { games: 0, totalScore: 0 },
      speed: { games: 0, totalScore: 0 },
    };

    filteredHistory.forEach((result) => {
      data[result.category].games += 1;
      data[result.category].totalScore += result.score;
    });

    return Object.entries(data).map(([category, values]) => ({
      category: category as GameCategory,
      games: values.games,
      avgScore: values.games > 0 ? Math.round(values.totalScore / values.games) : 0,
    }));
  }, [filteredHistory]);

  // Accuracy trend
  const accuracyTrend = useMemo(() => {
    if (filteredHistory.length === 0) return 0;
    const avgAccuracy =
      filteredHistory.reduce((sum, r) => sum + r.accuracy, 0) /
      filteredHistory.length;
    return Math.round(avgAccuracy * 100);
  }, [filteredHistory]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white"
        >
          ← {t('common.back')}
        </button>
        <h1 className="text-xl font-bold">{t('nav.progress')}</h1>
      </div>

      <div className="flex-1 p-4 space-y-6 max-w-lg mx-auto w-full pb-24">
        {/* Time range selector */}
        <div className="flex gap-2 bg-slate-800 rounded-xl p-1">
          {(['7d', '30d', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === '7d' ? t('progress.7days') : range === '30d' ? t('progress.30days') : t('progress.allTime')}
            </button>
          ))}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label={t('progress.games')}
            value={filteredHistory.length.toString()}
            icon="🎮"
          />
          <StatCard
            label={t('progress.avgScore')}
            value={
              filteredHistory.length > 0
                ? Math.round(
                    filteredHistory.reduce((s, r) => s + r.score, 0) /
                      filteredHistory.length
                  ).toLocaleString()
                : '0'
            }
            icon="⭐"
          />
          <StatCard
            label={t('progress.accuracy')}
            value={`${accuracyTrend}%`}
            icon="🎯"
          />
        </div>

        {/* Score trend chart */}
        <div className="card">
          <h3 className="font-semibold mb-4">{t('progress.scoreTrend')}</h3>
          {dailyScores.length > 0 ? (
            <LineChart data={dailyScores} />
          ) : (
            <EmptyChart message={t('progress.playMoreGames')} />
          )}
        </div>

        {/* Category breakdown */}
        <div className="card">
          <h3 className="font-semibold mb-4">{t('progress.categoryPerformance')}</h3>
          {filteredHistory.length > 0 ? (
            <CategoryBreakdown data={categoryData} t={t} />
          ) : (
            <EmptyChart message={t('progress.noDataForPeriod')} />
          )}
        </div>

        {/* Category radar */}
        <div className="card">
          <h3 className="font-semibold mb-4">{t('progress.brainBalance')}</h3>
          <RadarChart stats={stats.categoryGames} />
        </div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-primary-400">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

// Line chart component
function LineChart({
  data,
}: {
  data: { date: string; avgScore: number; gamesPlayed: number }[];
}) {
  const width = 300;
  const height = 150;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxScore = Math.max(...data.map((d) => d.avgScore), 1);
  const minScore = Math.min(...data.map((d) => d.avgScore), 0);
  const scoreRange = maxScore - minScore || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: padding.top + chartHeight - ((d.avgScore - minScore) / scoreRange) * chartHeight,
    ...d,
  }));

  const pathD =
    points.length > 1
      ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
      : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={ratio}
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + chartHeight * (1 - ratio)}
          y2={padding.top + chartHeight * (1 - ratio)}
          stroke="#334155"
          strokeWidth="1"
        />
      ))}

      {/* Y-axis labels */}
      {[0, 0.5, 1].map((ratio) => (
        <text
          key={ratio}
          x={padding.left - 8}
          y={padding.top + chartHeight * (1 - ratio)}
          fill="#94a3b8"
          fontSize="10"
          textAnchor="end"
          dominantBaseline="middle"
        >
          {Math.round(minScore + scoreRange * ratio)}
        </text>
      ))}

      {/* Line */}
      {pathD && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}

      {/* Points */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#8b5cf6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}

      {/* X-axis labels (show first, middle, last) */}
      {data.length > 0 && (
        <>
          <text
            x={padding.left}
            y={height - 8}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="start"
          >
            {formatShortDate(data[0].date)}
          </text>
          {data.length > 1 && (
            <text
              x={width - padding.right}
              y={height - 8}
              fill="#94a3b8"
              fontSize="10"
              textAnchor="end"
            >
              {formatShortDate(data[data.length - 1].date)}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

// Category breakdown bars
function CategoryBreakdown({
  data,
  t,
}: {
  data: { category: GameCategory; games: number; avgScore: number }[];
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const maxGames = Math.max(...data.map((d) => d.games), 1);

  return (
    <div className="space-y-3">
      {data
        .filter((d) => d.games > 0)
        .sort((a, b) => b.games - a.games)
        .map((item) => (
          <div key={item.category} className="flex items-center gap-3">
            <span className="text-xl w-8">{CATEGORY_ICONS[item.category]}</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">
                  {t(`games.categories.${item.category}`)}
                </span>
                <span className="text-slate-400">
                  {t('progress.gamesAvg', { games: item.games, avg: item.avgScore.toLocaleString() })}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.games / maxGames) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
              </div>
            </div>
          </div>
        ))}
      {data.filter((d) => d.games > 0).length === 0 && (
        <div className="text-center text-slate-400 py-4">
          {t('progress.noGamesInPeriod')}
        </div>
      )}
    </div>
  );
}

// Radar chart for brain balance
function RadarChart({ stats }: { stats: Record<GameCategory, number> }) {
  const categories: GameCategory[] = [
    'memory',
    'logic',
    'focus',
    'calculation',
    'language',
    'speed',
  ];

  const maxValue = Math.max(...Object.values(stats), 1);
  const cx = 150;
  const cy = 120;
  const radius = 80;

  // Calculate points for each category
  const points = categories.map((cat, i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
    const value = stats[cat] / maxValue;
    return {
      category: cat,
      x: cx + Math.cos(angle) * radius * value,
      y: cy + Math.sin(angle) * radius * value,
      labelX: cx + Math.cos(angle) * (radius + 25),
      labelY: cy + Math.sin(angle) * (radius + 25),
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 300 240" className="w-full">
      {/* Grid */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={categories
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
              return `${cx + Math.cos(angle) * radius * ring},${
                cy + Math.sin(angle) * radius * ring
              }`;
            })
            .join(' ')}
          fill="none"
          stroke="#334155"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {categories.map((_, i) => {
        const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * radius}
            y2={cy + Math.sin(angle) * radius}
            stroke="#334155"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <motion.polygon
        points={polygonPoints}
        fill="#8b5cf640"
        stroke="#8b5cf6"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        transition={{ duration: 0.5 }}
      />

      {/* Data points */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="5"
          fill="#8b5cf6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}

      {/* Labels */}
      {points.map((point, i) => (
        <text
          key={i}
          x={point.labelX}
          y={point.labelY}
          fill="#94a3b8"
          fontSize="11"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {CATEGORY_ICONS[point.category]}
        </text>
      ))}
    </svg>
  );
}

// Empty chart placeholder
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
      {message}
    </div>
  );
}

// Helper functions
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  const locale = i18n.language || 'en';
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}
