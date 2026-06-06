import http from 'http';
import app from './app';
import './types/auth.types'; 
import { env } from './config/env';
import { connectDB } from './config/db';
import { initializeSocket } from './socket/socketManager';

async function bootstrap() {
  await connectDB();

  const server = http.createServer(app);
  initializeSocket(server);
  server.listen(env.PORT, () => {
    console.log(`🚀 VedaAI Backend running on port: ${env.PORT}`);
    console.log(`🌐 Environment context: ${env.NODE_ENV}`);
  });
  const shutdown = () => {
    console.log('⚠️ Shutdown request caught. Terminating server instances...');
    server.close(() => {
      console.log('✅ Server connections terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Asynchronous Rejection:', promise, 'Reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception Caught:', err);
  process.exit(1);
});

bootstrap();
