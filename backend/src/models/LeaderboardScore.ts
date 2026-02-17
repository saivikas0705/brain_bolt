import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaderboardScore extends Document {
  userId: string;
  totalScore: number;
  updatedAt: Date;
}

const LeaderboardScoreSchema = new Schema<ILeaderboardScore>(
  {
    userId: { type: String, required: true, unique: true },
    totalScore: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'leaderboard_score' }
);

LeaderboardScoreSchema.index({ totalScore: -1 });

export const LeaderboardScore: Model<ILeaderboardScore> =
  mongoose.models.LeaderboardScore ||
  mongoose.model<ILeaderboardScore>('LeaderboardScore', LeaderboardScoreSchema);
