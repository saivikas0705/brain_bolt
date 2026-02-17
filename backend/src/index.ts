
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { config } from './config';
import quizRoutes from './routes/quiz';
import leaderboardRoutes from './routes/leaderboard';
import signupRoutes from './routes/signup';
import loginRoutes from './routes/login';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { error: 'Too many requests' },
});
app.use('/v1/', limiter);

app.use('/v1/quiz', quizRoutes);
app.use('/v1/leaderboard', leaderboardRoutes);
app.use('/v1/signup', signupRoutes);
app.use('/v1/login', loginRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

async function start() {
  await mongoose.connect(config.mongoUri);
  app.listen(config.port, () => {
    console.log(`BrainBolt API listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
