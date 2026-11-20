const http = require('http');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const logger = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');
const { initSocket } = require('./services/socket.service');
const prisma = require('./config/db');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows PDF and image previews from frontend
    contentSecurityPolicy: false // Handled independently for SPA flexibility
  })
);

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or callback(new Error('CORS blocked'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static files for local uploads (PDFs, study notes, images)
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// Apply general rate limiter to API
app.use('/api', generalLimiter);

// Mount main routes
app.use('/api', routes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'KSLU Circle API',
    tagline: 'Your Academic World, All in One Circle.',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`=======================================================`);
    logger.info(` KSLU Circle Backend running on port ${PORT}`);
    logger.info(` Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(` API Base URL: http://localhost:${PORT}/api`);
    logger.info(` Static Uploads: http://localhost:${PORT}/uploads`);
    logger.info(`=======================================================`);
  });
}

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down KSLU Circle Backend server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Database disconnected and server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = { app, server };
