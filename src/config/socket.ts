import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './index.js';
import { User } from '../modules/users/user.model.js';
import clog from '../utils/customLog.js';

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
      clog.warn(`[Socket Auth] Connection rejected: No token provided (socket: ${socket.id})`);
      return next(new Error('Authentication error: token missing'));
    }
    
    try {
      const secret = (config as any).jwtSecret || (config as any).jwt?.secret || process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret as string) as any;
      
      const userId = decoded.id || decoded.userId;
      if (!userId) {
        clog.warn(`[Socket Auth] Connection rejected: Token missing user id (socket: ${socket.id})`);
        return next(new Error('Invalid token payload'));
      }
      
      (socket as any).user = { id: userId };
      next();
    } catch (err: any) {
      clog.warn(`[Socket Auth] Connection rejected: ${err.message} (socket: ${socket.id})`);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).user?.id;
    clog.info(`[Socket] Client connected: ${socket.id} (userId: ${userId})`);

    // Auto-join general telephony channel so all authenticated clients can monitor call events
    socket.join('telephony');

    if (userId) {
      // User joins a personal room to receive targeted messages
      socket.join(userId.toString());

      // Auto-join CCE extension room if user has one configured
      try {
        const user = await User.findById(userId).select('cceConfig').lean();
        if (user?.cceConfig?.extension) {
          const ext = String(user.cceConfig.extension).trim();
          socket.join(`extension:${ext}`);
          socket.join(ext);
          clog.info(`[Socket] Socket ${socket.id} joined extension rooms: "extension:${ext}", "${ext}"`);
        }
      } catch (e: any) {
        clog.warn(`[Socket] Error fetching user cceConfig for ${userId}:`, e?.message);
      }
    }

    // Allow manual join to extension room if needed
    socket.on('joinExtension', (extension: string) => {
      if (extension) {
        const ext = String(extension).trim();
        socket.join(`extension:${ext}`);
        socket.join(ext);
        clog.info(`[Socket] Socket ${socket.id} manually joined extension "${ext}"`);
      }
    });

    socket.on('leaveExtension', (extension: string) => {
      if (extension) {
        const ext = String(extension).trim();
        socket.leave(`extension:${ext}`);
        socket.leave(ext);
        clog.info(`[Socket] Socket ${socket.id} left extension "${ext}"`);
      }
    });
    
    socket.on('disconnect', (reason) => {
      clog.info(`[Socket] Client disconnected: ${socket.id} (reason: ${reason})`);
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
