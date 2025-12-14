import express from "express";
import cors from "cors";
import User from "./models/User.js";
import VideoProject from "./models/VideoProject.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cilpper Video Editor API is running!', 
    status: 'Connected to MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// Test database connection route
app.get('/api/test-db', async (req, res) => {
  try {
    // Try to count users (this will test the connection)
    const userCount = await User.countDocuments();
    const projectCount = await VideoProject.countDocuments();
    
    res.json({
      message: 'Database connection successful!',
      stats: {
        users: userCount,
        projects: projectCount
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

export default app;
