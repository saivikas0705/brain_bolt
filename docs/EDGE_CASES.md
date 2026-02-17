# BrainBolt – Edge Cases and Handling

## Adaptive Algorithm Edge Cases

| Edge case | Handling |
|-----------|----------|
| **Ping-pong (correct/wrong alternation)** | (1) Minimum streak required to increase difficulty (`minStreakToIncreaseDifficulty = 2`). (2) Rolling window: only increase if majority of last N answers are correct. So alternating correct/wrong never reaches “increase” condition. |
| **Difficulty at minimum (1)** | Wrong answer: `newDifficulty = max(1, current - 1)` stays 1. |
| **Difficulty at maximum (10)** | Correct answer: `newDifficulty = min(10, current + 1)` stays 10. |
| **First few answers (empty window)** | `windowMajorityCorrect` is true when window is empty, so only streak requirement blocks increase. |
| **Long wrong streak** | Difficulty drops by 1 per wrong answer until min; no sudden jump. |

## Scoring Edge Cases

| Edge case | Handling |
|-----------|----------|
| **Wrong answer** | scoreDelta = 0; no negative points. |
| **Streak 0** | Streak multiplier = 1. |
| **Very high streak** | Multiplier capped at `maxStreakMultiplier` (e.g. 3). |
| **Difficulty 1** | difficultyWeight = 0.6; still get positive points for correct. |
| **Accuracy** | totalCorrect / totalAnswered; 0 when totalAnswered = 0. |

## Streak Edge Cases

| Edge case | Handling |
|-----------|----------|
| **Wrong answer** | Streak resets to 0. |
| **Correct after wrong** | Streak becomes 1. |
| **Inactivity (e.g. 5 min)** | `applyStreakDecay`: if time since last answer ≥ threshold, streak set to 0 before next question. |
| **Max streak** | Tracked in user_state; never decreased except by reset/decay. |

## Idempotency

| Edge case | Handling |
|-----------|----------|
| **Duplicate submit (same question, same answer, same stateVersion)** | Same `answerIdempotencyKey` → Redis returns cached result; state and streak not updated again. |
| **Re-submit after page refresh** | Same idempotency key → same cached response. |

## Boundary / Consistency

| Edge case | Handling |
|-----------|----------|
| **No questions for difficulty** | Fallback: find any question for that difficulty; if none, return 404. |
| **Concurrent answers (same user)** | stateVersion check: if version changed, reload state and use latest; idempotency still prevents double credit for same key. |
| **New user (no state)** | getOrCreateUserState creates state with min difficulty, streak 0, etc. |
| **Leaderboard rank tie** | Rank = count(strictly greater) + 1; ties get same rank number, order by list position. |

## Operational

| Edge case | Handling |
|-----------|----------|
| **Redis down** | Cache misses; all reads/writes go to DB. Idempotency may be lost (duplicate submits could double-count; acceptable for resilience). |
| **Mongo down** | Requests fail; return 500. |
| **Rate limit exceeded** | 429 with message. |
