import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserState extends Document {
  userId: mongoose.Types.ObjectId;
  currentDifficulty: number;
  streak: number;
  maxStreak: number;
  totalScore: number;
  totalCorrect: number;
  totalAnswered: number;
  lastQuestionId?: mongoose.Types.ObjectId;
  lastAnswerAt: Date;
  stateVersion: number;
  recentCorrect: boolean[];
  createdAt: Date;
  updatedAt: Date;
}

const UserStateSchema = new Schema<IUserState>(
  {
    userId: { type: Schema.Types.Mixed, required: true, unique: true },
    currentDifficulty: { type: Number, required: true, default: 1 },
    streak: { type: Number, required: true, default: 0 },
    maxStreak: { type: Number, required: true, default: 0 },
    totalScore: { type: Number, required: true, default: 0 },
    totalCorrect: { type: Number, required: true, default: 0 },
    totalAnswered: { type: Number, required: true, default: 0 },
    lastQuestionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    lastAnswerAt: { type: Date, default: Date.now },
    stateVersion: { type: Number, required: true, default: 0 },
    recentCorrect: { type: [Boolean], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'user_state' }
);

UserStateSchema.index({ userId: 1 });

export const UserState: Model<IUserState> =
  mongoose.models.UserState
    ? mongoose.models.UserState as Model<IUserState>
    : mongoose.model<IUserState>('UserState', UserStateSchema);
