import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { GAMES } from '@/games/registry';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/games/core/types';
import type { GameCategory } from '@/games/core/types';
import { Elly } from '@/components/mascot';
import { trackCategoryLandingView, trackGameCardClick } from '@/services/analytics';

// SEO metadata for each category
const CATEGORY_SEO: Record<string, {
  slug: string;
  category: GameCategory;
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
}> = {
  'memory-games': {
    slug: 'memory-games',
    category: 'memory',
    title: 'Free Memory Games Online | Brain Training Memory Exercises',
    description: 'Play free memory games online to improve recall and concentration. Pattern matching, card flip, number sequences & spatial memory games. No download required!',
    h1: 'Free Memory Games Online',
    intro: 'Strengthen your memory with our collection of free memory training games. Challenge your recall, pattern recognition, and spatial memory skills.',
    keywords: ['memory games', 'free memory games', 'memory training', 'brain memory games', 'memory exercises'],
  },
  'logic-puzzles': {
    slug: 'logic-puzzles',
    category: 'logic',
    title: 'Free Logic Puzzles & Brain Teasers Online | Logic Games',
    description: 'Challenge your mind with free logic puzzles and brain teasers. Grid deduction, sequence solving, pattern recognition games. Sharpen your reasoning skills!',
    h1: 'Free Logic Puzzles & Brain Teasers',
    intro: 'Test your logical thinking with challenging puzzles and brain teasers. Improve problem-solving, deductive reasoning, and pattern recognition.',
    keywords: ['logic puzzles', 'brain teasers', 'logic games', 'puzzle games', 'reasoning games'],
  },
  'focus-games': {
    slug: 'focus-games',
    category: 'focus',
    title: 'Free Focus & Concentration Games | Attention Training',
    description: 'Improve focus and concentration with free attention training games. Color stroop, target tracking, visual search games to boost your attention span.',
    h1: 'Free Focus & Concentration Games',
    intro: 'Train your attention and concentration with engaging focus games. Build better focus habits and improve your ability to concentrate.',
    keywords: ['focus games', 'concentration games', 'attention training', 'focus exercises', 'attention games'],
  },
  'math-games': {
    slug: 'math-games',
    category: 'calculation',
    title: 'Free Math Games for Adults | Mental Math Training',
    description: 'Sharpen your math skills with free mental math games. Quick calculations, number chains, estimation challenges. Fun math brain training for adults!',
    h1: 'Free Math Games for Adults',
    intro: 'Boost your mental math abilities with fun calculation games. Practice quick arithmetic, estimation, and number manipulation skills.',
    keywords: ['math games', 'mental math', 'math games for adults', 'calculation games', 'arithmetic games'],
  },
  'word-games': {
    slug: 'word-games',
    category: 'language',
    title: 'Free Word Games Online | Vocabulary & Language Games',
    description: 'Play free word games to expand vocabulary and language skills. Anagrams, word puzzles, category games. Fun brain training with words!',
    h1: 'Free Word Games Online',
    intro: 'Enhance your vocabulary and language skills with engaging word games. Challenge yourself with anagrams, word associations, and more.',
    keywords: ['word games', 'vocabulary games', 'language games', 'word puzzles', 'anagram games'],
  },
  'speed-games': {
    slug: 'speed-games',
    category: 'speed',
    title: 'Free Reaction Time Games | Speed & Reflex Training',
    description: 'Test and improve your reaction time with free speed games. Reflex challenges, quick matching, rapid decision games. Train your brain speed!',
    h1: 'Free Reaction Time & Speed Games',
    intro: 'Challenge your reflexes and processing speed with fast-paced games. Improve reaction time, quick thinking, and rapid decision making.',
    keywords: ['reaction time games', 'speed games', 'reflex games', 'quick games', 'fast brain games'],
  },
};

export function CategoryLandingPage() {
  const location = useLocation();
  const { t } = useTranslation();

  // Extract category slug from pathname (e.g., '/memory-games' -> 'memory-games')
  const categorySlug = useMemo(() => {
    return location.pathname.replace('/', '');
  }, [location.pathname]);

  const seoData = categorySlug ? CATEGORY_SEO[categorySlug] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (seoData) {
      trackCategoryLandingView(seoData.category, categorySlug);
    }
  }, [categorySlug, seoData]);

  if (!seoData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Elly size={80} state="encourage" />
          <h1 className="text-2xl font-bold mt-4">Page Not Found</h1>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const categoryGames = GAMES.filter(g => g.category === seoData.category);
  const categoryColor = CATEGORY_COLORS[seoData.category];
  const categoryIcon = CATEGORY_ICONS[seoData.category];

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords.join(', ')} />
        <link rel="canonical" href={`https://dailybrain.one/${seoData.slug}`} />

        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={`https://dailybrain.one/${seoData.slug}`} />

        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
      </Helmet>

      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
            <Link to="/" className="text-slate-400 hover:text-white">
              ← {t('common.back')}
            </Link>
            <Link to="/" className="font-bold text-lg">Daily Brain</Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="flex justify-center mb-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                style={{ backgroundColor: `${categoryColor}20` }}
              >
                {categoryIcon}
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">{seoData.h1}</h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              {seoData.intro}
            </p>
          </motion.section>

          {/* Games Grid */}
          <section className="py-6">
            <h2 className="text-xl font-semibold mb-4">
              {t('games.categories.' + seoData.category)} {t('nav.games')}
            </h2>
            <div className="grid gap-3">
              {categoryGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/play/${game.id}`}
                    className="card flex items-center gap-4 hover:bg-slate-800/80 transition-colors"
                    onClick={() => trackGameCardClick(game.id, game.category, 'category_landing')}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: `${categoryColor}20` }}
                    >
                      {game.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">
                        {t(`games.names.${game.id}`, { defaultValue: game.name })}
                      </h3>
                      <p className="text-sm text-slate-400 truncate">
                        {t(`games.descriptions.${game.id}`, { defaultValue: game.description })}
                      </p>
                    </div>
                    <div className="text-slate-500 text-sm">
                      {game.duration}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="py-8 border-t border-slate-800">
            <h2 className="text-xl font-semibold mb-4">
              Why Play {seoData.h1.replace('Free ', '')}?
            </h2>
            <div className="prose prose-invert prose-slate max-w-none">
              <p className="text-slate-400">
                Regular brain training with {seoData.category} games can help maintain cognitive
                fitness and mental agility. Our {seoData.category} games are designed to challenge
                your brain while being fun and engaging.
              </p>
              <ul className="text-slate-400 mt-4 space-y-2">
                <li>✓ 100% free to play - no subscription required</li>
                <li>✓ No download needed - play instantly in your browser</li>
                <li>✓ Track your progress and improvements</li>
                <li>✓ New challenges every day</li>
                <li>✓ Works on phone, tablet, and computer</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="py-8 text-center">
            <Elly size={60} state="happy" />
            <h2 className="text-xl font-semibold mt-4 mb-2">Ready to Train Your Brain?</h2>
            <p className="text-slate-400 mb-4">Start with our daily workout for a complete brain training session.</p>
            <Link to="/workout" className="btn-primary inline-block">
              Start Daily Workout
            </Link>
          </section>

          {/* Other Categories */}
          <section className="py-8 border-t border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Explore More Brain Games</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CATEGORY_SEO)
                .filter(([slug]) => slug !== categorySlug)
                .slice(0, 4)
                .map(([slug, data]) => (
                  <Link
                    key={slug}
                    to={`/${slug}`}
                    className="card text-center py-4 hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="text-2xl mb-2">{CATEGORY_ICONS[data.category]}</div>
                    <div className="text-sm font-medium">{data.h1.replace('Free ', '')}</div>
                  </Link>
                ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Daily Brain - Free Brain Training Games</p>
          <div className="mt-2 space-x-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/games" className="hover:text-white">All Games</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
