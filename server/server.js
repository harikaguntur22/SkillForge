import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import userSkillRoutes from './routes/userSkillRoutes.js';
import userRoutes from './routes/userRoutes.js';
import exchangeRoutes from './routes/exchangeRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendError, sendSuccess } from './utils/apiResponse.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security Headers
app.use(helmet());

// 2. CORS Policy
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        origin === CLIENT_URL ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// 5. HTTP Request Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 6. Rate Limiting for Auth Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 100, // accommodate test suite runs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication requests from this IP, please try again after 15 minutes.',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 7. System Health Check
app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  }, 'SkillForge API is running smoothly.');
});

// 8. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/user-skills', userSkillRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skill-exchange', exchangeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/projects', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/collaborations', collaborationRoutes);

// 9. 404 Handler for Unmatched API Routes
app.all('*', (req, res) => {
  return sendError(res, 404, `Cannot find route ${req.method} ${req.originalUrl} on this server.`);
});

// 10. Centralized Error Handler Middleware
app.use(errorHandler);

// 11. Database Connection and Server Startup
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[SkillForge Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[SkillForge Server] ⚠️ Port ${PORT} is already in use.`);
        console.error(`[SkillForge Server] Another server instance is currently listening on port ${PORT}.`);
        console.error(`[SkillForge Server] To resolve:\n  1. Stop any background node processes using port ${PORT}\n  2. Or set PORT=<another_port> in your .env file.\n`);
        process.exit(1);
      } else {
        console.error('[SkillForge Server] Server error:', err.message);
        process.exit(1);
      }
    });

    const handleShutdown = () => {
      console.log('\n[SkillForge Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[SkillForge Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  } catch (error) {
    console.error(`[SkillForge Server] Failed to start server:`, error.message);
    process.exit(1);
  }
};

startServer();

export default app;
