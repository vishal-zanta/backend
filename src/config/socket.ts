import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './index.js';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const secret = (config as any).jwtSecret || (config as any).jwt?.secret || process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret as string) as any;
      
      const userId = decoded.id || decoded.userId;
      if (!userId) {
        return next(new Error('Invalid token payload'));
      }
      
      (socket as any).user = { id: userId };
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user.id;
    
    // User joins a personal room to receive targeted messages
    socket.join(userId.toString());
    
    socket.on('disconnect', () => {
      // Clean up if needed
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
