# Daily Brain PWA - Implementation Plan

Based on the Brain Training PWA Strategy Document, this plan outlines the concrete steps to build "Daily Brain" - a brain training PWA delivering fresh cognitive challenges daily.

---

## Project Overview

**Product Name:** Daily Brain
**Tagline:** "A new game every day"
**Target:** Mobile-first PWA competing with Lumosity, Peak, and NYT Games
**Differentiator:** Fresh daily content + lightweight PWA + strong gamification

---

## Phase 1: Foundation & MVP (Weeks 1-6)

### 1.1 Project Setup (Week 1)

#### Tasks:
- [ ] Initialize React 18 + Vite project
- [ ] Configure TypeScript with strict mode
- [ ] Set up Tailwind CSS with custom theme
- [ ] Configure ESLint + Prettier
- [ ] Initialize Git repository with branching strategy
- [ ] Set up basic CI/CD pipeline (GitHub Actions)

#### File Structure to Create:
```
daily-brain/
├── src/
│   ├── app/
│   │   ├── routes/
│   │   └── App.tsx
│   ├── components/
│   │   └── ui/
│   ├── games/
│   │   └── core/
│   ├── stores/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   └── styles/
├── public/
│   ├── icons/
│   └── manifest.json
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

#### Dependencies to Install:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "zustand": "^4.x",
    "@tanstack/react-query": "^5.x",
    "framer-motion": "^10.x",
    "clsx": "^2.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "vite": "^5.x",
    "vite-plugin-pwa": "^0.17.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x"
  }
}
```

---

### 1.2 Core Infrastructure (Week 1-2)

#### 1.2.1 PWA Configuration

**Task: Create Web App Manifest**
- File: `public/manifest.json`
- Configure app name, icons, theme colors, display mode
- Set up shortcuts for "Today's Challenge" and "Quick Workout"

**Task: Set up Service Worker**
- Install and configure Workbox via vite-plugin-pwa
- Implement caching strategies:
  - Static assets: Cache-first
  - API calls: Network-first with cache fallback
  - Daily challenges: Stale-while-revalidate
- Pre-cache next 7 days of puzzle data

**Task: Create Icon Set**
- Generate icons at sizes: 72, 96, 128, 144, 192, 512px
- Create maskable icons for Android
- Create favicon.ico

#### 1.2.2 Seeded Random Number Generator

**Task: Implement SeededRNG class**
- File: `src/games/core/SeededRNG.ts`
- Implement Mulberry32 algorithm
- Methods: `next()`, `nextInt(min, max)`, `shuffle(array)`
- Used for deterministic daily puzzle generation

**Task: Implement Daily Seed Generator**
- File: `src/utils/dailySeed.ts`
- Generate seed from date (daysSinceEpoch + gameId hash)
- Ensure all users get identical puzzles each day

#### 1.2.3 State Management

**Task: Set up Zustand stores**
- `src/stores/userStore.ts` - User profile, stats, preferences
- `src/stores/gameStore.ts` - Active game state, session data
- `src/stores/settingsStore.ts` - App settings, notifications

**Task: Set up React Query**
- Configure QueryClient with offline support
- Create API hooks for daily challenges, results, stats

---

### 1.3 Game Engine Architecture (Week 2-3)

#### 1.3.1 Base Game Engine

**Task: Create abstract GameEngine class**
- File: `src/games/core/GameEngine.ts`
- Properties: seed, rng, difficulty, state
- Abstract methods: `generate()`, `render()`, `handleInput()`, `calculateScore()`
- Shared methods: `start()`, `complete()`, lifecycle hooks

#### 1.3.2 Difficulty System

**Task: Implement Difficulty Curve**
- File: `src/games/core/DifficultySystem.ts`
- Day-of-week modifiers (Sun=0.7, Mon=0.8, ... Fri=1.2, Sat=0.6)
- Monthly progression (difficulty increases through month)
- Adaptive difficulty based on user performance

#### 1.3.3 Game Loader

**Task: Create Dynamic Game Loader**
- File: `src/games/core/GameLoader.ts`
- Lazy-load game modules using `import()`
- Code-splitting per game category
- Preload upcoming games

---

### 1.4 First 6 Games (Week 3-5)

Implement one game per cognitive category for MVP:

#### Memory: Pattern Echo
- File: `src/games/memory/PatternEcho/`
- Mechanic: Watch sequence of tiles, reproduce in order
- Features:
  - Canvas-based grid (3x3 to 5x5)
  - Touch-friendly large tiles
  - Audio feedback
  - Sequence length 3-12 based on difficulty

#### Logic: Grid Deduction (Sudoku-like)
- File: `src/games/logic/GridDeduction/`
- Mechanic: Fill grid following logical rules
- Features:
  - DOM-based grid
  - Input validation
  - Hint system
  - Multiple rule variants

#### Focus: Color Word Stroop
- File: `src/games/focus/ColorStroop/`
- Mechanic: Identify color of word, not word meaning
- Features:
  - Text-only, extremely lightweight
  - Rapid response timer
  - Accuracy tracking
  - Progressive speed increase

#### Calculation: Math Sprint
- File: `src/games/calculation/MathSprint/`
- Mechanic: Solve equations before time runs out
- Features:
  - Touch/keyboard numpad input
  - Operations: +, -, ×, ÷
  - Difficulty scales with number magnitude
  - Time pressure

#### Language: Word Morph
- File: `src/games/language/WordMorph/`
- Mechanic: Transform word to another, one letter at a time
- Features:
  - Compressed dictionary (~100KB)
  - Instant validation
  - Hint system (show optimal path)
  - Offline dictionary support

#### Speed: Reflex Tap
- File: `src/games/speed/ReflexTap/`
- Mechanic: Tap target as quickly as possible
- Features:
  - Sub-16ms touch event handling
  - Go/no-go trials
  - Reaction time measurement
  - Personal best tracking

---

### 1.5 Daily Challenge System (Week 4-5)

#### 1.5.1 Content Calendar System

**Task: Create Calendar Structure**
- File: `src/services/calendar.ts`
- Monthly themes (Jan=Memory, Feb=Language, etc.)
- Weekly rotation (Mon=Memory, Tue=Logic, etc.)
- Special days (Pi Day, New Year, etc.)

**Task: Create Daily Content Resolver**
- File: `src/services/dailyContent.ts`
- Resolve today's game based on calendar
- Generate seed for procedural content
- Apply difficulty curve

#### 1.5.2 Game Selection Logic

**Task: Implement Game Selection**
- Select featured game (monthly focus)
- Select supporting games (weekly focus)
- Apply special day overrides
- Generate consistent seeds for all players

---

### 1.6 Basic UI Components (Week 5-6)

#### Landing Screen
- Today's challenge card with game preview
- Play Now CTA
- Quick stats (streak, brain score)
- Category badge and difficulty indicator

#### Tutorial System
- Progressive step-by-step instructions
- Interactive demos
- Skip option after first play
- Per-game tutorial state

#### Game Session UI
- Level progress indicator
- Lives/hearts display
- Score counter
- Pause functionality
- Back confirmation

#### Results Screen
- Score display with stars (1-5)
- Performance comparison (vs yesterday, week avg)
- Streak counter and milestone progress
- Share button (Wordle-style emoji card)
- Tomorrow's preview

#### Navigation
- Bottom navigation bar
- Routes: Home, Games, Profile
- Game library with category filters

---

### 1.7 Basic Streak System (Week 5-6)

**Task: Implement Streak Logic**
- File: `src/services/streak.ts`
- Track daily play completion
- Calculate consecutive days
- Grace period (2 hours after midnight)
- Streak break detection

**Task: Create Streak UI Components**
- Streak counter with flame animation
- 7-day week view calendar
- Milestone progress bar
- Streak protection status

---

### 1.8 Local Storage & Offline Support (Week 6)

**Task: Implement Offline Data Manager**
- File: `src/services/offline.ts`
- Store game results locally
- Queue results for sync when online
- Cache daily challenge data for 7 days
- Handle offline play seamlessly

**Task: Background Sync**
- Sync offline results when connection restored
- Conflict resolution strategy
- Retry with exponential backoff

---

## Phase 2: Engagement Features (Weeks 7-10)

### 2.1 Full Badge System (Week 7)

**Task: Create Badge System**
- File: `src/services/badges.ts`
- Categories: Streak, Mastery, Special, Social
- Rarity levels: Common, Uncommon, Rare, Epic, Legendary
- Progress tracking for each badge
- Achievement notification system

**Badges to Implement:**
- Streak badges: 7, 14, 30, 60, 90, 180, 365 days
- Category mastery badges (one per cognitive domain)
- Special event badges (Early Bird, Night Owl, Pi Day)
- Social badges (First Share, Referrer)

### 2.2 Brain Stats Dashboard (Week 7-8)

**Task: Implement Brain Score Calculation**
- File: `src/services/brainStats.ts`
- Calculate overall brain score (0-1000)
- Track per-category scores
- Weighted averages with recency bias
- Trend calculation (improving/stable/declining)

**Task: Create Stats UI**
- Radar chart for category overview
- Line chart for progress over time
- Sparklines for individual categories
- Percentile ranking display

### 2.3 Push Notifications (Week 8-9)

**Task: Set up Push Notification Service**
- File: `src/services/push.ts`
- VAPID key generation
- Subscription management
- Permission request flow with custom UI

**Notification Types to Implement:**
- Daily reminder (customizable time)
- Streak warning (3 hours before midnight)
- Achievement unlocked
- Weekly summary

**Task: Smart Notification Timing**
- Respect user timezone
- Skip if already played today
- Optimal send times based on engagement data

### 2.4 Share Functionality (Week 9)

**Task: Create Share Card Generator**
- Wordle-style emoji grid
- Score and streak display
- Spoiler-free format
- Copy to clipboard
- Native share API integration

### 2.5 A2HS Optimization (Week 10)

**Task: Implement A2HS Manager**
- Capture beforeinstallprompt event
- Behavioral trigger conditions:
  - 3+ games played
  - 2+ days visited
  - 2+ day streak
  - 2+ min session duration
- Custom install prompt UI
- Install tracking analytics

---

## Phase 3: Content Expansion (Weeks 11-14)

### 3.1 Remaining 14 Games (Weeks 11-13)

#### Memory Games
- [ ] Face & Name Match (SVG face generation)
- [ ] Card Flip Recall (CSS animations)
- [ ] Memory Palace (2D room layouts)

#### Logic Games
- [ ] Sequence Predictor (pattern recognition)
- [ ] Logic Gate Puzzles (boolean logic)
- [ ] Balance Scale (deductive reasoning)

#### Focus Games
- [ ] Target Tracker (divided attention)
- [ ] Rapid Sort (task switching)
- [ ] Focus Flow (sustained attention)

#### Calculation Games
- [ ] Estimation Station (number sense)
- [ ] Number Chain (sequential calculation)
- [ ] Fraction Action (percentage processing)

#### Language Games
- [ ] Category Sprint (verbal fluency)
- [ ] Anagram Blitz (letter manipulation)
- [ ] Context Clues (vocabulary)

#### Speed Games
- [ ] Speed Match (n-back)
- [ ] Quick Draw (pattern reproduction)

### 3.2 Tier System (Week 13)

**Task: Implement Tier Progression**
- Tiers: Bronze, Silver, Gold, Platinum, Diamond, Master
- Score thresholds for each tier
- Tier-based rewards
- Seasonal reset (quarterly)

### 3.3 Leaderboards (Week 14)

**Task: Implement Leaderboard System**
- Daily, weekly, all-time boards
- Friends leaderboard
- Percentile ranking
- Redis sorted sets for efficient ranking

### 3.4 Social Features (Week 14)

- Friend connections
- Challenge friends
- Compare stats
- Activity feed

---

## Phase 4: Polish & Monetization (Weeks 15-18)

### 4.1 Performance Optimization (Week 15)

- Bundle size optimization
- Code splitting per game
- Image optimization
- Core Web Vitals targets:
  - FCP < 1.5s
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### 4.2 Premium Features (Week 16-17)

- Streak freeze (1 per week for premium)
- Extended game archive access
- Advanced brain insights
- Ad-free experience
- Priority support

### 4.3 Analytics & Monitoring (Week 17)

- Event tracking (Plausible/PostHog)
- Error monitoring (Sentry)
- Performance monitoring
- A/B testing framework

### 4.4 Launch Preparation (Week 18)

- User testing and feedback incorporation
- Bug fixes and polish
- App store assets (screenshots, descriptions)
- Marketing website
- Documentation

---

## Backend Implementation

### Database Setup (PostgreSQL + Prisma)

**Models to Create:**
- User (profile, stats, streaks)
- GameResult (scores, progress data)
- UserBadge (earned badges)
- DailyChallenge (pre-generated puzzles)
- PushSubscription (notification settings)
- UserPreferences (timezone, reminder time)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/daily/:date` | GET | Get daily challenge |
| `/api/results` | POST | Submit game result |
| `/api/stats/:userId` | GET | Get brain stats |
| `/api/push/subscribe` | POST | Subscribe to push |
| `/api/leaderboard/:type` | GET | Get leaderboard |
| `/api/badges/:userId` | GET | Get user badges |

### Infrastructure

- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway or Render
- **Database:** PostgreSQL (Supabase or Railway)
- **Cache:** Redis (Upstash)
- **CDN:** Cloudflare
- **Push Service:** Web Push Protocol

---

## Key Metrics & Success Criteria

| Metric | MVP Target | Launch Target |
|--------|------------|---------------|
| D1 Retention | 30% | 40% |
| D7 Retention | 15% | 25% |
| D30 Retention | 8% | 15% |
| PWA Install Rate | 10% | 20% |
| Avg. Session | 2 min | 3 min |
| Games/Session | 1.2 | 1.5 |
| Streak >7 Days | 25% | 40% |

---

## Immediate Next Steps

1. **Initialize Project** - Set up React + Vite + TypeScript project
2. **Create Core Infrastructure** - SeededRNG, GameEngine base class
3. **Build First Game** - Pattern Echo (Memory category)
4. **Set Up PWA** - Manifest, service worker, offline support
5. **Create Landing Screen** - Today's challenge display
6. **Implement Streak System** - Basic streak tracking

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React 18 + Vite | Fast dev experience, great PWA support |
| State | Zustand | Lightweight, simple API |
| Styling | Tailwind CSS | Rapid development, consistent design |
| Game Rendering | DOM + Canvas hybrid | DOM for simple games, Canvas for animations |
| Offline | Workbox | Industry standard, excellent caching |
| Backend | Fastify + Prisma | Fast Node.js, type-safe ORM |
| Database | PostgreSQL | Reliable, great for relational data |
| Cache | Redis | Fast leaderboards, session data |

---

*Implementation Plan Version 1.0*
*Based on Brain Training PWA Strategy Document*
