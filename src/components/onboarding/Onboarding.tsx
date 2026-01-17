import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedback } from '@/hooks/useFeedback';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Daily Brain',
    description: 'Train your mind with fun, scientifically-inspired games.',
    icon: '🧠',
  },
  {
    id: 'categories',
    title: '6 Cognitive Areas',
    description: 'Challenge yourself across memory, logic, focus, calculation, language, and speed.',
    icon: '🎯',
    categories: [
      { name: 'Memory', icon: '🔮', color: 'bg-purple-500' },
      { name: 'Logic', icon: '🧩', color: 'bg-blue-500' },
      { name: 'Focus', icon: '🎨', color: 'bg-green-500' },
      { name: 'Calculation', icon: '➕', color: 'bg-orange-500' },
      { name: 'Language', icon: '📝', color: 'bg-pink-500' },
      { name: 'Speed', icon: '⚡', color: 'bg-yellow-500' },
    ],
  },
  {
    id: 'daily',
    title: 'Daily Workouts',
    description: 'Complete curated 5-game sessions to build a streak and track your progress.',
    icon: '📅',
  },
  {
    id: 'compete',
    title: 'Compete & Improve',
    description: 'Climb the leaderboards, earn badges, and watch your brain stats grow!',
    icon: '🏆',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const feedback = useFeedback();

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
          Skip
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
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="text-7xl mb-6"
            >
              {step.icon}
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-3">{step.title}</h1>

            {/* Description */}
            <p className="text-slate-400 mb-8">{step.description}</p>

            {/* Categories grid (step 2) */}
            {step.id === 'categories' && step.categories && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {step.categories.map((cat, idx) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className={`${cat.color} rounded-xl p-3 text-center`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-medium">{cat.name}</div>
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
          {isLastStep ? "Let's Go!" : 'Next'}
        </button>
      </div>
    </div>
  );
}
