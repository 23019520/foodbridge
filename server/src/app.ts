import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listings.routes';
import orderRoutes from './routes/orders.routes';
import userRoutes from './routes/users.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // Required for cookies to be sent cross-origin
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Log every incoming request in development
if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
}

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/listings`, listingRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler);

export default app;
