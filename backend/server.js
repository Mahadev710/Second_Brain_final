
// import dotenv from 'dotenv';
// dotenv.config();
// import authRoutes from './routes/authRoutes.js';
// import contentRoutes from './routes/contentRoutes.js';
// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';


// const requiredEnvVars = ['MONGO_URL', 'JWT_SECRET'];
// requiredEnvVars.forEach(envVar => {
//   if (!process.env[envVar]) {
//     console.error(`Error: ${envVar} environment variable is not set`);
//     process.exit(1);
//   }
// });

// const app = express();

// app.set('trust proxy', 1);


// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true
// }));

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: false }));


// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });


// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime()
//   });
// });


// app.use('/api/auth', authRoutes);
// app.use('/api/content', contentRoutes);



// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
  
//   if (err.name === 'ValidationError') {
//     return res.status(400).json({
//       message: 'Validation Error',
//       errors: Object.values(err.errors).map(e => e.message)
//     });
//   }
  
//   if (err.name === 'CastError') {
//     return res.status(400).json({ message: 'Invalid ID format' });
//   }
  
//   if (err.code === 11000) {
//     return res.status(400).json({ message: 'Duplicate field value entered' });
//   }
  
//   res.status(500).json({
//     message: 'Server Error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// const startServer = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log('MongoDB Connected...');
    
//     const PORT = process.env.PORT || 5000;
//     const server = app.listen(PORT, () => {
//       console.log(`Backend server running on port ${PORT}`);
//       console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//     });

//     process.on('unhandledRejection', (err) => {
//       console.error('Unhandled Promise Rejection:', err.message);
//       server.close(() => process.exit(1));
//     });

//   } catch (error) {
//     console.error('MongoDB Connection Error:', error);
//     process.exit(1);
//   }
// };

// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err.message);
//   process.exit(1);
// });

// startServer();

// export default app;

import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Validate required environment variables
const requiredEnvVars = ['MONGO_URL', 'JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} environment variable is not set`);
    process.exit(1);
  }
});

const app = express();

// Trust proxy if behind reverse proxy
app.set('trust proxy', 1);

// Enable CORS for all routes

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware to parse JSON and URL-encoded data

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Request logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);


// 404 handler
// app.all('*', (req, res) => {
//   res.status(404).json({ message: `Route ${req.originalUrl} not found` });
// });

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' });
  }
  
  res.status(500).json({
    message: 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB Connected...');
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Promise Rejection:', err.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();

export default app;
