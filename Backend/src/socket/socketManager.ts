import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { env } from '../config/env';

let io: Server | null = null;
let pubSubClient: Redis | null = null;

export function initializeSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 WebSocket connection established: ${socket.id}`);

    socket.on('subscribe_to_assignment', (payload: { assignmentId: string }) => {
      const { assignmentId } = payload;
      if (assignmentId) {
        const roomName = `assignment:${assignmentId}`;
        socket.join(roomName);
        console.log(`👤 Socket ${socket.id} joined room channel: ${roomName}`);
        socket.emit('subscribed', { room: roomName });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket connection severed: ${socket.id}`);
    });
  });

  pubSubClient = new Redis(env.REDIS_URL);
  
  pubSubClient.subscribe('socket_broadcast', (err) => {
    if (err) {
      console.error('Failed to subscribe to Redis socket_broadcast channel:', err);
    } else {
      console.log('Active subscription on Redis socket_broadcast channel initialized.');
    }
  });

  pubSubClient.on('message', (channel, message) => {
    if (channel === 'socket_broadcast' && io) {
      try {
        const { room, event, data } = JSON.parse(message);
        if (room && event) {
          console.log(`[Redis PubSub Bridge] Redirecting event "${event}" to room "${room}"`);
          io.to(room).emit(event, data);
        }
      } catch (err) {
        console.error('Failed to process pub/sub bridge message:', err);
      }
    }
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io server context has not been configured.');
  }
  return io;
}
