import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnswerLog extends Document {
  userId: string;
  questionId: mongoose.Types.ObjectId;
  difficulty: number;
  answer: string;
  correct: boolean;
  scoreDelta: number;
  streakAtAnswer: number;
  answeredAt: Date;
  idempotencyKey?: string;
}

const AnswerLogSchema = new Schema<IAnswerLog>(
  {
    userId: { type: String, required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    difficulty: { type: Number, required: true },
    answer: { type: String, required: true },
    correct: { type: Boolean, required: true },
    scoreDelta: { type: Number, required: true },
    streakAtAnswer: { type: Number, required: true },
    answeredAt: { type: Date, default: Date.now },
    idempotencyKey: { type: String },
  },
  { collection: 'answer_log' }
);

AnswerLogSchema.index({ userId: 1, answeredAt: -1 });
AnswerLogSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

export const AnswerLog: Model<IAnswerLog> =
  mongoose.models.AnswerLog ?? mongoose.model<IAnswerLog>('AnswerLog', AnswerLogSchema);
