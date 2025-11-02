import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const mongoDB_url = process.env.MONGODB_URL

if (!mongoDB_url) {
  throw new Error('MONGODB connection string is missing in the environment variables.')
}

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoDB_url)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    process.exit(1)
  }
}
