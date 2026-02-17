import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    if (!password) return res.status(400).json({ error: 'Password required' });

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).exec();
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    if (!user.passwordHash) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(String(password), user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    res.json({ token, userId: user._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
