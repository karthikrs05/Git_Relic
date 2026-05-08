import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/git-relic';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB not available, using JSON file storage:', error.message);
  }
}
