import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  _id: string;
  name?: string;
  email?: string;
  passwordHash?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String },
    email: { type: String, index: true, unique: true, sparse: true },
    passwordHash: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, collection: 'users' }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
