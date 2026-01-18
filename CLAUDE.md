# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Architecture Overview

**Daily Brain** is a PWA brain training app with 20 games across 6 cognitive categories.

### Core Structure

```
src/
├── app/              # Routes and layouts (React Router)
├── components/       # Shared UI components
├── features/         # Feature modules (quests system)
├── games/            # Game implementations
├── i18n/             # Internationalization (31 languages)
├── services/         # Business logic services
├── stores/           # Zustand state management
└── hooks/            # Custom React hooks
```

### Game System

Games are organized by category under `src/games/`:
- **Categories**: memory, logic, focus, calculation, language, speed
- **Each game has**: `[GameName].tsx` (UI), `[GameName]Engine.ts` (logic), `index.ts` (exports)
- **Registry**: `src/games/registry.ts` - master list of all 20 games
- **Core types**: `src/games/core/types.ts` - GameCategory, GameResult, GameState interfaces

### State Management

- **User Store** (`src/stores/userStore.ts`): Zustand with persist middleware. Manages user profile, stats, game history, daily workout progress, badges, currency (coins/gems/xp), and settings.
- **Quest Store** (`src/features/quests/questStore.ts`): Daily quests system with progress tracking.

### Internationalization

- 31 languages supported via react-i18next
- Locale files in `src/i18n/locales/*.json`
- Use `const { t } = useTranslation()` hook
- Translation keys: `t('section.key')` or with variables `t('key', { count: 5 })`
- Game names/categories: `t('games.names.game-id')`, `t('games.categories.memory')`

**Supported languages**: en, fr, es, pt, de, it, da, sv, no, fi, pl, hu, cs, ru, ko, ja, zh-CN, zh-TW, id, th, vi, ar, tr, hi, nl, uk, fil, ms, ro, el, he

### PWA Configuration

- Configured in `vite.config.ts` using `vite-plugin-pwa`
- `registerType: 'prompt'` - shows update notification when new version available
- Update prompt component: `src/components/pwa/UpdatePrompt.tsx`

### Key Patterns

**Adding translations**: Update `src/i18n/locales/en.json` first, then all other locale files.

**Game results flow**: Game → `GamePlayPage.tsx` → `recordGameResult()` in userStore → updates stats, badges, streaks.

**Routes**: Defined in `src/app/App.tsx`. Main layout routes (with bottom nav) vs standalone routes (gameplay, settings).
