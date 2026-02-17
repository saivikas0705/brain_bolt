# BrainBolt – Low-Level Design

## 1. Class / Module Responsibilities

### Backend

| Module | Responsibility |
|--------|----------------|
| `config` | Central config: difficulty bounds, scoring params, Redis/Mongo URLs, rate limit, TTLs. |
| `models/User` | User document (id string, createdAt). Supports client-provided UUID as _id. |
| `models/UserState` | Per-user quiz state: currentDifficulty, streak, maxStreak, totalScore, totalCorrect, totalAnswered, lastQuestionId, lastAnswerAt, stateVersion, recentCorrect (rolling window). |
| `models/Question` | Question document: difficulty, prompt, choices, correctAnswerHash, tags. |
| `models/AnswerLog` | Log per answer: userId, questionId, difficulty, answer, correct, scoreDelta, streakAtAnswer, idempotencyKey. |
| `models/LeaderboardScore` | userId → totalScore, updatedAt. |
| `models/LeaderboardStreak` | userId → maxStreak, updatedAt. |
| `services/adaptiveAlgorithm` | Computes next difficulty from correct, currentDifficulty, currentStreak, recentCorrect. Applies stabilizers (min streak to increase, rolling-window majority). |
| `services/scoreService` | Streak multiplier (capped), score delta from correct + difficulty + streak. |
| `services/cache` | Redis: user state cache, idempotency results, question pool IDs per difficulty. TTLs and invalidation. |
| `services/quizService` | getOrCreateUser, getOrCreateUserState, getNextQuestion, submitAnswer (idempotent), getMetrics. Orchestrates adaptive + score + leaderboard updates. |
| `services/leaderboardService` | getScoreLeaderboard, getStreakLeaderboard (top N). |
| `routes/quiz` | GET /v1/quiz/next, POST /v1/quiz/answer, GET /v1/quiz/metrics. |
| `routes/leaderboard` | GET /v1/leaderboard/score, GET /v1/leaderboard/streak. |
| `index` | Express app, CORS, JSON, rate limit, mount routes, Mongo connect, listen. |

### Frontend

| Module | Responsibility |
|--------|----------------|
| `design-system/tokens` | Design tokens (colors, spacing, typography, radius, shadows, breakpoints). |
| `design-system/globals.css` | CSS variables for light/dark, no hardcoded values in components. |
| `components/ui/*` | Reusable UI: Button, Card, ThemeToggle. Use tokens only. |
| `lib/api` | API client: fetchNextQuestion, submitAnswer, fetchMetrics, fetchScoreLeaderboard, fetchStreakLeaderboard, getUserId (localStorage). |
| `components/quiz/QuizPageClient` | Quiz flow: one question, choices, submit → feedback → next; score/streak cards; mini leaderboards; poll leaderboards. |
| `components/leaderboard/LeaderboardPageContent` | Full leaderboard page with SSR initial data + client polling. |

---

## 2. API Schemas

### GET /v1/quiz/next

- **Request:** Query `userId` (required), optional `sessionId`. Or header `x-user-id`.
- **Response:**  
  `questionId`, `difficulty`, `prompt`, `choices[]`, `sessionId`, `stateVersion`, `currentScore`, `currentStreak`.

### POST /v1/quiz/answer

- **Request body:**  
  `userId`, `sessionId`, `questionId`, `answer`, `stateVersion`, optional `answerIdempotencyKey`.
- **Response:**  
  `correct`, `newDifficulty`, `newStreak`, `scoreDelta`, `totalScore`, `stateVersion`, `leaderboardRankScore`, `leaderboardRankStreak`.

### GET /v1/quiz/metrics

- **Request:** Query or header `userId`.
- **Response:**  
  `currentDifficulty`, `streak`, `maxStreak`, `totalScore`, `accuracy`, `difficultyHistogram`, `recentPerformance`.

### GET /v1/leaderboard/score

- **Response:** `{ entries: [ { rank, userId, totalScore, updatedAt } ] }`.

### GET /v1/leaderboard/streak

- **Response:** `{ entries: [ { rank, userId, maxStreak, updatedAt } ] }`.

---

## 3. DB Schema and Indexes

- **users:** `_id` (String), `createdAt`.  
  Index: `_id` (default).
- **questions:** `_id`, `difficulty`, `prompt`, `choices`, `correctAnswerHash`, `tags`, `createdAt`.  
  Index: `difficulty`.
- **user_state:** `userId` (String, unique), `currentDifficulty`, `streak`, `maxStreak`, `totalScore`, `totalCorrect`, `totalAnswered`, `lastQuestionId`, `lastAnswerAt`, `stateVersion`, `recentCorrect[]`, `createdAt`, `updatedAt`.  
  Index: `userId`.
- **answer_log:** `userId`, `questionId`, `difficulty`, `answer`, `correct`, `scoreDelta`, `streakAtAnswer`, `answeredAt`, `idempotencyKey` (sparse unique).  
  Indexes: `userId`, `(userId, answeredAt desc)`.
- **leaderboard_score:** `userId` (unique), `totalScore`, `updatedAt`.  
  Index: `totalScore` desc.
- **leaderboard_streak:** `userId` (unique), `maxStreak`, `updatedAt`.  
  Index: `maxStreak` desc.

---

## 4. Cache Strategy

| Key pattern | TTL | Invalidation |
|------------|-----|--------------|
| `brainbolt:user_state:{userId}` | 600 s | On getNextQuestion (invalidate before returning so next read is from DB); on submitAnswer (after state update). |
| `brainbolt:idempotency:{userId}:{key}` | 86400 s | None (expire only). |
| `brainbolt:question_pool:{difficulty}` | 3600 s | Optional: on seed/update questions. |

- **Real-time:** User state is invalidated on every answer and on fetching next question, so the next request always gets fresh state from DB. Leaderboards are read from DB on each request; no cache for leaderboard lists to keep rankings current.

---

## 5. Pseudocode: Adaptive Algorithm

```
INPUT: correct (bool), currentDifficulty (1..10), currentStreak (int), recentCorrect (bool[])
OUTPUT: newDifficulty, updatedRecentCorrect

updatedRecentCorrect = last N of (recentCorrect + [correct])   // N = confidenceWindowSize

IF correct:
  canIncrease = (currentDifficulty < maxDifficulty) AND (currentStreak >= minStreakToIncreaseDifficulty)
  windowMajorityCorrect = (recentCorrect has >= half true) or window empty
  IF canIncrease AND windowMajorityCorrect:
    newDifficulty = min(maxDifficulty, currentDifficulty + 1)
  ELSE:
    newDifficulty = currentDifficulty
ELSE:
  newDifficulty = max(minDifficulty, currentDifficulty - 1)

RETURN newDifficulty, updatedRecentCorrect
```

Stabilizers: (1) Minimum streak required to increase difficulty. (2) Rolling window majority must be correct before increasing. (3) Wrong answer only decreases by one level.

---

## 6. Pseudocode: Score Calculation

```
streakMultiplier(streak) = min(maxStreakMultiplier, max(1, 1 + streak * streakMultiplierStep))

scoreDelta(correct, difficulty, streakBeforeAnswer):
  IF NOT correct: RETURN 0
  difficultyWeight = 0.5 + difficulty * 0.1
  RETURN round(baseScorePerCorrect * difficultyWeight * streakMultiplier(streakBeforeAnswer))
```

---

## 7. Leaderboard Update Strategy

- On every successful `submitAnswer`: update `user_state`, then upsert `leaderboard_score` (totalScore) and `leaderboard_streak` (maxStreak) for that user.
- Leaderboard reads: query `leaderboard_score` sorted by `totalScore` desc and `leaderboard_streak` by `maxStreak` desc; no caching so each request sees latest data.
- Rank for current user: count documents with strictly greater score/streak + 1.

---

## 8. Idempotency

- Client sends `answerIdempotencyKey` (or server derives from `questionId:answer:stateVersion`).
- Before applying answer: lookup Redis `idempotency:{userId}:{key}`. If present, return cached response and do not update state.
- After applying answer: store response in Redis with TTL.

---

## 9. Rate Limiting

- Express rate limit: window = 60 s, max = 120 requests per IP for `/v1/` routes.
