// src/config/env.ts — REPLACE the existing file with this
// Fixed: removed MONGODB_URI (app uses SQLite/Prisma, not MongoDB)
import 'dotenv/config';
import { z } from 'zod';

const Env = z.object({
  NODE_ENV:               z.enum(['development', 'test', 'production']).default('development'),
  PORT:                   z.coerce.number().default(3000),
  ACCESS_TOKEN_SECRET:    z.string().default('safara_access_dev_secret_32chars!!'),
  REFRESH_TOKEN_SECRET:   z.string().default('safara_refresh_dev_secret_32chars!'),
  CORS_ORIGIN:            z.string().default('http://localhost:5173'),
  GOOGLE_CLIENT_ID:       z.string().optional(),
  CLOUDINARY_CLOUD_NAME:  z.string().optional(),
  CLOUDINARY_API_KEY:     z.string().optional(),
  CLOUDINARY_API_SECRET:  z.string().optional(),
  GEMINI_API_KEY:         z.string().optional(),
});

export const env = Env.parse(process.env);
