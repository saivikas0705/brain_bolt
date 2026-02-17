import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaderboardStreak extends Document {
  userId: string;
  maxStreak: number;
  updatedAt: Date;
}

const LeaderboardStreakSchema = new Schema<ILeaderboardStreak>(
  {
    userId: { type: String, required: true, unique: true },
    maxStreak: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'leaderboard_streak' }
);

LeaderboardStreakSchema.index({ maxStreak: -1 });

export const LeaderboardStreak: Model<ILeaderboardStreak> =
  mongoose.models.LeaderboardStreak ||
  mongoose.model<ILeaderboardStreak>('LeaderboardStreak', LeaderboardStreakSchema);
