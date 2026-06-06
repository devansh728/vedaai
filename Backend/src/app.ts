import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import groupRoutes from './routes/group.routes';
import assignmentRoutes from './routes/assignment.routes';

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigin = env.FRONTEND_URL?.replace(/\/$/, "");
      if (origin.replace(/\/$/, "") === allowedOrigin) {
        return callback(null, true);
      }
      
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/assignments', assignmentRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Target resource path not found: ${req.method} ${req.url}`,
  });
});

app.use(errorHandler);

export default app;
