const { Server } = require('socket.io');
const { verifyToken } = require('../config/jwt');
const logger = require('../utils/logger');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        socket.userId = decoded.userId;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.userId || 'guest'})`);

    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }
    socket.join('announcements');

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitToUser = (userId, event, payload) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, payload);
  }
};

const broadcastEvent = (event, payload) => {
  if (io) {
    io.emit(event, payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  broadcastEvent
};
