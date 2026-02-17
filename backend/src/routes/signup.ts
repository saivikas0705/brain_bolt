import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { config } from '../config';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password required (min 6 characters)' });
    }

    const existing = await User.findOne({ email }).exec();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const id = new mongoose.Types.ObjectId().toString();
    await User.create({
      _id: id,
      name: name || undefined,
      email: String(email).trim().toLowerCase(),
      passwordHash,
    });

    const token = jwt.sign(
      { userId: id, email: String(email).trim().toLowerCase() },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    res.status(201).json({ token, userId: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
