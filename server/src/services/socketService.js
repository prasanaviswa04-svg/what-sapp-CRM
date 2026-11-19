let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  const env = require('../config/env');

  io = new Server(server, {
    cors: {
      origin: '*', // Allows local dev and deployed frontend
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // Client joins company-scoped room
    socket.on('join_company', (companyId) => {
      if (companyId) {
        socket.join(`company_${companyId}`);
      }
    });

    // Client joins specific conversation room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => {
  return io;
};

// Helper to emit events to a company room
const emitCompanyEvent = (companyId, eventName, data) => {
  if (io && companyId) {
    io.to(`company_${companyId}`).emit(eventName, data);
  }
};

// Helper to emit events to a specific conversation room
const emitConversationEvent = (conversationId, eventName, data) => {
  if (io && conversationId) {
    io.to(`conversation_${conversationId}`).emit(eventName, data);
  }
};

module.exports = { initSocket, getIO, emitCompanyEvent, emitConversationEvent };
