import { Router, Request, Response } from 'express';
import { getScoreLeaderboard, getStreakLeaderboard } from '../services/leaderboardService';

const router = Router();

router.get('/score', async (_req: Request, res: Response) => {
  try {
    const list = await getScoreLeaderboard();
    res.json({ entries: list });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/streak', async (_req: Request, res: Response) => {
  try {
    const list = await getStreakLeaderboard();
    res.json({ entries: list });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
