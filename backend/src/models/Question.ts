import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion extends Document {
  difficulty: number;
  prompt: string;
  choices: string[];
  correctAnswerHash: string;
  tags?: string[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    difficulty: { type: Number, required: true, index: true },
    prompt: { type: String, required: true },
    choices: { type: [String], required: true },
    correctAnswerHash: { type: String, required: true },
    tags: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'questions' }
);

export const Question: Model<IQuestion> =
  mongoose.models.Question ?? mongoose.model<IQuestion>('Question', QuestionSchema);
