import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { languages, type LanguageCode } from '@/i18n';
import { useFeedback } from '@/hooks/useFeedback';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const feedback = useFeedback();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: LanguageCode) => {
    feedback.tap();
    i18n.changeLanguage(code);
    setIsOpen(false);

    // Handle RTL for Arabic
    const lang = languages.find((l) => l.code === code);
    if (lang && 'rtl' in lang && lang.rtl) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = code;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = code;
    }
  };

  return (
    <div className="relative">
      {/* Current language button */}
      <button
        onClick={() => {
          feedback.tap();
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentLanguage.flag}</span>
          <div className="text-left">
            <div className="font-medium">{t('settings.language')}</div>
            <div className="text-sm text-slate-400">{currentLanguage.nativeName}</div>
          </div>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Language dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 bg-slate-800 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto border border-slate-700"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                    lang.code === i18n.language ? 'bg-slate-700/50' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{lang.nativeName}</div>
                    <div className="text-xs text-slate-400">{lang.name}</div>
                  </div>
                  {lang.code === i18n.language && (
                    <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
