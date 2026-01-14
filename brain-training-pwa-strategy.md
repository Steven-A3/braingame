# Brain Training PWA Strategic Planning Document
## "Daily Brain" - A New Game Every Day

---

## Executive Summary

This document outlines a comprehensive strategy for developing a brain training Progressive Web App (PWA) that delivers fresh cognitive challenges daily. By combining procedural generation, curated content calendars, and modern PWA capabilities, this service will maximize user engagement through the core value proposition: **"A new game every day."**

---

## 1. Competitive Analysis: User Retention & Content Delivery Benchmarks

### 1.1 Lumosity

**Business Model & Scale**
- 100M+ users globally; freemium with $11.99/month or $59.99/year premium
- 50+ scientifically-designed games across 5 cognitive areas

**Retention Strategies**
| Strategy | Implementation | Effectiveness |
|----------|----------------|---------------|
| Daily Workout | 5-game personalized session curated by algorithm | Core engagement driver |
| Fit Test | Periodic cognitive assessment with LPI (Lumosity Performance Index) | Creates measurable progress |
| Adaptive Difficulty | Real-time adjustment based on performance | Maintains flow state |
| Progress Tracking | Detailed analytics comparing to age/demographic groups | Social proof & motivation |
| Streaks | Daily play streaks with visual reinforcement | Habit formation |

**Content Delivery**
- Algorithm selects games based on user's weakest areas
- New games introduced quarterly (slow release cycle)
- Same games with procedurally adjusted difficulty levels

**Weaknesses to Exploit**
- Heavy native app focus (poor web experience)
- Repetitive game selection after extended use
- Scientific claims legally challenged (FTC settlement)

---

### 1.2 Peak

**Business Model & Scale**
- 50M+ downloads; freemium with $4.99/month or $34.99/year
- 45+ games developed with Cambridge/Yale researchers

**Retention Strategies**
| Strategy | Implementation | Effectiveness |
|----------|----------------|---------------|
| Coach Feature | AI "Coach" provides personalized recommendations | Emotional connection |
| Workouts | Themed workout plans (e.g., "Focus Workout") | Goal-oriented engagement |
| Pro Insights | Deep analytics on cognitive performance | Premium value driver |
| Daily Goals | Customizable daily targets | Autonomy + achievement |
| Challenges | Time-limited competitive events | FOMO-driven engagement |

**Content Delivery**
- Rotates featured games weekly
- Seasonal events and themed challenges
- Community challenges with leaderboards

**Weaknesses to Exploit**
- Limited free tier (only 1 workout/day)
- No true "daily new content" - same games rotate
- Minimal social features

---

### 1.3 NYT Games (Wordle, Connections, Spelling Bee, etc.)

**Business Model & Scale**
- 10M+ daily Wordle players; $6.99/month for Games subscription
- Acquired Wordle for $1M+ in 2022

**Retention Strategies**
| Strategy | Implementation | Effectiveness |
|----------|----------------|---------------|
| Single Daily Puzzle | One puzzle per day, same for everyone | Creates shared experience |
| Share Results | Emoji-based spoiler-free sharing | Viral social mechanics |
| Streaks | Visible streak counter | Primary retention driver |
| Simplicity | 6 attempts, 5-letter word, no complexity | Low barrier to entry |
| FOMO | Miss today = break streak forever | Powerful daily pull |

**Content Delivery**
- Human-curated word selection (not algorithmic)
- Exactly one puzzle per day at midnight local time
- Archive access for subscribers only

**Key Insights to Adopt**
- **Synchronous play** - everyone plays the same puzzle creates community
- **Share mechanics** - results must be shareable without spoilers
- **Constraint = engagement** - one chance per day increases perceived value
- **Ritual timing** - consistent release time builds daily habits

---

### 1.4 Competitive Positioning Matrix

```
                    HIGH SCIENTIFIC RIGOR
                           ↑
                     Lumosity
                        ●
                           
        Peak ●                    ● [OUR POSITION]
                                  "Daily Brain"
                           
    ←─────────────────────────────────────────────→
    REPETITIVE                              FRESH DAILY
    CONTENT                                  CONTENT
                           
                        ●
                    NYT Games
                           
                           ↓
                    LOW SCIENTIFIC RIGOR
```

**Our Differentiator:** Fresh daily content + lightweight PWA + strong gamification

---

## 2. Brain Training Areas & Mini-Game Concepts

### 2.1 Cognitive Domain Classification

| Domain | Description | Key Skills | Daily Relevance |
|--------|-------------|------------|-----------------|
| **Memory** | Information retention & recall | Working memory, pattern recall, spatial memory | Remember names, tasks, information |
| **Logic** | Reasoning & problem-solving | Deduction, pattern recognition, sequencing | Decision-making, planning |
| **Focus** | Attention & concentration | Selective attention, divided attention, sustained focus | Productivity, multitasking |
| **Calculation** | Numerical processing | Mental math, estimation, number sense | Budgeting, quick calculations |
| **Language** | Verbal processing | Word finding, vocabulary, verbal fluency | Communication, comprehension |
| **Speed** | Processing velocity | Reaction time, rapid decision-making | Quick thinking, reflexes |

---

### 2.2 HTML5 Mini-Game Concepts (Mobile-Optimized)

#### MEMORY GAMES

**1. Pattern Echo**
```
Type: Sequential Memory
Mechanic: Watch a sequence of tiles light up, reproduce in order
Difficulty Scaling: Sequence length (3→12), speed, grid size (3x3→5x5)
PWA Optimization: Canvas-based, <100KB, touch-friendly large tiles
Daily Variation: Different grid themes, color schemes, pattern styles
```

**2. Face & Name Match**
```
Type: Associative Memory  
Mechanic: Memorize face-name pairs, then match after delay
Difficulty Scaling: Number of faces (4→16), similarity, delay time
PWA Optimization: SVG-generated faces (no image loading), instant start
Daily Variation: Procedural face generation, cultural name sets
```

**3. Card Flip Recall**
```
Type: Spatial Memory
Mechanic: Classic concentration with cognitive twists
Difficulty Scaling: Grid size, time limits, special rules (match 3, sequences)
PWA Optimization: CSS animations only, no sprites needed
Daily Variation: Theme changes, special matching rules each day
```

**4. Memory Palace**
```
Type: Method of Loci
Mechanic: Place items in virtual room, recall positions later
Difficulty Scaling: Room complexity, item count, distractor tasks between
PWA Optimization: Simple 2D room layouts, touch to place/recall
Daily Variation: Different room types, item categories
```

---

#### LOGIC GAMES

**5. Grid Deduction (Sudoku-like)**
```
Type: Constraint Satisfaction
Mechanic: Fill grid following logical rules
Difficulty Scaling: Grid size, rule complexity, given numbers
PWA Optimization: Native DOM grid, no canvas needed
Daily Variation: Different rule sets (standard, diagonal, irregular regions)
```

**6. Sequence Predictor**
```
Type: Pattern Recognition
Mechanic: Identify the rule and predict next element
Difficulty Scaling: Pattern complexity (arithmetic→geometric→mixed)
PWA Optimization: SVG shapes, minimal assets
Daily Variation: Visual patterns, number sequences, symbol logic
```

**7. Logic Gate Puzzles**
```
Type: Boolean Logic
Mechanic: Connect inputs to outputs using AND/OR/NOT gates
Difficulty Scaling: Gate count, complexity, time pressure
PWA Optimization: SVG-based circuit diagrams, drag-and-drop
Daily Variation: Different circuit challenges, real-world scenarios
```

**8. Balance Scale**
```
Type: Deductive Reasoning
Mechanic: Determine unknown weights using balance comparisons
Difficulty Scaling: Number of objects, comparison limits
PWA Optimization: Physics-free visual balance, pure logic
Daily Variation: Different object sets, story contexts
```

---

#### FOCUS GAMES

**9. Color Word Stroop**
```
Type: Selective Attention
Mechanic: Identify color of word (not word meaning) rapidly
Difficulty Scaling: Speed, distractors, answer complexity
PWA Optimization: Text-only, extremely lightweight
Daily Variation: Different word/color combinations, bonus rounds
```

**10. Target Tracker**
```
Type: Divided Attention
Mechanic: Track multiple moving targets among distractors
Difficulty Scaling: Target count (2→6), speed, distractor similarity
PWA Optimization: CSS animations with transform, 60fps capable
Daily Variation: Different target types, movement patterns
```

**11. Rapid Sort**
```
Type: Task Switching
Mechanic: Sort items by rapidly changing rules (color→shape→size)
Difficulty Scaling: Rule switch frequency, item complexity
PWA Optimization: SVG shapes, touch swipe gestures
Daily Variation: Different sorting categories, themed items
```

**12. Focus Flow**
```
Type: Sustained Attention
Mechanic: Keep avatar in "flow zone" by continuous micro-adjustments
Difficulty Scaling: Zone size, distraction frequency, duration
PWA Optimization: RequestAnimationFrame loop, touch/tilt controls
Daily Variation: Different environments, obstacle types
```

---

#### CALCULATION GAMES

**13. Math Sprint**
```
Type: Mental Arithmetic
Mechanic: Solve equations before time runs out
Difficulty Scaling: Operation complexity, number magnitude, speed
PWA Optimization: Pure DOM, keyboard/touch numpad input
Daily Variation: Operation themes (×day, √day), story problems
```

**14. Estimation Station**
```
Type: Number Sense
Mechanic: Estimate quantities, distances, percentages quickly
Difficulty Scaling: Precision required, time pressure
PWA Optimization: Canvas for random dot/object generation
Daily Variation: Different estimation contexts (crowds, distances, volumes)
```

**15. Number Chain**
```
Type: Sequential Calculation
Mechanic: Connect numbers with operations to reach target
Difficulty Scaling: Chain length, operation variety, multiple solutions
PWA Optimization: Touch-drag to connect, instant validation
Daily Variation: Daily target numbers, themed number sets
```

**16. Fraction Action**
```
Type: Fraction/Percentage Processing
Mechanic: Visual fraction comparisons, percentage calculations
Difficulty Scaling: Denominator complexity, mixed formats
PWA Optimization: CSS pie charts and bars, no images
Daily Variation: Real-world contexts (tips, discounts, recipes)
```

---

#### LANGUAGE GAMES

**17. Word Morph**
```
Type: Lexical Flexibility
Mechanic: Transform one word to another, changing one letter at a time
Difficulty Scaling: Word length, required steps, time limit
PWA Optimization: Keyboard-focused, instant dictionary validation
Daily Variation: Themed word pairs, difficulty tiers
```

**18. Category Sprint**
```
Type: Verbal Fluency
Mechanic: Name items in category as fast as possible
Difficulty Scaling: Category specificity, time pressure, letter constraints
PWA Optimization: Speech-to-text optional, keyboard primary
Daily Variation: Daily category themes, bonus categories
```

**19. Anagram Blitz**
```
Type: Letter Manipulation
Mechanic: Form words from scrambled letters
Difficulty Scaling: Letter count, valid word count required
PWA Optimization: Touch letter tiles, instant word validation
Daily Variation: Daily letter sets, themed vocabulary
```

**20. Context Clues**
```
Type: Vocabulary in Context
Mechanic: Deduce meaning of fake word from sentence context
Difficulty Scaling: Context clarity, answer similarity
PWA Optimization: Text-only, minimal UI
Daily Variation: Daily "word of the day" discovery theme
```

---

#### SPEED GAMES

**21. Reflex Tap**
```
Type: Simple Reaction Time
Mechanic: Tap target as quickly as possible when it appears
Difficulty Scaling: Target size, appearance randomness, go/no-go trials
PWA Optimization: Sub-16ms touch event handling
Daily Variation: Different target types, reaction challenges
```

**22. Speed Match**
```
Type: Rapid Comparison
Mechanic: Quickly determine if current matches previous (n-back)
Difficulty Scaling: N-back level (1→3), stimulus complexity
PWA Optimization: Minimal UI, maximum speed
Daily Variation: Different stimulus types (shapes, symbols, sounds)
```

**23. Quick Draw**
```
Type: Pattern Reproduction Speed
Mechanic: Reproduce simple pattern as quickly as possible
Difficulty Scaling: Pattern complexity, precision required
PWA Optimization: Canvas drawing, gesture recognition
Daily Variation: Different pattern themes (letters, shapes, symbols)
```

---

### 2.3 Technical Feasibility Matrix

| Game | Bundle Size | Offline | Touch | Performance | Implementation |
|------|-------------|---------|-------|-------------|----------------|
| Pattern Echo | ~50KB | ✅ Full | Excellent | 60fps | Canvas + Web Audio |
| Face & Name | ~80KB | ✅ Full | Good | 30fps | SVG generation |
| Card Flip | ~30KB | ✅ Full | Excellent | 60fps | CSS transforms |
| Grid Deduction | ~40KB | ✅ Full | Good | N/A | DOM grid |
| Color Stroop | ~20KB | ✅ Full | Excellent | 60fps | DOM only |
| Target Tracker | ~60KB | ✅ Full | Good | 60fps | CSS animations |
| Math Sprint | ~25KB | ✅ Full | Excellent | N/A | DOM + touch numpad |
| Word Morph | ~100KB | ⚠️ Dict | Excellent | N/A | Compressed dictionary |
| Reflex Tap | ~15KB | ✅ Full | Excellent | <16ms | RAF loop |

---

## 3. Content Strategy: "A New Game Every Day"

### 3.1 Dual-System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DAILY CONTENT ENGINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────┐     ┌─────────────────────┐          │
│   │   PROCEDURAL        │     │   CURATED           │          │
│   │   GENERATION        │     │   CALENDAR          │          │
│   │                     │     │                     │          │
│   │  • Infinite levels  │     │  • 365 daily themes │          │
│   │  • Seed-based       │     │  • Seasonal events  │          │
│   │  • Difficulty curve │     │  • Special days     │          │
│   │  • Deterministic    │     │  • Editorial picks  │          │
│   └──────────┬──────────┘     └──────────┬──────────┘          │
│              │                           │                      │
│              └───────────┬───────────────┘                      │
│                          ▼                                      │
│              ┌─────────────────────┐                           │
│              │   DAILY CHALLENGE   │                           │
│              │   COMPOSER          │                           │
│              │                     │                           │
│              │   Combines:         │                           │
│              │   • Today's theme   │                           │
│              │   • Procedural game │                           │
│              │   • Curated rules   │                           │
│              └─────────────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Procedural Generation System

#### 3.2.1 Seed-Based Determinism

All users play the **exact same puzzle** each day (like Wordle):

```javascript
// Daily seed generation
function getDailySeed(gameId) {
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / 86400000);
  return hashCombine(daysSinceEpoch, gameId);
}

// Deterministic random number generator
class SeededRNG {
  constructor(seed) {
    this.seed = seed;
  }
  
  // Mulberry32 algorithm - fast, good distribution
  next() {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
```

#### 3.2.2 Game-Specific Generators

**Memory Pattern Generator**
```javascript
function generatePatternSequence(seed, difficulty) {
  const rng = new SeededRNG(seed);
  const gridSize = 3 + Math.floor(difficulty / 3); // 3x3 to 5x5
  const sequenceLength = 3 + difficulty; // 3 to 15
  
  const sequence = [];
  for (let i = 0; i < sequenceLength; i++) {
    sequence.push({
      row: rng.nextInt(0, gridSize - 1),
      col: rng.nextInt(0, gridSize - 1)
    });
  }
  
  return { gridSize, sequence, timePerTile: Math.max(300, 800 - difficulty * 30) };
}
```

**Sudoku Generator**
```javascript
function generateSudoku(seed, difficulty) {
  const rng = new SeededRNG(seed);
  
  // Start with solved grid
  const solved = generateSolvedGrid(rng);
  
  // Remove numbers based on difficulty
  const cellsToRemove = 20 + difficulty * 5; // 20-65 removed
  const puzzle = removeCells(solved, cellsToRemove, rng);
  
  // Ensure unique solution
  if (!hasUniqueSolution(puzzle)) {
    return generateSudoku(seed + 1, difficulty);
  }
  
  return { puzzle, solved, difficulty };
}
```

**Word Game Generator**
```javascript
function generateWordPuzzle(seed, difficulty, wordList) {
  const rng = new SeededRNG(seed);
  
  // Filter by difficulty (word frequency/length)
  const eligibleWords = wordList.filter(w => 
    w.length >= 4 + Math.floor(difficulty / 2) &&
    w.frequency <= 10000 - difficulty * 500
  );
  
  const targetWord = eligibleWords[rng.nextInt(0, eligibleWords.length - 1)];
  
  // Generate valid transformation path
  const path = findShortestPath(getStartWord(targetWord, rng), targetWord);
  
  return { start: path[0], end: path[path.length - 1], optimalSteps: path.length - 1 };
}
```

#### 3.2.3 Difficulty Progression System

```javascript
const DIFFICULTY_CURVE = {
  // Day of week modifiers
  dayModifiers: {
    0: 0.7,  // Sunday - Easy
    1: 0.8,  // Monday - Easy-Medium
    2: 0.9,  // Tuesday - Medium
    3: 1.0,  // Wednesday - Medium
    4: 1.1,  // Thursday - Medium-Hard
    5: 1.2,  // Friday - Hard
    6: 0.6   // Saturday - Relaxed
  },
  
  // Base difficulty increases over month
  monthProgression: (dayOfMonth) => Math.min(dayOfMonth / 30, 1),
  
  // Calculate final difficulty (1-10 scale)
  calculate(baseGameDifficulty, date) {
    const dayMod = this.dayModifiers[date.getDay()];
    const monthMod = this.monthProgression(date.getDate());
    return Math.round(baseGameDifficulty * dayMod * (0.8 + monthMod * 0.4));
  }
};
```

---

### 3.3 365-Day Curation Calendar System

#### 3.3.1 Calendar Structure

```javascript
const CALENDAR_STRUCTURE = {
  // Monthly themes
  months: {
    1: { theme: "New Beginnings", focus: "memory", color: "#4A90D9" },
    2: { theme: "Love & Connection", focus: "language", color: "#E74C3C" },
    3: { theme: "Growth & Spring", focus: "logic", color: "#27AE60" },
    4: { theme: "Clarity & Focus", focus: "focus", color: "#9B59B6" },
    5: { theme: "Mental Agility", focus: "speed", color: "#F39C12" },
    6: { theme: "Summer Sharpness", focus: "calculation", color: "#1ABC9C" },
    7: { theme: "Creative Thinking", focus: "language", color: "#E67E22" },
    8: { theme: "Back to Basics", focus: "memory", color: "#3498DB" },
    9: { theme: "Analytical September", focus: "logic", color: "#8E44AD" },
    10: { theme: "Autumn Awareness", focus: "focus", color: "#D35400" },
    11: { theme: "Gratitude & Recall", focus: "memory", color: "#C0392B" },
    12: { theme: "Year in Review", focus: "mixed", color: "#2C3E50" }
  },
  
  // Weekly patterns
  weeklyRotation: {
    sunday: "relaxed",      // Easier, fun games
    monday: "memory",       // Start week with memory
    tuesday: "logic",       // Build reasoning
    wednesday: "focus",     // Mid-week concentration
    thursday: "calculation",// Numerical challenge
    friday: "speed",        // End week with speed
    saturday: "language"    // Weekend wordplay
  }
};
```

#### 3.3.2 Special Days Calendar

```javascript
const SPECIAL_DAYS = [
  // Fixed holidays
  { month: 1, day: 1, name: "New Year Challenge", games: ["memory_palace"], difficulty: 0.5 },
  { month: 2, day: 14, name: "Valentine's Logic", games: ["heart_patterns"], difficulty: 0.7 },
  { month: 3, day: 14, name: "Pi Day Math Blitz", games: ["pi_calculation"], difficulty: 1.2 },
  { month: 7, day: 4, name: "Independence Speed", games: ["reflex_tap"], difficulty: 1.0 },
  { month: 10, day: 31, name: "Halloween Memory", games: ["spooky_patterns"], difficulty: 0.8 },
  { month: 12, day: 25, name: "Holiday Relaxation", games: ["easy_puzzles"], difficulty: 0.3 },
  
  // Awareness days
  { month: 6, day: 21, name: "World Brain Day", games: ["full_workout"], difficulty: 1.5 },
  { month: 10, day: 10, name: "World Mental Health", games: ["mindfulness_focus"], difficulty: 0.6 },
  
  // Recurring events
  { type: "first_monday", name: "Monthly Challenge", games: ["challenge_mode"], difficulty: 1.3 },
  { type: "last_friday", name: "Speedrun Friday", games: ["timed_gauntlet"], difficulty: 1.2 }
];
```

#### 3.3.3 Content Management System

```javascript
// Daily content resolver
class DailyContentResolver {
  resolve(date) {
    const monthTheme = CALENDAR_STRUCTURE.months[date.getMonth() + 1];
    const weekdayType = CALENDAR_STRUCTURE.weeklyRotation[DAYS[date.getDay()]];
    const specialDay = this.findSpecialDay(date);
    
    // Special days override normal rotation
    if (specialDay) {
      return {
        type: "special",
        ...specialDay,
        seed: getDailySeed(specialDay.name)
      };
    }
    
    // Normal day composition
    return {
      type: "standard",
      theme: monthTheme.theme,
      primaryFocus: monthTheme.focus,
      secondaryFocus: weekdayType,
      games: this.selectGames(monthTheme.focus, weekdayType),
      difficulty: DIFFICULTY_CURVE.calculate(5, date),
      seed: getDailySeed(date.toISOString().split('T')[0])
    };
  }
  
  selectGames(primary, secondary) {
    const primaryGames = GAMES_BY_CATEGORY[primary];
    const secondaryGames = GAMES_BY_CATEGORY[secondary];
    
    return {
      featured: this.randomSelect(primaryGames, 1),
      supporting: this.randomSelect(secondaryGames, 2),
      bonus: this.randomSelect(ALL_GAMES, 1)
    };
  }
}
```

---

### 3.4 Content Pipeline

```
CONTENT CREATION PIPELINE
========================

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DESIGN    │───▶│   BUILD     │───▶│   TEST      │───▶│   DEPLOY    │
│             │    │             │    │             │    │             │
│ • Mechanics │    │ • Implement │    │ • Playtest  │    │ • Calendar  │
│ • Rules     │    │ • Generator │    │ • Balance   │    │   integration│
│ • Variants  │    │ • Assets    │    │ • Edge cases│    │ • A/B test  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

AUTOMATED DAILY GENERATION
==========================

Midnight UTC
     │
     ▼
┌─────────────┐
│ Resolve     │──▶ Check special days
│ Today's     │──▶ Get monthly theme  
│ Config      │──▶ Apply difficulty curve
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Generate    │──▶ Create seed from date
│ Puzzles     │──▶ Run procedural generators
│             │──▶ Validate solvability
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Cache &     │──▶ Pre-generate for offline
│ Distribute  │──▶ Push to CDN
│             │──▶ Update service worker
└─────────────┘
```

---

## 4. PWA Feature Implementation

### 4.1 Offline Mode Support

#### 4.1.1 Service Worker Strategy

```javascript
// sw.js - Service Worker with advanced caching

const CACHE_VERSION = 'daily-brain-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const GAME_CACHE = `${CACHE_VERSION}-games`;

// Static assets - cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/fonts/inter.woff2',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Game assets by category
const GAME_ASSETS = {
  memory: ['/games/pattern-echo.js', '/games/card-flip.js'],
  logic: ['/games/grid-deduction.js', '/games/sequence.js'],
  focus: ['/games/stroop.js', '/games/tracker.js'],
  calculation: ['/games/math-sprint.js', '/games/estimation.js'],
  language: ['/games/word-morph.js', '/data/dictionary-compressed.json'],
  speed: ['/games/reflex-tap.js', '/games/speed-match.js']
};

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(GAME_CACHE).then(cache => 
        cache.addAll(Object.values(GAME_ASSETS).flat())
      )
    ])
  );
});

// Fetch strategy: Network-first for API, Cache-first for assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API calls - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }
  
  // Daily challenge - stale-while-revalidate
  if (url.pathname.includes('/daily/')) {
    event.respondWith(staleWhileRevalidate(request, GAME_CACHE));
    return;
  }
  
  // Static assets - cache first
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// Caching strategies
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(request);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });
  
  return cached || fetchPromise;
}
```

#### 4.1.2 Offline Game Pre-caching

```javascript
// Pre-cache next 7 days of puzzles
async function precacheDailyPuzzles() {
  const cache = await caches.open(GAME_CACHE);
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate and cache puzzle data
    const puzzleData = await generateDailyPuzzle(dateStr);
    const response = new Response(JSON.stringify(puzzleData), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(`/api/daily/${dateStr}`, response);
  }
}

// Background sync for offline plays
self.addEventListener('sync', event => {
  if (event.tag === 'sync-results') {
    event.waitUntil(syncOfflineResults());
  }
});

async function syncOfflineResults() {
  const offlineResults = await getOfflineResults();
  
  for (const result of offlineResults) {
    try {
      await fetch('/api/results', {
        method: 'POST',
        body: JSON.stringify(result)
      });
      await removeOfflineResult(result.id);
    } catch {
      // Will retry on next sync
    }
  }
}
```

---

### 4.2 Add to Home Screen (A2HS) Implementation

#### 4.2.1 Web App Manifest

```json
{
  "name": "Daily Brain - Train Your Mind",
  "short_name": "Daily Brain",
  "description": "A new brain training game every day",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#1a1a2e",
  "theme_color": "#4a90d9",
  "categories": ["games", "education", "health"],
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Daily Brain Home Screen"
    },
    {
      "src": "/screenshots/game.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Brain Training Game"
    }
  ],
  "shortcuts": [
    {
      "name": "Today's Challenge",
      "short_name": "Today",
      "description": "Play today's brain training game",
      "url": "/today?source=shortcut",
      "icons": [{ "src": "/icons/shortcut-today.png", "sizes": "96x96" }]
    },
    {
      "name": "Quick Workout",
      "short_name": "Workout",
      "description": "5-minute brain workout",
      "url": "/workout?source=shortcut",
      "icons": [{ "src": "/icons/shortcut-workout.png", "sizes": "96x96" }]
    }
  ],
  "share_target": {
    "action": "/share-target",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

#### 4.2.2 A2HS Prompt Strategy

```javascript
// A2HS Manager with behavioral triggers
class A2HSManager {
  constructor() {
    this.deferredPrompt = null;
    this.promptShown = false;
    this.installSource = null;
    
    this.TRIGGER_CONDITIONS = {
      minGamesPlayed: 3,
      minDaysVisited: 2,
      minStreakDays: 2,
      minSessionDuration: 120 // seconds
    };
  }
  
  init() {
    // Capture the install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.evaluateTriggers();
    });
    
    // Track successful installs
    window.addEventListener('appinstalled', () => {
      this.trackInstall();
      this.deferredPrompt = null;
    });
  }
  
  evaluateTriggers() {
    const stats = this.getUserStats();
    
    // Check all conditions
    const conditions = {
      gamesPlayed: stats.totalGamesPlayed >= this.TRIGGER_CONDITIONS.minGamesPlayed,
      daysVisited: stats.uniqueDaysVisited >= this.TRIGGER_CONDITIONS.minDaysVisited,
      hasStreak: stats.currentStreak >= this.TRIGGER_CONDITIONS.minStreakDays,
      engaged: stats.sessionDuration >= this.TRIGGER_CONDITIONS.minSessionDuration
    };
    
    // Trigger prompt at optimal moments
    if (conditions.gamesPlayed && conditions.engaged) {
      this.schedulePrompt('post_game');
    } else if (conditions.hasStreak) {
      this.schedulePrompt('streak_milestone');
    } else if (conditions.daysVisited) {
      this.schedulePrompt('return_visit');
    }
  }
  
  schedulePrompt(source) {
    if (this.promptShown || !this.deferredPrompt) return;
    
    this.installSource = source;
    
    const promptConfigs = {
      post_game: {
        delay: 2000,
        message: "🧠 Love Daily Brain? Add it to your home screen for quick access!",
        context: "result_screen"
      },
      streak_milestone: {
        delay: 1000,
        message: "🔥 You're on a streak! Install the app to never miss a day!",
        context: "streak_display"
      },
      return_visit: {
        delay: 5000,
        message: "📱 Welcome back! Install Daily Brain for the best experience.",
        context: "home_screen"
      }
    };
    
    const config = promptConfigs[source];
    setTimeout(() => this.showCustomPrompt(config), config.delay);
  }
  
  showCustomPrompt(config) {
    // Show custom UI prompt first (better UX than native prompt)
    const promptUI = document.createElement('div');
    promptUI.className = 'a2hs-prompt';
    promptUI.innerHTML = `
      <div class="a2hs-content">
        <img src="/icons/icon-96.png" alt="Daily Brain" class="a2hs-icon">
        <div class="a2hs-text">
          <h3>Install Daily Brain</h3>
          <p>${config.message}</p>
        </div>
      </div>
      <div class="a2hs-actions">
        <button class="a2hs-dismiss">Not Now</button>
        <button class="a2hs-install">Install</button>
      </div>
    `;
    
    document.body.appendChild(promptUI);
    
    promptUI.querySelector('.a2hs-install').addEventListener('click', () => {
      this.triggerNativePrompt();
      promptUI.remove();
    });
    
    promptUI.querySelector('.a2hs-dismiss').addEventListener('click', () => {
      this.trackDismiss();
      promptUI.remove();
    });
    
    this.promptShown = true;
  }
  
  async triggerNativePrompt() {
    if (!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    this.trackPromptOutcome(outcome);
    this.deferredPrompt = null;
  }
  
  trackInstall() {
    analytics.track('pwa_installed', {
      source: this.installSource,
      gamesPlayed: this.getUserStats().totalGamesPlayed
    });
  }
}
```

---

### 4.3 Web Push Notifications

#### 4.3.1 Push Notification Service

```javascript
// Push notification manager
class PushManager {
  constructor() {
    this.vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY';
    this.notificationTypes = {
      DAILY_REMINDER: 'daily_reminder',
      STREAK_WARNING: 'streak_warning',
      NEW_GAME: 'new_game',
      ACHIEVEMENT: 'achievement',
      WEEKLY_SUMMARY: 'weekly_summary'
    };
  }
  
  async init() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return { supported: false };
    }
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return {
      supported: true,
      subscribed: !!subscription,
      permission: Notification.permission
    };
  }
  
  async requestPermission() {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      await this.subscribe();
      return true;
    }
    
    return false;
  }
  
  async subscribe() {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
    });
    
    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        preferences: this.getDefaultPreferences()
      })
    });
  }
  
  getDefaultPreferences() {
    return {
      [this.notificationTypes.DAILY_REMINDER]: {
        enabled: true,
        time: '09:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      [this.notificationTypes.STREAK_WARNING]: {
        enabled: true,
        hoursBeforeMidnight: 3
      },
      [this.notificationTypes.NEW_GAME]: {
        enabled: false
      },
      [this.notificationTypes.ACHIEVEMENT]: {
        enabled: true
      },
      [this.notificationTypes.WEEKLY_SUMMARY]: {
        enabled: true,
        dayOfWeek: 0, // Sunday
        time: '10:00'
      }
    };
  }
  
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }
}

// Service Worker push handler
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  
  const notificationOptions = {
    daily_reminder: {
      title: "🧠 Today's Brain Challenge Awaits!",
      body: data.gameTitle || "A new puzzle is ready for you",
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'daily-reminder',
      data: { url: '/today' },
      actions: [
        { action: 'play', title: 'Play Now' },
        { action: 'later', title: 'Later' }
      ]
    },
    streak_warning: {
      title: `🔥 Don't Lose Your ${data.streakDays}-Day Streak!`,
      body: "Only a few hours left to play today's challenge",
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'streak-warning',
      data: { url: '/today' },
      requireInteraction: true,
      actions: [
        { action: 'play', title: 'Play Now' }
      ]
    },
    achievement: {
      title: '🏆 Achievement Unlocked!',
      body: data.achievementName,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'achievement',
      data: { url: '/profile/achievements' }
    },
    weekly_summary: {
      title: '📊 Your Weekly Brain Report',
      body: `You played ${data.gamesPlayed} games and improved ${data.improvement}%`,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'weekly-summary',
      data: { url: '/profile/stats' }
    }
  };
  
  const options = notificationOptions[data.type] || notificationOptions.daily_reminder;
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Focus existing window if available
      for (const client of windowClients) {
        if (client.url.includes(self.registration.scope)) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
```

#### 4.3.2 Smart Notification Timing

```javascript
// Server-side notification scheduler
class NotificationScheduler {
  async scheduleDailyReminders() {
    const users = await db.users.find({
      'pushPreferences.daily_reminder.enabled': true,
      'pushSubscription': { $exists: true }
    });
    
    for (const user of users) {
      const { time, timezone } = user.pushPreferences.daily_reminder;
      const scheduledTime = this.getNextOccurrence(time, timezone);
      
      // Skip if user already played today
      if (user.lastPlayDate === new Date().toISOString().split('T')[0]) {
        continue;
      }
      
      await this.scheduleNotification({
        userId: user._id,
        type: 'daily_reminder',
        scheduledTime,
        data: {
          gameTitle: await this.getTodaysGameTitle()
        }
      });
    }
  }
  
  async scheduleStreakWarnings() {
    const users = await db.users.find({
      'pushPreferences.streak_warning.enabled': true,
      'currentStreak': { $gt: 0 },
      'lastPlayDate': { $ne: new Date().toISOString().split('T')[0] }
    });
    
    for (const user of users) {
      const { hoursBeforeMidnight } = user.pushPreferences.streak_warning;
      const userMidnight = this.getMidnightInTimezone(user.timezone);
      const warningTime = new Date(userMidnight - hoursBeforeMidnight * 3600000);
      
      if (warningTime > new Date()) {
        await this.scheduleNotification({
          userId: user._id,
          type: 'streak_warning',
          scheduledTime: warningTime,
          data: {
            streakDays: user.currentStreak
          }
        });
      }
    }
  }
}
```

---

## 5. UX Flow Design

### 5.1 User Journey Overview

```
USER JOURNEY: First Visit to Daily Habit
========================================

┌─────────────────────────────────────────────────────────────────────────┐
│                           LANDING                                       │
│                         (0-3 seconds)                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  "Today's Challenge: Pattern Echo"          🧠 Daily Brain      │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────┐                       │   │
│  │  │                                      │                       │   │
│  │  │         [GAME PREVIEW]               │                       │   │
│  │  │         Animated teaser              │                       │   │
│  │  │                                      │                       │   │
│  │  └──────────────────────────────────────┘                       │   │
│  │                                                                  │   │
│  │              [ ▶ PLAY NOW ]                                     │   │
│  │                                                                  │   │
│  │  🎯 Memory • ⏱️ ~3 min • 🌟 Easy                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TUTORIAL                                        │
│                       (15-30 seconds)                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │   Step 1 of 3                                                   │   │
│  │   ─────────────────                                             │   │
│  │                                                                  │   │
│  │   Watch the sequence light up,                                  │   │
│  │   then tap the tiles in the same order.                         │   │
│  │                                                                  │   │
│  │   ┌─────┐ ┌─────┐ ┌─────┐                                       │   │
│  │   │  1  │ │  2  │ │  3  │  ← Interactive demo                   │   │
│  │   └─────┘ └─────┘ └─────┘                                       │   │
│  │                                                                  │   │
│  │              [ Try It ] [ Skip Tutorial ]                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           PLAY                                          │
│                        (2-5 minutes)                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Level 3 of 8                              ❤️ ❤️ ❤️             │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │                                                                  │   │
│  │              ┌───────────────────────┐                          │   │
│  │              │                       │                          │   │
│  │              │    ┌───┐ ┌───┐ ┌───┐  │                          │   │
│  │              │    │   │ │ ● │ │   │  │                          │   │
│  │              │    └───┘ └───┘ └───┘  │                          │   │
│  │              │    ┌───┐ ┌───┐ ┌───┐  │                          │   │
│  │              │    │   │ │   │ │   │  │                          │   │
│  │              │    └───┘ └───┘ └───┘  │                          │   │
│  │              │                       │                          │   │
│  │              └───────────────────────┘                          │   │
│  │                                                                  │   │
│  │  Sequence: 3/5 • Score: 240                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          RESULTS                                        │
│                        (30 seconds)                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │                    🎉 Challenge Complete!                       │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                                                         │    │   │
│  │  │   Score: 1,240        ⭐⭐⭐☆☆                          │    │   │
│  │  │   Rank: Top 34%       Better than 2.1M players          │    │   │
│  │  │                                                         │    │   │
│  │  │   Memory +12%   ████████░░  (Your best this week!)      │    │   │
│  │  │                                                         │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  🔥 Day 1 Streak Started!                                       │   │
│  │                                                                  │   │
│  │  [ Share Results ]  [ View Stats ]  [ Tomorrow's Preview → ]    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      TOMORROW'S PREVIEW                                 │
│                        (10 seconds)                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │   Coming Tomorrow...                                            │   │
│  │   ─────────────────                                             │   │
│  │                                                                  │   │
│  │   🧩 Grid Deduction                                             │   │
│  │   Logic Challenge • Medium Difficulty                           │   │
│  │                                                                  │   │
│  │   ┌──────────────────────────────┐                              │   │
│  │   │    [Blurred preview image]   │                              │   │
│  │   │    with "?" overlay          │                              │   │
│  │   └──────────────────────────────┘                              │   │
│  │                                                                  │   │
│  │   🔔 Remind me at: [9:00 AM ▼]                                  │   │
│  │                                                                  │   │
│  │   [ Set Reminder ]  [ Done for Today ]                          │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Detailed Screen Specifications

#### 5.2.1 Landing Screen

```javascript
// Landing screen component logic
const LandingScreen = {
  // Load time target: < 1 second
  async init() {
    // Priority 1: Show today's game immediately
    const todayGame = await this.loadTodayGame();
    this.renderGameCard(todayGame);
    
    // Priority 2: Check user state (async)
    const userState = await this.getUserState();
    this.updateForUser(userState);
    
    // Priority 3: Preload game assets
    this.preloadGame(todayGame.id);
  },
  
  renderGameCard(game) {
    return {
      title: game.title,
      category: getCategoryEmoji(game.category),
      duration: formatDuration(game.avgDuration),
      difficulty: getDifficultyStars(game.difficulty),
      preview: game.previewAnimation,
      cta: this.getCTAText()
    };
  },
  
  getCTAText() {
    const hasPlayed = localStorage.getItem(`played_${today()}`);
    if (hasPlayed) return "View Results";
    
    const streak = this.getStreak();
    if (streak > 0) return `Play Now (🔥 ${streak} day streak)`;
    
    return "Play Now";
  }
};
```

#### 5.2.2 Tutorial System

```javascript
// Progressive tutorial system
const TutorialManager = {
  tutorials: {
    'pattern-echo': {
      steps: [
        {
          type: 'instruction',
          text: 'Watch the sequence light up',
          highlight: 'grid',
          duration: 2000
        },
        {
          type: 'demo',
          action: 'play_sequence',
          sequence: [0, 4, 8], // Demo sequence
          speed: 'slow'
        },
        {
          type: 'instruction',
          text: 'Now tap the tiles in the same order',
          highlight: 'grid',
          interactive: true
        },
        {
          type: 'practice',
          sequence: [0, 4, 8],
          allowRetry: true,
          successMessage: "Perfect! You've got it!"
        }
      ],
      skipAfterPlays: 1 // Auto-skip after first play
    }
  },
  
  shouldShowTutorial(gameId) {
    const playCount = this.getPlayCount(gameId);
    const tutorial = this.tutorials[gameId];
    
    if (!tutorial) return false;
    if (playCount >= tutorial.skipAfterPlays) return false;
    if (localStorage.getItem(`skip_tutorial_${gameId}`)) return false;
    
    return true;
  },
  
  async runTutorial(gameId) {
    const tutorial = this.tutorials[gameId];
    
    for (const step of tutorial.steps) {
      await this.executeStep(step);
    }
    
    this.markTutorialComplete(gameId);
  }
};
```

#### 5.2.3 Game Session Flow

```javascript
// Game session state machine
const GameSession = {
  states: {
    LOADING: 'loading',
    READY: 'ready',
    PLAYING: 'playing',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    REVIEWING: 'reviewing'
  },
  
  async start(gameId, dailySeed) {
    this.setState(this.states.LOADING);
    
    // Load game module
    const GameModule = await import(`./games/${gameId}.js`);
    this.game = new GameModule.default();
    
    // Initialize with daily seed
    await this.game.init({
      seed: dailySeed,
      difficulty: this.getDailyDifficulty(),
      onComplete: this.handleComplete.bind(this),
      onProgress: this.handleProgress.bind(this)
    });
    
    this.setState(this.states.READY);
    this.startTime = Date.now();
    this.setState(this.states.PLAYING);
  },
  
  handleProgress(data) {
    // Update UI elements
    this.updateScore(data.score);
    this.updateLevel(data.level, data.maxLevel);
    this.updateLives(data.lives);
    
    // Track for analytics
    this.progressHistory.push({
      timestamp: Date.now() - this.startTime,
      ...data
    });
  },
  
  async handleComplete(result) {
    this.setState(this.states.COMPLETED);
    this.endTime = Date.now();
    
    const sessionData = {
      gameId: this.gameId,
      date: today(),
      score: result.score,
      duration: this.endTime - this.startTime,
      accuracy: result.accuracy,
      levels: result.levelsCompleted,
      progressHistory: this.progressHistory
    };
    
    // Save locally first (offline support)
    await this.saveLocally(sessionData);
    
    // Sync to server
    await this.syncToServer(sessionData);
    
    // Navigate to results
    this.showResults(sessionData);
  }
};
```

#### 5.2.4 Results Screen

```javascript
// Results screen with cognitive insights
const ResultsScreen = {
  async render(sessionData) {
    const analysis = await this.analyzePerformance(sessionData);
    
    return {
      // Primary stats
      score: this.formatScore(sessionData.score),
      stars: this.calculateStars(sessionData),
      rank: await this.fetchRank(sessionData),
      
      // Cognitive insights
      insights: {
        primary: {
          category: sessionData.category,
          change: analysis.categoryChange,
          percentile: analysis.categoryPercentile
        },
        comparison: {
          vsYesterday: analysis.vsYesterday,
          vsWeekAvg: analysis.vsWeekAvg,
          vsPersonalBest: analysis.vsPersonalBest
        }
      },
      
      // Streak info
      streak: {
        current: analysis.currentStreak,
        isNewRecord: analysis.currentStreak > analysis.longestStreak,
        message: this.getStreakMessage(analysis)
      },
      
      // Achievements earned
      achievements: analysis.newAchievements,
      
      // Share card
      shareCard: this.generateShareCard(sessionData, analysis),
      
      // Tomorrow preview
      tomorrow: await this.getTomorrowPreview()
    };
  },
  
  generateShareCard(session, analysis) {
    // Wordle-style shareable result
    const emojis = {
      perfect: '🟩',
      good: '🟨',
      miss: '⬜',
      streak: '🔥'
    };
    
    const grid = session.progressHistory.map(level => {
      if (level.accuracy === 1) return emojis.perfect;
      if (level.accuracy >= 0.5) return emojis.good;
      return emojis.miss;
    }).join('');
    
    return `
Daily Brain ${formatDate(session.date)}
${session.gameName}

${grid}

Score: ${session.score}
${emojis.streak} ${analysis.currentStreak} day streak

Play at dailybrain.app
    `.trim();
  }
};
```

---

### 5.3 Navigation & Information Architecture

```
SITE MAP
========

┌─────────────────────────────────────────────────────────────────┐
│                         HOME (/)                                │
│                                                                 │
│  ├── Today's Challenge (/today)                                │
│  │   ├── Tutorial (modal)                                      │
│  │   ├── Game Play                                             │
│  │   └── Results                                               │
│  │                                                             │
│  ├── Quick Workout (/workout)                                  │
│  │   ├── 5-minute session (3 games)                            │
│  │   └── Workout Results                                       │
│  │                                                             │
│  ├── Game Library (/games)                                     │
│  │   ├── By Category                                           │
│  │   └── Individual Game (/games/:id)                          │
│  │                                                             │
│  ├── Profile (/profile)                                        │
│  │   ├── Brain Stats (/profile/stats)                          │
│  │   ├── Achievements (/profile/achievements)                  │
│  │   ├── History (/profile/history)                            │
│  │   └── Settings (/profile/settings)                          │
│  │       ├── Notifications                                     │
│  │       ├── Difficulty                                        │
│  │       └── Account                                           │
│  │                                                             │
│  └── Leaderboard (/leaderboard)                                │
│      ├── Daily                                                 │
│      ├── Weekly                                                │
│      └── All-time                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Gamification System Design

### 6.1 Streak System

#### 6.1.1 Core Mechanics

```javascript
// Streak management system
const StreakSystem = {
  // Streak rules
  rules: {
    // Play any daily challenge to maintain streak
    streakAction: 'complete_daily_challenge',
    
    // Streak resets at midnight user's local time
    resetTime: 'midnight_local',
    
    // Grace period: 2 hours after midnight for late players
    gracePeriodHours: 2,
    
    // Freeze: Premium users can freeze once per week
    freezesPerWeek: 1, // 0 for free users
    
    // Recovery: Complete 2 challenges to restart streak at day 2
    recoveryEnabled: true,
    recoveryDays: 2
  },
  
  async checkStreak(userId) {
    const user = await this.getUser(userId);
    const now = new Date();
    const userMidnight = this.getMidnight(user.timezone);
    
    // Check if in grace period
    const graceEnd = new Date(userMidnight.getTime() + this.rules.gracePeriodHours * 3600000);
    const inGracePeriod = now < graceEnd;
    
    // Calculate days since last play
    const lastPlay = new Date(user.lastPlayDate);
    const daysSincePlay = this.daysBetween(lastPlay, userMidnight);
    
    if (daysSincePlay === 0) {
      // Played today
      return { status: 'active', streak: user.currentStreak };
    } else if (daysSincePlay === 1 || (daysSincePlay === 2 && inGracePeriod)) {
      // Can continue streak
      return { status: 'continue', streak: user.currentStreak };
    } else if (user.streakFreezeAvailable) {
      // Offer freeze
      return { status: 'freeze_available', streak: user.currentStreak };
    } else {
      // Streak broken
      return { status: 'broken', previousStreak: user.currentStreak, newStreak: 0 };
    }
  },
  
  async updateStreak(userId, action) {
    const user = await this.getUser(userId);
    const streakStatus = await this.checkStreak(userId);
    
    let newStreak = user.currentStreak;
    let achievements = [];
    
    if (streakStatus.status === 'continue') {
      newStreak = user.currentStreak + 1;
      achievements = this.checkStreakMilestones(newStreak);
    } else if (streakStatus.status === 'broken') {
      newStreak = 1;
    }
    
    // Update records
    if (newStreak > user.longestStreak) {
      await this.updateLongestStreak(userId, newStreak);
      achievements.push({ type: 'new_record', value: newStreak });
    }
    
    await this.updateUser(userId, {
      currentStreak: newStreak,
      lastPlayDate: today()
    });
    
    return { newStreak, achievements };
  },
  
  checkStreakMilestones(streak) {
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    const achievements = [];
    
    if (milestones.includes(streak)) {
      achievements.push({
        type: 'streak_milestone',
        value: streak,
        badge: this.getStreakBadge(streak)
      });
    }
    
    return achievements;
  }
};
```

#### 6.1.2 Streak UI Components

```javascript
// Streak visualization
const StreakDisplay = {
  render(streakData) {
    return {
      // Main streak counter
      counter: {
        value: streakData.current,
        animation: streakData.justIncremented ? 'increment' : 'idle',
        flame: this.getFlameSize(streakData.current)
      },
      
      // Week view (7-day calendar)
      weekView: this.generateWeekView(streakData.history),
      
      // Progress to next milestone
      milestone: {
        next: this.getNextMilestone(streakData.current),
        progress: this.getMilestoneProgress(streakData.current),
        reward: this.getMilestoneReward(this.getNextMilestone(streakData.current))
      },
      
      // Streak protection status
      protection: {
        freezesAvailable: streakData.freezes,
        freezeRechargeDate: streakData.nextFreezeDate
      }
    };
  },
  
  generateWeekView(history) {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      days.push({
        date: dateStr,
        dayName: DAYS_SHORT[date.getDay()],
        played: history.includes(dateStr),
        isToday: i === 0,
        isFuture: false
      });
    }
    
    return days;
  },
  
  getFlameSize(streak) {
    if (streak >= 365) return 'inferno';
    if (streak >= 90) return 'large';
    if (streak >= 30) return 'medium';
    if (streak >= 7) return 'small';
    return 'spark';
  }
};
```

---

### 6.2 Brain Stats & Progress Graphs

#### 6.2.1 Cognitive Metrics System

```javascript
// Brain stats calculation engine
const BrainStats = {
  // Categories and their weights
  categories: {
    memory: { weight: 1.0, games: ['pattern-echo', 'card-flip', 'memory-palace'] },
    logic: { weight: 1.0, games: ['grid-deduction', 'sequence', 'balance-scale'] },
    focus: { weight: 1.0, games: ['stroop', 'target-tracker', 'rapid-sort'] },
    calculation: { weight: 1.0, games: ['math-sprint', 'estimation', 'number-chain'] },
    language: { weight: 1.0, games: ['word-morph', 'anagram-blitz', 'context-clues'] },
    speed: { weight: 0.8, games: ['reflex-tap', 'speed-match', 'quick-draw'] }
  },
  
  // Calculate overall brain score (0-1000)
  async calculateBrainScore(userId) {
    const recentGames = await this.getRecentGames(userId, 30); // Last 30 days
    
    const categoryScores = {};
    
    for (const [category, config] of Object.entries(this.categories)) {
      const categoryGames = recentGames.filter(g => config.games.includes(g.gameId));
      
      if (categoryGames.length === 0) {
        categoryScores[category] = null; // Not enough data
        continue;
      }
      
      // Calculate weighted average with recency bias
      const scores = categoryGames.map((game, index) => ({
        score: this.normalizeGameScore(game),
        weight: Math.pow(0.95, index) // More recent = higher weight
      }));
      
      const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
      categoryScores[category] = scores.reduce((sum, s) => 
        sum + (s.score * s.weight), 0) / totalWeight;
    }
    
    // Calculate overall score
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [category, score] of Object.entries(categoryScores)) {
      if (score !== null) {
        totalScore += score * this.categories[category].weight;
        totalWeight += this.categories[category].weight;
      }
    }
    
    return {
      overall: Math.round((totalScore / totalWeight) * 1000),
      categories: categoryScores,
      gamesPlayed: recentGames.length,
      lastUpdated: new Date().toISOString()
    };
  },
  
  // Normalize game scores to 0-1 scale
  normalizeGameScore(gameResult) {
    // Each game has its own normalization based on historical data
    const gameNormalizers = {
      'pattern-echo': (score) => Math.min(score / 2000, 1),
      'grid-deduction': (score) => Math.min(score / 1500, 1),
      'stroop': (score) => Math.min(score / 3000, 1),
      // ... etc
    };
    
    const normalizer = gameNormalizers[gameResult.gameId] || ((s) => s / 1000);
    return normalizer(gameResult.score);
  },
  
  // Calculate change over time
  async calculateTrend(userId, category, days = 7) {
    const recent = await this.getCategoryScores(userId, category, days);
    const previous = await this.getCategoryScores(userId, category, days, days);
    
    if (recent.length < 3 || previous.length < 3) {
      return { trend: 'insufficient_data' };
    }
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
      changePercent: Math.round(change),
      recentAvg: Math.round(recentAvg * 100),
      previousAvg: Math.round(previousAvg * 100)
    };
  }
};
```

#### 6.2.2 Progress Visualization

```javascript
// Chart configurations for brain stats
const BrainStatsCharts = {
  // Radar chart for category overview
  radarChart: {
    type: 'radar',
    options: {
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20 }
        }
      }
    },
    getData(categoryScores) {
      return {
        labels: ['Memory', 'Logic', 'Focus', 'Calculation', 'Language', 'Speed'],
        datasets: [{
          label: 'Your Brain',
          data: Object.values(categoryScores).map(s => s ? Math.round(s * 100) : 0),
          backgroundColor: 'rgba(74, 144, 217, 0.2)',
          borderColor: 'rgba(74, 144, 217, 1)',
          borderWidth: 2
        }]
      };
    }
  },
  
  // Line chart for progress over time
  progressChart: {
    type: 'line',
    options: {
      responsive: true,
      scales: {
        y: { min: 0, max: 1000 }
      }
    },
    async getData(userId, days = 30) {
      const history = await BrainStats.getScoreHistory(userId, days);
      
      return {
        labels: history.map(h => formatDate(h.date, 'short')),
        datasets: [{
          label: 'Brain Score',
          data: history.map(h => h.score),
          borderColor: '#4A90D9',
          tension: 0.3,
          fill: true,
          backgroundColor: 'rgba(74, 144, 217, 0.1)'
        }]
      };
    }
  },
  
  // Small sparkline for individual category
  sparkline: {
    type: 'line',
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } },
      elements: { point: { radius: 0 } }
    }
  }
};
```

---

### 6.3 Tier & Badge System

#### 6.3.1 Tier Progression

```javascript
// Tier system with seasonal resets
const TierSystem = {
  tiers: [
    { id: 'bronze', name: 'Bronze Brain', minScore: 0, icon: '🥉', color: '#CD7F32' },
    { id: 'silver', name: 'Silver Synapse', minScore: 200, icon: '🥈', color: '#C0C0C0' },
    { id: 'gold', name: 'Gold Cortex', minScore: 400, icon: '🥇', color: '#FFD700' },
    { id: 'platinum', name: 'Platinum Mind', minScore: 600, icon: '💎', color: '#E5E4E2' },
    { id: 'diamond', name: 'Diamond Genius', minScore: 800, icon: '💠', color: '#B9F2FF' },
    { id: 'master', name: 'Master Brain', minScore: 950, icon: '🧠', color: '#9B59B6' }
  ],
  
  // Seasonal reset schedule
  seasons: {
    duration: 'quarterly', // Resets every 3 months
    rewards: {
      bronze: { coins: 100 },
      silver: { coins: 250, badge: 'silver_season' },
      gold: { coins: 500, badge: 'gold_season' },
      platinum: { coins: 1000, badge: 'platinum_season', frame: 'platinum_frame' },
      diamond: { coins: 2000, badge: 'diamond_season', frame: 'diamond_frame' },
      master: { coins: 5000, badge: 'master_season', frame: 'master_frame', title: 'Grand Master' }
    }
  },
  
  calculateTier(brainScore) {
    // Find highest tier user qualifies for
    const tier = [...this.tiers].reverse().find(t => brainScore >= t.minScore);
    const nextTier = this.tiers.find(t => brainScore < t.minScore);
    
    return {
      current: tier,
      next: nextTier,
      progress: nextTier ? 
        ((brainScore - tier.minScore) / (nextTier.minScore - tier.minScore)) * 100 : 100,
      pointsToNext: nextTier ? nextTier.minScore - brainScore : 0
    };
  },
  
  async handleSeasonEnd(userId) {
    const user = await this.getUser(userId);
    const finalTier = this.calculateTier(user.brainScore);
    const rewards = this.seasons.rewards[finalTier.current.id];
    
    // Award seasonal rewards
    await this.awardRewards(userId, rewards);
    
    // Reset score (soft reset - keeps 50% of progress)
    const newScore = Math.floor(user.brainScore * 0.5);
    await this.updateUser(userId, { brainScore: newScore });
    
    return {
      finalTier: finalTier.current,
      rewards,
      newScore
    };
  }
};
```

#### 6.3.2 Badge Collection System

```javascript
// Comprehensive badge system
const BadgeSystem = {
  categories: {
    streak: {
      name: 'Consistency',
      badges: [
        { id: 'streak_7', name: 'Week Warrior', desc: '7-day streak', icon: '🔥', rarity: 'common' },
        { id: 'streak_30', name: 'Monthly Master', desc: '30-day streak', icon: '🔥', rarity: 'uncommon' },
        { id: 'streak_100', name: 'Century Mind', desc: '100-day streak', icon: '🔥', rarity: 'rare' },
        { id: 'streak_365', name: 'Year of Genius', desc: '365-day streak', icon: '👑', rarity: 'legendary' }
      ]
    },
    mastery: {
      name: 'Skill Mastery',
      badges: [
        { id: 'memory_master', name: 'Memory Master', desc: 'Max memory score', icon: '🧠', rarity: 'rare' },
        { id: 'logic_lord', name: 'Logic Lord', desc: 'Max logic score', icon: '🎯', rarity: 'rare' },
        { id: 'focus_fury', name: 'Focus Fury', desc: 'Max focus score', icon: '👁️', rarity: 'rare' },
        { id: 'calc_king', name: 'Calculation King', desc: 'Max calc score', icon: '🔢', rarity: 'rare' },
        { id: 'word_wizard', name: 'Word Wizard', desc: 'Max language score', icon: '📚', rarity: 'rare' },
        { id: 'speed_demon', name: 'Speed Demon', desc: 'Max speed score', icon: '⚡', rarity: 'rare' }
      ]
    },
    special: {
      name: 'Special Events',
      badges: [
        { id: 'early_bird', name: 'Early Bird', desc: 'Play before 6 AM', icon: '🌅', rarity: 'uncommon' },
        { id: 'night_owl', name: 'Night Owl', desc: 'Play after midnight', icon: '🦉', rarity: 'uncommon' },
        { id: 'perfect_week', name: 'Perfect Week', desc: '7 perfect scores in a row', icon: '⭐', rarity: 'epic' },
        { id: 'pi_day', name: 'Pi Day Player', desc: 'Play on March 14', icon: '🥧', rarity: 'uncommon' },
        { id: 'founding_brain', name: 'Founding Brain', desc: 'Joined in year 1', icon: '🏛️', rarity: 'legendary' }
      ]
    },
    social: {
      name: 'Community',
      badges: [
        { id: 'first_share', name: 'Socializer', desc: 'Share first result', icon: '📤', rarity: 'common' },
        { id: 'viral', name: 'Viral Mind', desc: '100 people from your share', icon: '🚀', rarity: 'epic' },
        { id: 'referrer', name: 'Brain Recruiter', desc: 'Refer 10 friends', icon: '👥', rarity: 'rare' }
      ]
    }
  },
  
  rarityColors: {
    common: '#9E9E9E',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800'
  },
  
  async checkBadgeProgress(userId, event) {
    const user = await this.getUser(userId);
    const earnedBadges = [];
    
    // Check all badges that might be affected by this event
    const relevantBadges = this.getRelevantBadges(event.type);
    
    for (const badge of relevantBadges) {
      if (user.badges.includes(badge.id)) continue; // Already earned
      
      const progress = await this.calculateProgress(userId, badge);
      
      if (progress.complete) {
        await this.awardBadge(userId, badge);
        earnedBadges.push(badge);
      }
    }
    
    return earnedBadges;
  },
  
  async getBadgeProgress(userId) {
    const user = await this.getUser(userId);
    const allBadges = Object.values(this.categories).flatMap(c => c.badges);
    
    return allBadges.map(badge => ({
      ...badge,
      earned: user.badges.includes(badge.id),
      earnedDate: user.badgeDates?.[badge.id],
      progress: user.badges.includes(badge.id) ? 100 : 
        this.calculateProgress(userId, badge).percentage
    }));
  }
};
```

---

### 6.4 Additional Gamification Elements

```javascript
// Daily rewards calendar
const DailyRewards = {
  calendar: [
    { day: 1, reward: { type: 'coins', amount: 50 } },
    { day: 2, reward: { type: 'coins', amount: 75 } },
    { day: 3, reward: { type: 'coins', amount: 100 } },
    { day: 4, reward: { type: 'coins', amount: 125 } },
    { day: 5, reward: { type: 'coins', amount: 150 } },
    { day: 6, reward: { type: 'coins', amount: 200 } },
    { day: 7, reward: { type: 'special', item: 'streak_freeze' } } // Weekly bonus
  ]
};

// Challenges system
const ChallengeSystem = {
  types: {
    daily: [
      { id: 'play_3', desc: 'Play 3 games', reward: 100 },
      { id: 'perfect_game', desc: 'Get a perfect score', reward: 200 },
      { id: 'beat_average', desc: 'Beat your average', reward: 150 }
    ],
    weekly: [
      { id: 'complete_5_days', desc: 'Play 5 different days', reward: 500 },
      { id: 'all_categories', desc: 'Play all 6 categories', reward: 750 },
      { id: 'improve_5', desc: 'Improve brain score by 5%', reward: 1000 }
    ]
  }
};

// Leaderboard system
const LeaderboardSystem = {
  boards: {
    daily: { reset: 'midnight', scope: 'today_only' },
    weekly: { reset: 'monday', scope: 'current_week' },
    allTime: { reset: 'never', scope: 'all_history' },
    friends: { reset: 'weekly', scope: 'friends_only' }
  },
  
  async getRank(userId, board = 'daily') {
    // Efficient rank calculation using Redis sorted sets
    const score = await this.getUserScore(userId, board);
    const rank = await redis.zrevrank(`leaderboard:${board}`, userId);
    const total = await redis.zcard(`leaderboard:${board}`);
    
    return {
      rank: rank + 1,
      total,
      percentile: Math.round((1 - rank / total) * 100),
      score
    };
  }
};
```

---

## 7. Technology Stack Recommendation

### 7.1 Stack Overview

```
RECOMMENDED TECHNOLOGY STACK
============================

┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Framework:        React 18 + Vite                                    │
│   State:            Zustand (lightweight) + React Query (server state) │
│   Routing:          React Router v6                                    │
│   Styling:          Tailwind CSS + CSS Modules for games               │
│   Animation:        Framer Motion + CSS animations                     │
│   Games:            Phaser 3.70+ (canvas games) + React (DOM games)    │
│   Charts:           Recharts / D3.js                                   │
│   PWA:              Workbox 7+ (Service Worker toolkit)                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                            BACKEND                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Runtime:          Node.js 20 LTS + Fastify                           │
│   API:              REST + tRPC (type-safe endpoints)                  │
│   Database:         PostgreSQL (primary) + Redis (cache/realtime)      │
│   ORM:              Prisma                                             │
│   Auth:             Auth.js (NextAuth) or Supabase Auth                │
│   Push:             Web Push Protocol + Firebase Cloud Messaging       │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                         INFRASTRUCTURE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Hosting:          Vercel (frontend) + Railway/Render (backend)       │
│   CDN:              Cloudflare                                         │
│   Storage:          Cloudflare R2 / AWS S3                             │
│   Analytics:        Plausible / PostHog                                │
│   Monitoring:       Sentry                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Frontend Architecture

#### 7.2.1 Project Structure

```
src/
├── app/
│   ├── routes/
│   │   ├── index.tsx           # Landing/Today's game
│   │   ├── today.tsx           # Daily challenge
│   │   ├── workout.tsx         # Quick workout
│   │   ├── games/
│   │   │   ├── index.tsx       # Game library
│   │   │   └── [gameId].tsx    # Individual game
│   │   └── profile/
│   │       ├── index.tsx       # Profile overview
│   │       ├── stats.tsx       # Brain stats
│   │       └── achievements.tsx
│   ├── layouts/
│   │   ├── MainLayout.tsx
│   │   └── GameLayout.tsx
│   └── App.tsx
│
├── games/
│   ├── core/
│   │   ├── GameEngine.ts       # Base game class
│   │   ├── SeededRNG.ts        # Deterministic random
│   │   └── GameLoader.ts       # Dynamic import manager
│   ├── memory/
│   │   ├── PatternEcho/
│   │   │   ├── PatternEcho.tsx
│   │   │   ├── PatternEcho.game.ts  # Phaser scene
│   │   │   └── generator.ts
│   │   └── CardFlip/
│   ├── logic/
│   ├── focus/
│   ├── calculation/
│   ├── language/
│   └── speed/
│
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── game/                   # Game-specific components
│   ├── charts/                 # Data visualization
│   └── gamification/           # Badges, streaks, etc.
│
├── stores/
│   ├── userStore.ts            # User state
│   ├── gameStore.ts            # Active game state
│   └── settingsStore.ts
│
├── services/
│   ├── api.ts                  # API client
│   ├── push.ts                 # Push notifications
│   ├── offline.ts              # Offline data management
│   └── analytics.ts
│
├── hooks/
│   ├── useGame.ts
│   ├── useStreak.ts
│   ├── useBrainStats.ts
│   └── usePWA.ts
│
├── utils/
│   ├── dateUtils.ts
│   ├── scoreUtils.ts
│   └── shareUtils.ts
│
├── sw/
│   ├── sw.ts                   # Main service worker
│   └── strategies.ts           # Caching strategies
│
└── styles/
    ├── globals.css
    └── games/                  # Game-specific styles
```

#### 7.2.2 Game Engine Architecture

```javascript
// Base game engine (supports both React and Phaser games)
abstract class GameEngine {
  protected seed: number;
  protected rng: SeededRNG;
  protected difficulty: number;
  protected state: GameState;
  
  constructor(config: GameConfig) {
    this.seed = config.seed;
    this.rng = new SeededRNG(config.seed);
    this.difficulty = config.difficulty;
    this.state = {
      status: 'ready',
      score: 0,
      level: 1,
      lives: 3,
      startTime: null,
      endTime: null
    };
  }
  
  // Abstract methods - implement per game
  abstract generate(): GameLevel;
  abstract render(): void;
  abstract handleInput(input: GameInput): void;
  abstract calculateScore(): number;
  
  // Shared methods
  start() {
    this.state.status = 'playing';
    this.state.startTime = Date.now();
    this.onStart?.();
  }
  
  complete(result: 'win' | 'lose') {
    this.state.status = 'completed';
    this.state.endTime = Date.now();
    this.onComplete?.({
      ...this.state,
      result,
      duration: this.state.endTime - this.state.startTime
    });
  }
}

// React-based game example (DOM manipulation)
class CardFlipGame extends GameEngine {
  generate() {
    const pairCount = 4 + this.difficulty * 2; // 4-16 pairs
    const cards = [];
    
    for (let i = 0; i < pairCount; i++) {
      const symbol = SYMBOLS[i % SYMBOLS.length];
      cards.push({ id: i * 2, symbol, flipped: false });
      cards.push({ id: i * 2 + 1, symbol, flipped: false });
    }
    
    return { cards: this.rng.shuffle(cards) };
  }
}

// Phaser-based game example (Canvas rendering)
class PatternEchoGame extends Phaser.Scene {
  private engine: PatternEchoEngine;
  
  create() {
    this.engine = new PatternEchoEngine(this.game.config.seed);
    this.setupGrid();
    this.startRound();
  }
  
  startRound() {
    const sequence = this.engine.generateSequence();
    this.playSequence(sequence);
  }
}
```

### 7.3 Performance Optimization

#### 7.3.1 Bundle Optimization

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core app chunk
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Game engine (loaded on demand)
          'phaser': ['phaser'],
          
          // Charts (loaded on profile page)
          'charts': ['recharts', 'd3'],
          
          // Individual games (code-split)
          'game-memory': ['./src/games/memory/index.ts'],
          'game-logic': ['./src/games/logic/index.ts'],
          // ...
        }
      }
    },
    
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // PWA plugin configuration
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.dailybrain\.app/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400
              }
            }
          }
        ]
      }
    })
  ]
});
```

#### 7.3.2 Runtime Performance

```javascript
// Performance monitoring and optimization
const PerformanceManager = {
  // Metrics thresholds
  thresholds: {
    FCP: 1500,      // First Contentful Paint
    LCP: 2500,      // Largest Contentful Paint
    FID: 100,       // First Input Delay
    CLS: 0.1,       // Cumulative Layout Shift
    gameLoad: 500,  // Game load time
    frameTime: 16   // Target 60fps
  },
  
  // Monitor game performance
  measureGamePerformance(gameId) {
    const metrics = {
      loadTime: 0,
      averageFrameTime: 0,
      droppedFrames: 0,
      memoryUsage: 0
    };
    
    // Frame timing
    let frameCount = 0;
    let totalFrameTime = 0;
    let lastFrameTime = performance.now();
    
    const measureFrame = () => {
      const now = performance.now();
      const delta = now - lastFrameTime;
      
      totalFrameTime += delta;
      frameCount++;
      
      if (delta > 16.67) {
        metrics.droppedFrames++;
      }
      
      lastFrameTime = now;
    };
    
    return {
      measureFrame,
      getMetrics: () => ({
        ...metrics,
        averageFrameTime: totalFrameTime / frameCount
      })
    };
  },
  
  // Optimize for low-end devices
  async detectDeviceCapabilities() {
    const capabilities = {
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4,
      connection: navigator.connection?.effectiveType || '4g',
      gpu: await this.detectGPU()
    };
    
    // Adjust game settings based on capabilities
    return {
      usePhaser: capabilities.gpu !== 'low' && capabilities.memory >= 2,
      maxParticles: capabilities.memory >= 4 ? 100 : 30,
      animationQuality: capabilities.memory >= 4 ? 'high' : 'low',
      preloadCount: capabilities.connection === '4g' ? 7 : 3
    };
  }
};
```

### 7.4 Backend Architecture

```javascript
// Fastify server with tRPC
import Fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext, appRouter } from './trpc';

const server = Fastify({
  logger: true,
  http2: true
});

// tRPC setup
server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext }
});

// API routes
const routes = {
  // Daily challenge
  '/api/daily/:date': {
    GET: async (req) => {
      const { date } = req.params;
      return DailyContentResolver.resolve(new Date(date));
    }
  },
  
  // Submit result
  '/api/results': {
    POST: async (req) => {
      const result = req.body;
      await ResultsService.save(req.userId, result);
      const analysis = await AnalyticsService.analyze(result);
      const badges = await BadgeSystem.checkBadgeProgress(req.userId, result);
      return { analysis, badges };
    }
  },
  
  // Push subscription
  '/api/push/subscribe': {
    POST: async (req) => {
      const { subscription, preferences } = req.body;
      await PushService.subscribe(req.userId, subscription, preferences);
      return { success: true };
    }
  }
};
```

### 7.5 Database Schema (Prisma)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Stats
  brainScore        Int      @default(0)
  currentStreak     Int      @default(0)
  longestStreak     Int      @default(0)
  lastPlayDate      DateTime?
  totalGamesPlayed  Int      @default(0)
  
  // Tier
  currentTier       String   @default("bronze")
  
  // Relations
  results           GameResult[]
  badges            UserBadge[]
  pushSubscription  PushSubscription?
  preferences       UserPreferences?
  
  @@index([email])
  @@index([lastPlayDate])
}

model GameResult {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  gameId      String
  date        DateTime
  score       Int
  duration    Int      // milliseconds
  accuracy    Float
  levels      Int
  
  // Detailed performance
  progressData Json
  
  createdAt   DateTime @default(now())
  
  @@index([userId, date])
  @@index([gameId, date])
  @@index([date])
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  badgeId   String
  earnedAt  DateTime @default(now())
  
  @@unique([userId, badgeId])
  @@index([userId])
}

model DailyChallenge {
  id          String   @id @default(cuid())
  date        DateTime @unique
  gameId      String
  seed        Int
  difficulty  Int
  theme       String?
  specialEvent String?
  
  @@index([date])
}

model PushSubscription {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  endpoint     String
  keys         Json
  preferences  Json
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model UserPreferences {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id])
  timezone            String   @default("UTC")
  reminderTime        String   @default("09:00")
  difficulty          String   @default("adaptive")
  soundEnabled        Boolean  @default(true)
  hapticEnabled       Boolean  @default(true)
  
  updatedAt           DateTime @updatedAt
}
```

---

## 8. Implementation Roadmap

### Phase 1: MVP (Weeks 1-6)
- Core PWA infrastructure
- 6 initial games (1 per category)
- Basic streak system
- Daily challenge generation
- Simple progress tracking

### Phase 2: Engagement (Weeks 7-10)
- Full badge system
- Brain stats dashboard
- Push notifications
- Share functionality
- A2HS optimization

### Phase 3: Growth (Weeks 11-14)
- Remaining 14 games
- Tier system
- Leaderboards
- Social features
- Advanced analytics

### Phase 4: Monetization (Weeks 15-18)
- Premium features
- Streak freezes
- Extended game archive
- Advanced insights
- Family plans

---

## Appendix: Key Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| D1 Retention | >40% | Users returning day after first play |
| D7 Retention | >25% | Users active after 1 week |
| D30 Retention | >15% | Users active after 1 month |
| Avg. Session Duration | >3 min | Time spent per visit |
| Games per Session | >1.5 | Average games played |
| PWA Install Rate | >20% | A2HS conversions |
| Push Opt-in Rate | >30% | Notification permissions |
| Streak >7 Days | >40% | Users maintaining streaks |
| Share Rate | >10% | Results shared |
| NPS Score | >50 | Net Promoter Score |

---

*Document Version 1.0 | Created for Daily Brain PWA Project*
