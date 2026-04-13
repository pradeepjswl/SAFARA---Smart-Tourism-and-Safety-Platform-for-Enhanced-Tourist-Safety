import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { router as api } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { router } from './modules/tourist/tourist.routes.js';

import { fileURLToPath } from 'url';


export const buildApp = () => {
  const app = express();
  app.set('trust proxy', true);
 // app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(cors({
  // frontend (Vite dev: 5173), authority dashboard (Vite dev: 5174), chatbot server (3001)
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3001',
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
 app.use(express.urlencoded({ extended: true, limit: '10mb' }));
 const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
  app.use(helmet());
  app.use(compression());
  //app.use(express.json());
 app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  app.use('/api/tourist', router);
  app.use('/api', api);


  // ... previous middleware and routes
app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err); // helpful during dev
  
  // Handle Prisma unique constraint violations (P2002)
  const isDupKey = err?.code === 'P2002';
  const status = err?.status || (err?.code === 'LIMIT_FILE_SIZE' ? 413 : (isDupKey ? 409 : 500));
  const message = err?.message || (isDupKey ? 'Duplicate record' : 'Server Error');
  res.status(status).json({ error: message });
});

  app.use(errorHandler);
  return app;
};
