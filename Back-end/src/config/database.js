import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Demo connection string - replace with your actual MongoDB connection string
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/video-editor';
    
    // For MongoDB Atlas (cloud), your connection string would look like:
    // mongodb+srv://username:password@cluster.mongodb.net/video-editor?retryWrites=true&w=majority
    
    const conn = await mongoose.connect(mongoURI, {
      // These options are no longer needed in Mongoose 6+, but included for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('📴 MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

export default connectDB;