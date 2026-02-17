import { Router, Response } from 'express';
import { getNextQuestion, submitAnswer, getMetrics } from '../services/quizService';
import { authMiddleware, RequestWithAuth } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/next', async (req: RequestWithAuth, res: Response) => {
  try {
    const userId = req.userId;
    const sessionId = req.query.sessionId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const next = await getNextQuestion(userId, sessionId);
    if (!next) return res.status(404).json({ error: 'No question available' });
    res.json(next);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/answer', async (req: RequestWithAuth, res: Response) => {
  try {
    const { sessionId, questionId, answer, stateVersion, answerIdempotencyKey } = req.body;
    const uid = req.userId;
    if (!uid || !sessionId || !questionId || answer === undefined) {
      return res.status(400).json({ error: 'sessionId, questionId, answer required' });
    }
    const result = await submitAnswer(
      uid,
      sessionId,
      questionId,
      String(answer),
      Number(stateVersion) || 0,
      answerIdempotencyKey || `${questionId}:${answer}:${stateVersion}`
    );
    if (!result) return res.status(404).json({ error: 'Question not found or invalid state' });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/metrics', async (req: RequestWithAuth, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const metrics = await getMetrics(userId);
    res.json(metrics);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
