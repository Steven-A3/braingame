import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useFeedback } from '@/hooks/useFeedback';
import { languages } from '@/i18n';
import { Elly } from '@/components/mascot';
import type { EllyState } from '@/components/mascot';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS: Array<{
  id: string;
  icon?: string;
  ellyState?: EllyState;
  useElly?: boolean;
  categories?: Array<{ key: string; icon: string; color: string }>;
}> = [
  {
    id: 'language',
    icon: '🌍',
  },
  {
    id: 'welcome',
    useElly: true,
    ellyState: 'neutral',
  },
  {
    id: 'categories',
    useElly: true,
    ellyState: 'happy',
    categories: [
      { key: 'memory', icon: '🔮', color: 'bg-purple-500' },
      { key: 'logic', icon: '🧩', color: 'bg-blue-500' },
      { key: 'focus', icon: '🎨', color: 'bg-green-500' },
      { key: 'calculation', icon: '➕', color: 'bg-orange-500' },
      { key: 'language', icon: '📝', color: 'bg-pink-500' },
      { key: 'speed', icon: '⚡', color: 'bg-yellow-500' },
    ],
  },
  {
    id: 'daily',
    useElly: true,
    ellyState: 'neutral',
  },
  {
    id: 'compete',
    useElly: true,
    ellyState: 'happy',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const feedback = useFeedback();

  const handleLanguageSelect = (langCode: string) => {
    feedback.tap();
    i18n.changeLanguage(langCode);
  };

  const handleNext = () => {
    feedback.tap();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      feedback.complete();
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      feedback.tap();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    feedback.tap();
    onComplete();
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    // Swipe left (next) - negative offset/velocity
    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      handleNext();
    }
    // Swipe right (previous) - positive offset/velocity
    else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      handlePrev();
    }
  };

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Skip button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={handleSkip}
          className="text-slate-400 hover:text-white text-sm"
        >
          {t('onboarding.skip')}
        </button>
      </div>

      {/* Content - Swipeable area */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center p-6 cursor-grab active:cursor-grabbing touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-sm pointer-events-none"
          >
            {/* Icon or Elly */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="mb-6 flex justify-center"
            >
              {step.useElly ? (
                <Elly size={100} state={step.ellyState || 'neutral'} />
              ) : (
                <span className="text-7xl">{step.icon}</span>
              )}
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-3">{t(`onboarding.${step.id}.title`)}</h1>

            {/* Description */}
            <p className="text-slate-400 mb-8">{t(`onboarding.${step.id}.description`)}</p>

            {/* Language selection dropdown */}
            {step.id === 'language' && (
              <div className="pointer-events-auto w-full max-w-xs mx-auto">
                {/* Current language display */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">
                    {languages.find(l => l.code === i18n.language || i18n.language.startsWith(l.code.split('-')[0]))?.flag || '🌐'}
                  </span>
                  <span className="text-xl font-semibold">
                    {languages.find(l => l.code === i18n.language || i18n.language.startsWith(l.code.split('-')[0]))?.nativeName || i18n.language}
                  </span>
                </div>

                {/* Dropdown select */}
                <select
                  value={i18n.language}
                  onChange={(e) => handleLanguageSelect(e.target.value)}
                  className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-center text-lg font-medium appearance-none cursor-pointer hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Categories grid */}
            {step.id === 'categories' && step.categories && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {step.categories.map((cat, idx) => (
                  <motion.div
                    key={cat.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className={`${cat.color} rounded-xl p-3 text-center`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-medium">{t(`games.categories.${cat.key}`)}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Progress dots & button */}
      <div className="p-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentStep ? 'bg-primary-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="btn-primary w-full"
        >
          {isLastStep ? t('onboarding.getStarted') : t('onboarding.next')}
        </button>
      </div>
    </div>
  );
}
